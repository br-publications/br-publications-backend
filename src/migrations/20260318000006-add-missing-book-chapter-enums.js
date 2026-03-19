'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add missing enum values for book_chapter_submissions_status
    const missingStatuses = [
        'ABSTRACT_SUBMITTED',
        'MANUSCRIPTS_PENDING',
        'REVIEWER_ASSIGNMENT',
        'EDITORIAL_REVIEW',
        'ISBN_APPLIED',
        'PUBLICATION_IN_PROGRESS'
    ];

    for (const status of missingStatuses) {
        try {
            await queryInterface.sequelize.query(
                `ALTER TYPE "enum_book_chapter_submissions_status" ADD VALUE '${status}';`
            );
        } catch (error) {
            // Ignore if the value already exists
            if (error.message && !error.message.includes('already exists')) {
                throw error;
            }
        }
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Postgres doesn't easily allow removing values from ENUMs.
    // It requires creating a new ENUM type, recreating columns, etc.
    // It's standard practice to leave "down" empty for adding ENUM values.
    console.log('Postgres ENUM removals are not natively supported without rebuilding the type. Leaving added values.');
  }
};
