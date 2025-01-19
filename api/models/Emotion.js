// models/Emotion.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const PlaceType = require('./PlaceType');  // Importer le modèle PlaceType

const Emotion = sequelize.define('Emotion', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  emotionName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 10000], // Limite la longueur entre 0 et 10 000 caractères
    }
  },
  emotionDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  amenity: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  placeTypeId: {  // Nouvelle clé étrangère pour lier à PlaceType
    type: DataTypes.INTEGER,
    references: {
      model: PlaceType,
      key: 'id',
    },
    allowNull: true,
    defaultValue: 12
  },
  placeTypeOther: {  // Champ supplémentaire pour un type de lieu personnalisé
    type: DataTypes.STRING,
    allowNull: true,  // Peut être nul si l'utilisateur ne remplit pas ce champ
  },
}, {
  tableName: 'emotions',
  timestamps: false,
});

// Relations
Emotion.belongsTo(User, { foreignKey: 'userId' });
Emotion.belongsTo(PlaceType, { foreignKey: 'placeTypeId' });  // Relation avec PlaceType

module.exports = Emotion;
