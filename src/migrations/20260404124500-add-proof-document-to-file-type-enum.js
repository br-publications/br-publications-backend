'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.changeColumn('book_chapter_files', 'fileType', {
        type: Sequelize.ENUM(
          'initial_manuscript',
          'full_chapter',
          'revision_1',
          'revision_2',
          'revision_3',
          'final_approved',
          'proof_document'
        ),
        allowNull: false
      });
    } catch (error) {
      console.log('⚠️ book_chapter_files fileType ENUM update skipped:', error.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.log('MySQL ENUM removals are not done here safely without data loss. Leaving added values.');
  }
};
