// config/database.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME, // Database Name
  process.env.DB_USER, // Username
  process.env.DB_PASSWORD, // Password
  {
    host: process.env.DB_HOST, // Host
    dialect: 'mysql',
    port: process.env.DB_PORT || 3306, // MySQL Port
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    }
  }
);

module.exports = sequelize;
