'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('emotions', 'city', {
      type: Sequelize.STRING,
      allowNull: true, // La colonne city est optionnelle
    });
    await queryInterface.addColumn('emotions', 'amenity', {
      type: Sequelize.STRING,
      allowNull: true, // La colonne amenity est optionnelle
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('emotions', 'city');
    await queryInterface.removeColumn('emotions', 'amenity');
  }
};
