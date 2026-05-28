'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('published_book_chapters');
    
    if (!table.uid) {
      await queryInterface.addColumn('published_book_chapters', 'uid', {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: null,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('published_book_chapters');

    if (table.uid) {
      await queryInterface.removeColumn('published_book_chapters', 'uid');
    }
  }
};
