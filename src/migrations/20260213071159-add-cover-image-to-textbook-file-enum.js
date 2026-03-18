'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add 'COVER_IMAGE' to the enum
    // Note: PostgreSQL requires this raw query to update enums
    return queryInterface.sequelize.query('ALTER TYPE "enum_text_book_files_fileType" ADD VALUE \'COVER_IMAGE\'');
  },

  async down(queryInterface, Sequelize) {
    // Enum values cannot be removed in Postgres easily
    // This is irreversible without recreating the type
    return Promise.resolve();
  }
};
