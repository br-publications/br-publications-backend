'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('text_book_files');
    if (!table.fileData) {
      await queryInterface.addColumn('text_book_files', 'fileData', {
        type: Sequelize.BLOB('long'),
        allowNull: true
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('text_book_files');
    if (table.fileData) {
      await queryInterface.removeColumn('text_book_files', 'fileData');
    }
  }
};
