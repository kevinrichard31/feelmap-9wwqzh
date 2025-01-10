const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Traits = sequelize.define('Traits', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  parent: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'traits',
  timestamps: false,
});

module.exports = Traits;
