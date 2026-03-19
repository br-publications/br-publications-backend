'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add missing columns to book_chapter_submissions
    const table = await queryInterface.describeTable('book_chapter_submissions');

    if (!table.designatedEditorId) {
      await queryInterface.addColumn('book_chapter_submissions', 'designatedEditorId', {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
              model: 'users',
              key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
      });
    }

    if (!table.isbn) {
      await queryInterface.addColumn('book_chapter_submissions', 'isbn', {
          type: Sequelize.STRING(30),
          allowNull: true,
      });
    }

    if (!table.doi) {
      await queryInterface.addColumn('book_chapter_submissions', 'doi', {
          type: Sequelize.STRING(100),
          allowNull: true,
      });
    }
  },
  down: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('book_chapter_submissions');
    if (table.designatedEditorId) {
      await queryInterface.removeColumn('book_chapter_submissions', 'designatedEditorId');
    }
    if (table.isbn) {
      await queryInterface.removeColumn('book_chapter_submissions', 'isbn');
    }
    if (table.doi) {
      await queryInterface.removeColumn('book_chapter_submissions', 'doi');
    }
  }
};
