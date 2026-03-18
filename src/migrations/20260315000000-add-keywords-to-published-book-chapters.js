'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('published_book_chapters', 'keywords', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: null,
      after: 'description'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('published_book_chapters', 'keywords');
  }
};