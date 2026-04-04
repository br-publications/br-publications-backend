'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Add 'proof_document' to the enum_book_chapter_files_fileType ENUM
      await queryInterface.sequelize.query(
        `ALTER TYPE "enum_book_chapter_files_fileType" ADD VALUE 'proof_document';`
      );
    } catch (error) {
      // Ignore if the value already exists
      if (error.message && !error.message.includes('already exists')) {
        throw error;
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Postgres doesn't easily allow removing values from ENUMs.
    // Leaving it as-is is standard practice for ENUM value additions.
    console.log('Postgres ENUM removals are not natively supported without rebuilding the type. Leaving added values.');
  }
};
