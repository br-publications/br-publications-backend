'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('text_book_files', 'filePath', {
        type: Sequelize.STRING(500),
        allowNull: true // Allow null for DB-stored files
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Note: Reverting this might fail if there are already null records
    await queryInterface.changeColumn('text_book_files', 'filePath', {
        type: Sequelize.STRING(500),
        allowNull: false
    });
  }
};
