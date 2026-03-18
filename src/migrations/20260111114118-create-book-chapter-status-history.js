'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('book_chapter_status_history', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      
      submissionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'book_chapter_submissions',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      
      previousStatus: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      
      newStatus: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      
      changedBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      
      action: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'e.g., "Submitted", "Assigned to Editor", "Accepted", "Rejected"',
      },
      
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Additional data like assigned user IDs, deadlines, etc.',
      },
      
      changedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Add indexes
    await queryInterface.addIndex('book_chapter_status_history', ['submissionId']);
    await queryInterface.addIndex('book_chapter_status_history', ['changedBy']);
    await queryInterface.addIndex('book_chapter_status_history', ['newStatus']);
    await queryInterface.addIndex('book_chapter_status_history', ['changedAt']);
    await queryInterface.addIndex('book_chapter_status_history', ['submissionId', 'changedAt']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('book_chapter_status_history');
  },
};
