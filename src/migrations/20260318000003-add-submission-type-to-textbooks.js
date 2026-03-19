'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add isDirectSubmission and isBulkSubmission to text_book_submissions
    await queryInterface.addColumn('text_book_submissions', 'isDirectSubmission', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    });
    
    await queryInterface.addColumn('text_book_submissions', 'isBulkSubmission', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('text_book_submissions', 'isDirectSubmission');
    await queryInterface.removeColumn('text_book_submissions', 'isBulkSubmission');
  }
};
