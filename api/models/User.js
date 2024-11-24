const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Function to generate a random 10-character password
const generatePassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  password: {
    type: DataTypes.STRING(10), // Define the password field with 10 characters
    allowNull: false,
    defaultValue: () => generatePassword(), // Set default value using the generatePassword function
  },
}, {
  tableName: 'users',
  timestamps: false, // Disable automatic timestamps
});

module.exports = User;
