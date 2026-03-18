'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('book_chapter_reviewer_assignments', {
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
      
      reviewerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      
      assignedBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'Editor who assigned this reviewer',
      },
      
      status: {
        type: Sequelize.ENUM(
          'PENDING',       // Waiting for reviewer to accept/decline
          'ACCEPTED',      // Reviewer accepted the assignment
          'DECLINED',      // Reviewer declined
          'IN_PROGRESS',   // Reviewer is working
          'COMPLETED',     // Review completed
          'EXPIRED'        // Deadline passed
        ),
        defaultValue: 'PENDING',
        allowNull: false,
      },
      
      assignedDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      
      responseDate: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Date when reviewer accepted/declined',
      },
      
      deadline: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: '30 days from acceptance',
      },
      
      completedDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      
      recommendation: {
        type: Sequelize.ENUM('APPROVE', 'REJECT', 'REVISION_NEEDED'),
        allowNull: true,
        comment: 'Final recommendation from reviewer',
      },
      
      reviewerComments: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      
      confidentialNotes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Notes visible only to editor and admin',
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
    await queryInterface.addIndex('book_chapter_reviewer_assignments', ['submissionId']);
    await queryInterface.addIndex('book_chapter_reviewer_assignments', ['reviewerId']);
    await queryInterface.addIndex('book_chapter_reviewer_assignments', ['status']);
    await queryInterface.addIndex('book_chapter_reviewer_assignments', ['deadline']);
    
    // Composite indexes
    await queryInterface.addIndex('book_chapter_reviewer_assignments', ['submissionId', 'status']);
    await queryInterface.addIndex('book_chapter_reviewer_assignments', ['reviewerId', 'status']);
    
    // Unique constraint: one reviewer can only be assigned once per submission
    await queryInterface.addIndex('book_chapter_reviewer_assignments', ['submissionId', 'reviewerId'], {
      unique: true,
      name: 'unique_submission_reviewer'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('book_chapter_reviewer_assignments');
  },
};
