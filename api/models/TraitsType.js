const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Définir la table TraitTypes
const TraitsType = sequelize.define('TraitsType', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'trait_types',
  timestamps: false,
});

// Insérer les types par défaut
setTimeout(() => {
  async function insertDefaultTraitsType() {
    const existingTypes = await TraitsType.findAll();
    
    if (existingTypes.length === 0) {
      await TraitsType.bulkCreate([
        { name: 'health' },      // Santé
        { name: 'social' },      // Social
        { name: 'personality' },
        {name: 'interests'},
        {name: 'brands_mentionned'} // Personnalité
      ]);
    }
  }

  insertDefaultTraitsType().then(() => {
    console.log('Types par défaut insérés avec succès');
  }).catch((error) => {
    console.error('Erreur lors de l\'insertion des types par défaut:', error);
  });
}, 2000);

module.exports = TraitsType;
