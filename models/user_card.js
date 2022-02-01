'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user_card extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  user_card.init({
    name:{
      type: DataTypes.STRING(10),
      allowNull: false
    },
    display_name:{
      type: DataTypes.STRING(10),
      allowNull: false
    },
    password:{
      type: DataTypes.STRING(10),
      allowNull: false
    },
    island_name:DataTypes.STRING(15),
    icon: DataTypes.STRING,
    fruit: DataTypes.STRING,
    code: DataTypes.INTEGER,
    bio: DataTypes.STRING(150)
  }, 
   {
    sequelize,
    modelName: 'user_card',
  });
  return user_card;
};