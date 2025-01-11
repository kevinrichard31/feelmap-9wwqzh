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

setTimeout(() => {
  async function insertDefaultLanguages() {
    const existingLanguages = await Lang.findAll();
  
    if (existingLanguages.length === 0) {
      await Lang.bulkCreate([
        { code: 'fr' },  // Français
        { code: 'en' },  // Anglais
        { code: 'br' },  // Brésil (portugais)
      ]);
    }
  }
  
  insertDefaultLanguages().then(() => {
    console.log('Langues par défaut insérées avec succès');
  }).catch((error) => {
    console.error('Erreur lors de l\'insertion des langues par défaut:', error);
  });
}, 2000);

module.exports = Lang;
