'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('book_chapter_submissions');
    if (!table.editors) {
      await queryInterface.addColumn('book_chapter_submissions', 'editors', {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: null,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('book_chapter_submissions');
    if (table.editors) {
      await queryInterface.removeColumn('book_chapter_submissions', 'editors');
    }
  }
};
