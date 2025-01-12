// models/PlaceType.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PlaceType = sequelize.define('PlaceType', {
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
  tableName: 'place_types',
  timestamps: false,
});

setTimeout(() => {
    async function insertDefaultPlaceTypes() {
      const existingPlaceTypes = await PlaceType.findAll();
    
      if (existingPlaceTypes.length === 0) {
        await PlaceType.bulkCreate([
          { name: 'Restaurant' },
          { name: 'Café and Bar' },
          { name: 'Park and Natural Space' },
          { name: 'Workplace' },
          { name: 'Shop' },
          { name: 'Cultural Place' },
          { name: 'Transport and Travel' },
          { name: 'Friend' },
          { name: 'Home and Family' },
          { name: 'Health and Healthcare' },
          { name: 'Finance and Administrative' },
          { name: 'Other' },
        ]);
      }
    }
  
    insertDefaultPlaceTypes().then(() => {
      console.log('Default place types inserted successfully');
    }).catch((error) => {
      console.error('Error inserting default place types:', error);
    });
  }, 2000);
  
  

module.exports = PlaceType;
