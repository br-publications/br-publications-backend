'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const table = await queryInterface.describeTable('book_chapters');
      
      // Case 1: is_published (snake_case) exists, rename it to isPublished
      if (table.is_published && !table.isPublished) {
        await queryInterface.renameColumn('book_chapters', 'is_published', 'isPublished', { transaction });
      } 
      // Case 2: isPublished (camelCase) does NOT exist, add it
      else if (!table.isPublished) {
        await queryInterface.addColumn('book_chapters', 'isPublished', {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
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
      const table = await queryInterface.describeTable('book_chapters');
      if (table.isPublished) {
        await queryInterface.removeColumn('book_chapters', 'isPublished', { transaction });
      }
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
