'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add missing columns to book_chapter_submissions
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

    await queryInterface.addColumn('book_chapter_submissions', 'isbn', {
        type: Sequelize.STRING(30),
        allowNull: true,
    });

    await queryInterface.addColumn('book_chapter_submissions', 'doi', {
        type: Sequelize.STRING(100),
        allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('book_chapter_submissions', 'designatedEditorId');
    await queryInterface.removeColumn('book_chapter_submissions', 'isbn');
    await queryInterface.removeColumn('book_chapter_submissions', 'doi');
  }
};
