'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add missing columns to communication_templates
    await queryInterface.addColumn('communication_templates', 'htmlContent', {
        type: Sequelize.TEXT,
        allowNull: true,
    });

    await queryInterface.addColumn('communication_templates', 'contentMode', {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: 'rich',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('communication_templates', 'htmlContent');
    await queryInterface.removeColumn('communication_templates', 'contentMode');
  }
};
