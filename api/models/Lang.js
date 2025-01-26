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
    const defaultLanguages = [
      { code: 'fr' },  // Français
      { code: 'en' },  // Anglais
      { code: 'br' },
      { code: 'jp' }
    ];
    
    try {
      const existingLanguages = await Lang.findAll();
      const existingCodes = existingLanguages.map(lang => lang.code);

      // Filtrer les langues qui n'existent pas encore dans la base de données
      const languagesToInsert = defaultLanguages.filter(
        lang => !existingCodes.includes(lang.code)
      );

      if (languagesToInsert.length > 0) {
        await Lang.bulkCreate(languagesToInsert);
        console.log('Langues manquantes insérées avec succès');
      } else {
        console.log('Aucune langue manquante à insérer');
      }
    } catch (error) {
      console.error('Erreur lors de l\'insertion des langues par défaut:', error);
    }
  }

  insertDefaultLanguages();
}, 2000);


module.exports = Lang;
