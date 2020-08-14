const config = require('./index');

const developmentDB = {
  database: config.db.database,
  username: config.db.username,
  password: config.db.password,
  host: config.db.host,
  port: config.db.port,
  dialect: config.db.dialect,
}

module.exports = {
  developmentDB,
};