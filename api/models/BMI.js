const Sequelize = require('sequelize');
const { db } = require('../../config/database')

const BMI = db.define('BMI', {
  Id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
    field: 'id',
  },
  gender: {
    type: Sequelize.STRING,
    allowNull: false,
    field: 'gender',
  },
  month: {
    type: Sequelize.INTEGER,
    allowNull: false,
    field: 'month',
  },
  P01: {
    type: Sequelize.FLOAT,
    allowNull: false,
    field: 'p01'
  },
  P1: {
    type: Sequelize.FLOAT,
    allowNull: false,
    field: 'p1'
  },
  P3: {
    type: Sequelize.FLOAT,
    allowNull: false,
    field: 'p3'
  },
  P5: {
    type: Sequelize.FLOAT,
    allowNull: false,
    field: 'p5'
  },
  P10: {
    type: Sequelize.FLOAT,
    allowNull: false,
    field: 'p10'
  },
  P15: {
    type: Sequelize.FLOAT,
    allowNull: false,
    field: 'p15'
  },
  P25: {
    type: Sequelize.FLOAT,
    allowNull: false,
    field: 'p25'
  },
  P50: {
    type: Sequelize.FLOAT,
    allowNull: false,
    field: 'p50'
  },
  P75: {
    type: Sequelize.FLOAT,
    allowNull: false,
    field: 'p75'
  },
  P85: {
    type: Sequelize.FLOAT,
    allowNull: false,
    field: 'p85'
  },
  P90: {
    type: Sequelize.FLOAT,
    allowNull: false,
    field: 'p90'
  },
  P95: {
    type: Sequelize.FLOAT,
    allowNull: false,
    field: 'p95'
  },
  P97: {
    type: Sequelize.FLOAT,
    allowNull: false,
    field: 'p97'
  },
  P99: {
    type: Sequelize.FLOAT,
    allowNull: false,
    field: 'p99'
  },
  P999: {
    type: Sequelize.FLOAT,
    allowNull: false,
    field: 'p999'
  },
}, { tableName: 'bmi', timestamps: false})

module.exports = {
  BMI,
}
