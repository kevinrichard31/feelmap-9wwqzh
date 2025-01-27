const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Emotion = require('./Emotion');
const Traits = require('./Traits');

const EmotionHasTraits = sequelize.define('EmotionHasTraits', {
  emotion_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: Emotion,
      key: 'id',
    }
  },
  traits_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: Traits,
      key: 'id',
    }
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'emotion_has_traits',
  timestamps: false,
});

module.exports = EmotionHasTraits;
