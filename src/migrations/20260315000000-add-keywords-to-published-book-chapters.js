'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('published_book_chapters');
    if (!table.keywords) {
      await queryInterface.addColumn('published_book_chapters', 'keywords', {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: null,
        after: 'description'
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('published_book_chapters');
    if (table.keywords) {
      await queryInterface.removeColumn('published_book_chapters', 'keywords');
    }
  }
};