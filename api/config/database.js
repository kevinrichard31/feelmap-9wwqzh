// config/database.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME, // Nom de la base de données
  process.env.DB_USER, // Utilisateur
  process.env.DB_PASSWORD, // Mot de passe
  {
    host: process.env.DB_HOST, // Hôte (en local, cela peut être 'localhost')
    dialect: 'postgres', // Changer MySQL en PostgreSQL
    port: process.env.DB_PORT || 5432, // Port PostgreSQL (le port par défaut est 5432)
    define: {
      charset: 'utf8', // PostgreSQL utilise un encodage UTF-8 par défaut
      collate: 'utf8_unicode_ci', // Cela peut être ignoré pour PostgreSQL
    },
    logging: false
  }

  
);

module.exports = sequelize;
