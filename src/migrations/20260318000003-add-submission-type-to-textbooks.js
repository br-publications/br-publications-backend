'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add isDirectSubmission and isBulkSubmission to text_book_submissions (idempotent)
    const table = await queryInterface.describeTable('text_book_submissions');

    if (!table.isDirectSubmission) {
      await queryInterface.addColumn('text_book_submissions', 'isDirectSubmission', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      });
    }

    if (!table.isBulkSubmission) {
      await queryInterface.addColumn('text_book_submissions', 'isBulkSubmission', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('text_book_submissions');
    if (table.isDirectSubmission) {
      await queryInterface.removeColumn('text_book_submissions', 'isDirectSubmission');
    }
    if (table.isBulkSubmission) {
      await queryInterface.removeColumn('text_book_submissions', 'isBulkSubmission');
    }
  }
};
