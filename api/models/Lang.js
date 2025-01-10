const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Lang = sequelize.define('Lang', {
  id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  code: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
}, {
  tableName: 'lang',
  timestamps: false,
});

module.exports = Lang;
