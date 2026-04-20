'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Sequelize auto-names constraints. We'll try to find the one for submission_id.
      // In MySQL, it's often 'publishing_drafts_submission_id_foreign_idx' or similar.
      // But more likely 'publishing_drafts_ibfk_2'.
      // We will use changeColumn which works on most dialects to remove references.
      await queryInterface.changeColumn('publishing_drafts', 'submission_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
      });

      // Special handling for MySQL/MariaDB to explicitly drop the constraint if it persists
      const [results] = await queryInterface.sequelize.query(
        "SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_NAME = 'publishing_drafts' AND COLUMN_NAME = 'submission_id' AND REFERENCED_TABLE_NAME IS NOT NULL"
      );

      for (const row of results) {
        await queryInterface.removeConstraint('publishing_drafts', row.CONSTRAINT_NAME);
      }
    } catch (error) {
      console.warn('Note: Could not explicitly remove constraint, it might have been removed by changeColumn:', error.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('publishing_drafts', 'submission_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'book_chapter_submissions',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },
};
