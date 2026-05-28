'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('published_books');
    
    if (!table.keywords) {
      await queryInterface.addColumn('published_books', 'keywords', {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: null,
      });
    }

    if (!table.uid) {
      await queryInterface.addColumn('published_books', 'uid', {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: null,
      });
    }

    if (!table.description_pdf) {
      await queryInterface.addColumn('published_books', 'description_pdf', {
        type: Sequelize.BLOB('long'),
        allowNull: true,
        defaultValue: null,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('published_books');

    if (table.keywords) {
      await queryInterface.removeColumn('published_books', 'keywords');
    }

    if (table.uid) {
      await queryInterface.removeColumn('published_books', 'uid');
    }

    if (table.description_pdf) {
      await queryInterface.removeColumn('published_books', 'description_pdf');
    }
  }
};
