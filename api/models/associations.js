// models/associations.js
const Emotion = require('./Emotion');
const Traits = require('./Traits');
const EmotionHasTraits = require('./EmotionHasTraits');

// Configuration des associations many-to-many
function setupAssociations() {
    Traits.hasMany(EmotionHasTraits, {
        foreignKey: 'traits_id',
        as: 'EmotionHasTraits'
    });

   Emotion.hasMany(EmotionHasTraits, {
       foreignKey: 'emotion_id',
    });
    
    EmotionHasTraits.belongsTo(Traits, {
      foreignKey: 'traits_id',
    });
    EmotionHasTraits.belongsTo(Emotion, {
        foreignKey: 'emotion_id',
    });
}

module.exports = setupAssociations;