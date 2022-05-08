const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const User = sequelize.define('user', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNUll: false,
    primaryKey: true
  },
  name:{
      type:Sequelize.STRING,
      allowNUll:false
  },
  email:{
      type:Sequelize.STRING,
      allowNUll:false,
      uniqueKey:true
  }
});

module.exports = User;