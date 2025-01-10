const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Lang = require('./Lang');

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
  lang_id: {
    type: DataTypes.BIGINT,
    references: {
      model: Lang,
      key: 'id',
    }
  },
  password: {
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue: () => generatePassword(),
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  language: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  tableName: 'users',
  timestamps: false,
});

User.belongsTo(Lang, { foreignKey: 'lang_id' });

module.exports = User;