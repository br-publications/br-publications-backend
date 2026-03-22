'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 1. Check if fileData already exists
      const tableInfo = await queryInterface.describeTable('book_chapter_files');
      
      if (!tableInfo.fileData && !tableInfo.filedata) {
        await queryInterface.addColumn('book_chapter_files', 'fileData', {
          type: Sequelize.BLOB('long'),
          allowNull: true, // Allow true initially to not break existing records
        }, { transaction });
      }

      // 2. Make fileUrl optional since we are storing in DB now
      if (tableInfo.fileUrl || tableInfo.fileurl) {
        const colName = tableInfo.fileUrl ? 'fileUrl' : 'fileurl';
        await queryInterface.changeColumn('book_chapter_files', colName, {
          type: Sequelize.STRING(500),
          allowNull: true,
        }, { transaction });
      }

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const tableInfo = await queryInterface.describeTable('book_chapter_files');
      
      if (tableInfo.fileData || tableInfo.filedata) {
        const colName = tableInfo.fileData ? 'fileData' : 'filedata';
        await queryInterface.removeColumn('book_chapter_files', colName, { transaction });
      }

      if (tableInfo.fileUrl || tableInfo.fileurl) {
        const colName = tableInfo.fileUrl ? 'fileUrl' : 'fileurl';
        await queryInterface.changeColumn('book_chapter_files', colName, {
          type: Sequelize.STRING(500),
          allowNull: false,
        }, { transaction });
      }

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
