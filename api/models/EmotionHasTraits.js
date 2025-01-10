const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Emotion = require('./Emotion');
const Traits = require('./Traits');

const EmotionHasTraits = sequelize.define('EmotionHasTraits', {
  emotion_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Emotion,
      key: 'id',
    }
  },
  traits_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Traits,
      key: 'id',
    }
  },
  score: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
}, {
  tableName: 'emotion_has_traits',
  timestamps: false,
});

Emotion.belongsToMany(Traits, { through: EmotionHasTraits, foreignKey: 'emotion_id' });
Traits.belongsToMany(Emotion, { through: EmotionHasTraits, foreignKey: 'traits_id' });

module.exports = EmotionHasTraits;
