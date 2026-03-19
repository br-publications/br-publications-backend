'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('users');
    if (!table.scopusLink) {
      await queryInterface.addColumn('users', 'scopusLink', {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null,
        after: 'website'
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('users');
    if (table.scopusLink) {
      await queryInterface.removeColumn('users', 'scopusLink');
    }
  }
};
