const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Traits = require('./Traits');
const Lang = require('./Lang');

const TraitsHasLang = sequelize.define('TraitsHasLang', {
  lang_id: {
    type: DataTypes.BIGINT,
    references: {
      model: Lang,
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
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'traits_has_lang',
  timestamps: false,
});

Traits.belongsToMany(Lang, { through: TraitsHasLang, foreignKey: 'traits_id' });
Lang.belongsToMany(Traits, { through: TraitsHasLang, foreignKey: 'lang_id' });

module.exports = TraitsHasLang;
