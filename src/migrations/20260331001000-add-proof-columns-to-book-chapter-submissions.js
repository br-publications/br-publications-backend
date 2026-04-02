'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('book_chapter_submissions');

    if (!table.proofStatus) {
      await queryInterface.addColumn('book_chapter_submissions', 'proofStatus', {
        type: Sequelize.ENUM('PENDING', 'SENT', 'ACCEPTED', 'REJECTED'),
        defaultValue: 'PENDING',
        allowNull: true,
      });
    }

    if (!table.authorProofNotes) {
      await queryInterface.addColumn('book_chapter_submissions', 'authorProofNotes', {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('book_chapter_submissions');

    if (table.proofStatus) {
      await queryInterface.removeColumn('book_chapter_submissions', 'proofStatus');
      // Note: Typically you'd also drop the ENUM type, but dropType might fail if shared.
    }

    if (table.authorProofNotes) {
      await queryInterface.removeColumn('book_chapter_submissions', 'authorProofNotes');
    }
  }
};
