// Imports
const http = require('http');
const express = require('express');
const { select } = require('async');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const { Sequelize, Model, DataTypes, Op } = require('sequelize');
const sequelize = new Sequelize("sqlite::memory:");
const {user_card} = require('./models');

//Globals
const saltRounds = 10;
const hostname = '127.0.0.1';
const port = 3000;

//App and server
const app = express();
const server = http.createServer(app);

//App.use
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(express.static(__dirname + '/public'));

// lol what am I doing 


app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('./index')
});

app.get('/profile', async (req, res) => {


    let allUsers;
    try{
        allUsers = await user_card.findAll({
            attributes: { exclude: ['updatedAt', 'password'] }
        });
    } catch (err) {
        console.log(err);
        return res.status(401).send(); //exit the method
    }
    console.log(allUsers);
    res.render('profile',{publicData:allUsers});
});

function navigateToProfile(userData, res) {
    console.log(userData);
    res.render('/profile',{userData:userData});
}


app.get('/create', async function(req,res) {
    const display_name = req.query.create_name;
    const name = display_name.toUpperCase();
    const password = req.query.create_password;
    const island_name = req.query.create_island;
    const fruit = req.query.fruit;
    const code = req.query.sw_code;
    const bio = req.query.create_bio;
    const icon = req.query.icon;

    bcrypt.hash(password, saltRounds, async (err,hash) => {
        if (err){
            console.log(err)
            return;
        }

        try{
            const user = await user_card.findAll({
                attributes: ['name'],
                where: {
                  name: name
                }
            });

            if(user.length > 0) {
                //You can make it error here or something to make it show up in the UI
                throw 'Duplicate User';
            }

            const userData = {
                display_name,
                name,
                password:hash,
                island_name,
                fruit,
                code,
                bio,
                icon
            }
            const newUser = await user_card.create({
                display_name,
                name,
                password:hash,
                island_name,
                fruit,
                code,
                bio,
                icon
            });

            console.log(userData);
            
        }
        catch (e) {
            console.log(e);
        }
    });
});

//Called when the user tries to log in.
app.post('/profile/auth', async function(req,res) {
    console.log("Login Attempt:", req.body);
    const name = req.body.name.toUpperCase();
    const password = req.body.password;
    let user;
    try {
        //user_card is the table, this is how sequalize finds the right table to pull from
        //get the hash from the db for this user, it's a list so I grab the first element 
        user = await user_card.findAll({
            attributes: { exclude: ['createdAt', 'updatedAt'] },
            where: {
              name: name
            }
        });
    } catch (e) {
        console.log(e);
        return res.status(401).send(); //exit the method
    }

    if (!user[0]) {
        return res.status(401).send(); //exit the method
    }
    bcrypt.compare(password, user[0].dataValues.password, async function(err, res2) {
        if (err){
          console.log(err);
          return;
        }

        if (res2) {
            let allUsers;
            try{
                allUsers = await user_card.findAll({
                    attributes: { 
                        exclude: ['updatedAt', 'password'] 
                    },
                    where: {
                        name: {
                            [Op.not]: user[0].dataValues.name
                        }
                    }
                });
            } catch (err) {
                console.log(err);
                return res.status(401).send(); //exit the method
            }
            //If the user is authenticaed properly, navigate to the next page with the User data and other users (minus password hashes)
            res.render('profile',{userData:user[0].dataValues, publicData:allUsers});
        } 
    });
});


server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
