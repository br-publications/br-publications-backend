'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add missing columns to communication_templates
    const table = await queryInterface.describeTable('communication_templates');

    if (!table.htmlContent) {
      await queryInterface.addColumn('communication_templates', 'htmlContent', {
          type: Sequelize.TEXT,
          allowNull: true,
      });
    }

    if (!table.contentMode) {
      await queryInterface.addColumn('communication_templates', 'contentMode', {
          type: Sequelize.STRING(10),
          allowNull: false,
          defaultValue: 'rich',
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('communication_templates');
    if (table.htmlContent) {
      await queryInterface.removeColumn('communication_templates', 'htmlContent');
    }
    if (table.contentMode) {
      await queryInterface.removeColumn('communication_templates', 'contentMode');
    }
  }
};
