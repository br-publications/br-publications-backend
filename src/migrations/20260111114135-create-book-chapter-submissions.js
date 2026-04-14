'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('book_chapter_submissions', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      
      // Submitted by (authenticated user)
      submittedBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'User who submitted the chapter (auto-changes role to author)',
      },
      
      // Main Author Details
      mainAuthor: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: 'Main author information (firstName, lastName, designation, etc.)',
      },
      
      // Co-Authors (up to 6)
      coAuthors: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Array of co-authors with their details',
      },
      
      // Book Chapter Details
      bookTitle: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Selected book title from dropdown',
      },
      
      bookChapterTitles: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: 'Array of selected chapter titles/IDs',
      },
      
      abstract: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Abstract text (max 300 words)',
      },
      
      keywords: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: 'Array of keywords',
      },
      
      // Submission Status Flow
      status: {
        type: Sequelize.ENUM(
          'INITIAL_SUBMITTED',           // Author submitted initial proposal
          'ASSIGNED_TO_EDITOR',          // Admin assigned to editor
          'EDITOR_REVIEWING',            // Editor is reviewing
          'EDITOR_ACCEPTED',             // Editor accepted - awaiting full chapter
          'EDITOR_REJECTED',             // Editor rejected
          'FULL_CHAPTER_PENDING',        // Waiting for author to submit full chapter
          'FULL_CHAPTER_SUBMITTED',      // Author submitted full chapter
          'REVIEWERS_ASSIGNED',          // Editor assigned reviewers
          'REVIEWER_PENDING_ACCEPTANCE', // Waiting for reviewers to accept/reject
          'UNDER_REVIEW',                // Reviewers working on it
          'REVISION_REQUESTED',          // Reviewer requested revision
          'REVISION_SUBMITTED',          // Author submitted revised chapter
          'REVIEW_COMPLETED',            // Reviewers completed their work
          'EDITOR_FINAL_REVIEW',         // Editor making final decision
          'APPROVED',                    // Final approval
          'REJECTED',                    // Final rejection
          'PUBLISHED'                    // Published on website
        ),
        defaultValue: 'INITIAL_SUBMITTED',
        allowNull: false,
      },
      
      // Assignment tracking
      assignedEditorId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      
      assignedReviewers: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Array of reviewer IDs (max 2)',
      },
      
      // Revision tracking
      revisionCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: 'Number of revisions requested (max 3)',
      },
      
      currentRevisionNumber: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      
      // Deadline tracking
      reviewDeadline: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: '30 days from reviewer acceptance',
      },
      
      editorDecisionDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      
      finalApprovalDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      
      // Metadata
      submissionDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      
      lastUpdatedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Internal notes visible to admin/editor',
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

    // Add indexes for better query performance
    await queryInterface.addIndex('book_chapter_submissions', ['submittedBy']);
    await queryInterface.addIndex('book_chapter_submissions', ['status']);
    await queryInterface.addIndex('book_chapter_submissions', ['assignedEditorId']);
    await queryInterface.addIndex('book_chapter_submissions', ['submissionDate']);
    await queryInterface.addIndex('book_chapter_submissions', ['bookTitle']);
    
    // Composite indexes
    await queryInterface.addIndex('book_chapter_submissions', ['status', 'submissionDate']);
    await queryInterface.addIndex('book_chapter_submissions', ['submittedBy', 'status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('book_chapter_submissions');
  },
};
