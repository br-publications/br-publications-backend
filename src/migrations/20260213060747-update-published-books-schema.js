'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const table = await queryInterface.describeTable('published_books');

      // Add textBookSubmissionId column (idempotent)
      if (!table.textBookSubmissionId) {
        await queryInterface.addColumn(
          'published_books',
          'textBookSubmissionId',
          {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: 'text_book_submissions', // Ensure this table name is correct
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
          { transaction }
        );
      }

      // Add bookType column (idempotent)
      if (!table.bookType) {
        await queryInterface.addColumn(
          'published_books',
          'bookType',
          {
            type: Sequelize.ENUM('CHAPTER', 'TEXTBOOK'),
            allowNull: false,
            defaultValue: 'CHAPTER', // Assume existing records are chapters
          },
          { transaction }
        );
      }

      // Ensure submission_id is nullable (it might already be, but good to ensure for textbooks)
      await queryInterface.changeColumn(
        'published_books',
        'submission_id',
        {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        { transaction }
      );

      // Update text_book_submissions status enum locally if needed (not here, handled in code)

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const table = await queryInterface.describeTable('published_books');

      if (table.textBookSubmissionId) {
        await queryInterface.removeColumn('published_books', 'textBookSubmissionId', { transaction });
      }
      if (table.bookType) {
        await queryInterface.removeColumn('published_books', 'bookType', { transaction });
      }

      // Identify constraint name if needed to drop enum type? Postgres keeps enum types even if column dropped.
      // MySQL drops enums automatically when dropping the column.
      // await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_published_books_bookType";', { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
