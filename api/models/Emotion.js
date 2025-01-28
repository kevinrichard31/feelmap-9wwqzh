const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const PlaceType = require('./PlaceType');

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
            len: [0, 10000],
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
    placeTypeId: {
        type: DataTypes.INTEGER,
        references: {
            model: PlaceType,
            key: 'id',
        },
        allowNull: true
    },
    placeTypeOther: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    aiResponse: {
        type: DataTypes.JSONB,
        allowNull: true,
    },
    advice: {  // Nouvelle colonne pour l'avis
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'emotions',
    timestamps: false,
});

Emotion.belongsTo(User, { foreignKey: 'userId' });
Emotion.belongsTo(PlaceType, { foreignKey: 'placeTypeId' });

module.exports = Emotion;