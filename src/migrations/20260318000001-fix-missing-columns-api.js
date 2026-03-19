'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Add missing columns to published_books
      await queryInterface.addColumn('published_books', 'is_hidden', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      }, { transaction });

      await queryInterface.addColumn('published_books', 'is_featured', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      }, { transaction });

      // Add missing columns to published_book_chapters
      await queryInterface.addColumn('published_book_chapters', 'editors', {
        type: Sequelize.JSONB,
        allowNull: true,
      }, { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('published_books', 'is_hidden', { transaction });
      await queryInterface.removeColumn('published_books', 'is_featured', { transaction });
      await queryInterface.removeColumn('published_book_chapters', 'editors', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
