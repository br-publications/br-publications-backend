'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Add missing columns to published_books (idempotent)
      const publishedBooksTable = await queryInterface.describeTable('published_books');
      if (!publishedBooksTable.is_hidden) {
        await queryInterface.addColumn(
          'published_books',
          'is_hidden',
          {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
          },
          { transaction }
        );
      }

      if (!publishedBooksTable.is_featured) {
        await queryInterface.addColumn(
          'published_books',
          'is_featured',
          {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
          },
          { transaction }
        );
      }

      // Add missing columns to published_book_chapters (idempotent)
      const publishedBookChaptersTable = await queryInterface.describeTable('published_book_chapters');
      if (!publishedBookChaptersTable.editors) {
        await queryInterface.addColumn(
          'published_book_chapters',
          'editors',
          {
            type: Sequelize.JSONB,
            allowNull: true,
          },
          { transaction }
        );
      }

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const publishedBooksTable = await queryInterface.describeTable('published_books');
      if (publishedBooksTable.is_hidden) {
        await queryInterface.removeColumn('published_books', 'is_hidden', { transaction });
      }
      if (publishedBooksTable.is_featured) {
        await queryInterface.removeColumn('published_books', 'is_featured', { transaction });
      }

      const publishedBookChaptersTable = await queryInterface.describeTable('published_book_chapters');
      if (publishedBookChaptersTable.editors) {
        await queryInterface.removeColumn('published_book_chapters', 'editors', { transaction });
      }

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
