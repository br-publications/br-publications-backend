'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Update comment for published_book_chapters
    await queryInterface.changeColumn('published_book_chapters', 'author_biographies', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: null,
      comment: '[{ "authorName": "...", "affiliation": "...", "email": "...", "biography": "..." }]'
    });

    // Update comment for published_books
    await queryInterface.changeColumn('published_books', 'author_biographies', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: {},
      comment: 'Record<string, { "authorName": "...", "affiliation": "...", "email": "...", "biography": "..." }>'
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert comment for published_book_chapters
    await queryInterface.changeColumn('published_book_chapters', 'author_biographies', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: null,
      comment: '[{ "authorName": "...", "email": "...", "biography": "..." }]'
    });

    // Revert comment for published_books
    await queryInterface.changeColumn('published_books', 'author_biographies', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: {},
      comment: 'Record<string, { "authorName": "...", "email": "...", "biography": "..." }>'
    });
  }
};
