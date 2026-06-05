'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Remove description_pdf from published_books
    try {
        await queryInterface.removeColumn('published_books', 'description_pdf');
    } catch (e) {
        console.warn('Column description_pdf may not exist on published_books:', e.message);
    }

    // 2. Add pdf_unique_id to published_books
    await queryInterface.addColumn('published_books', 'pdf_unique_id', {
      type: Sequelize.STRING(4),
      allowNull: true,
    });

    // 3. Create published_book_pdfs table
    await queryInterface.createTable('published_book_pdfs', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      book_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'published_books',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      pdf_data: {
        type: Sequelize.BLOB('long'),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      }
    });
  },

  async down(queryInterface, Sequelize) {
    // 1. Drop published_book_pdfs table
    await queryInterface.dropTable('published_book_pdfs');

    // 2. Remove pdf_unique_id from published_books
    await queryInterface.removeColumn('published_books', 'pdf_unique_id');

    // 3. Add description_pdf back to published_books
    await queryInterface.addColumn('published_books', 'description_pdf', {
      type: Sequelize.BLOB('long'),
      allowNull: true,
    });
  }
};
