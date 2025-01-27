const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const TraitsType = require('./TraitsType'); // Importation de TraitTypes

// Définir la table Traits avec une clé étrangère vers TraitTypes
const Traits = sequelize.define('Traits', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  parent: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  typeId: {
    type: DataTypes.INTEGER,
    references: {
      model: TraitsType, // Référence à la table TraitTypes
      key: 'id',         // Clé primaire de TraitTypes
    },
    allowNull: false,
  },
}, {
  tableName: 'traits',
  timestamps: false,
});

// Définir la relation entre Traits et TraitTypes
Traits.belongsTo(TraitsType, { foreignKey: 'typeId' });
TraitsType.hasMany(Traits, { foreignKey: 'typeId' });
module.exports = Traits;
