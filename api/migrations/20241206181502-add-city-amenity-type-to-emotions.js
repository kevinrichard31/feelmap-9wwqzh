'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('emotions', 'type', {
      type: Sequelize.STRING,
      allowNull: true, // Si vous voulez que cette colonne puisse être nulle
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('emotions', 'type');
  }
};
