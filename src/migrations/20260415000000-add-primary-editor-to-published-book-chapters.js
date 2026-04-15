'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('published_book_chapters');
    
    // Add primary_editor if it doesn't exist
    if (!table.primary_editor) {
      await queryInterface.addColumn('published_book_chapters', 'primary_editor', {
        type: Sequelize.STRING(200),
        allowNull: true,
        after: 'editors' // Ideally placed after the editors column
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('published_book_chapters');
    
    if (table.primary_editor) {
      await queryInterface.removeColumn('published_book_chapters', 'primary_editor');
    }
  }
};
