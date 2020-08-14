const Sequelize = require('sequelize');
const { developmentDB } = require('./connection');

const db = new Sequelize(
  developmentDB.database,
  developmentDB.username,
  developmentDB.password, {
    host: developmentDB.host,
    dialect: developmentDB.dialect,
    port: developmentDB.port,
    pool: {
      max: 5,
      min: 0,
      idle: 5000, 
    },
    logging: true,
  },
);

module.exports = {
  db,
};