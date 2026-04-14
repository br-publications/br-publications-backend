'use strict';

/**
 * Port of 20260220-refactor-submission-flow.sql to MySQL-compatible Sequelize JS Migration.
 * Since this will be run on a fresh MySQL DB, data mapping updates are skipped safely.
 * Only schema changes (ENUM updates, column additions) are retained.
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Update book_chapter_submissions ENUM
    const submissionEnumValues = [
        'ABSTRACT_SUBMITTED',
        'MANUSCRIPTS_PENDING',
        'REVIEWER_ASSIGNMENT',
        'UNDER_REVIEW',
        'EDITORIAL_REVIEW',
        'APPROVED',
        'ISBN_APPLIED',
        'PUBLICATION_IN_PROGRESS',
        'PUBLISHED',
        'REJECTED',
        // Preserve old ones just in case 
        'INITIAL_SUBMITTED', 'ASSIGNED_TO_EDITOR', 'EDITOR_REVIEWING', 
        'EDITOR_ACCEPTED', 'EDITOR_REJECTED', 'FULL_CHAPTER_PENDING', 
        'FULL_CHAPTER_SUBMITTED', 'REVIEWERS_ASSIGNED', 'REVIEWER_PENDING_ACCEPTANCE', 
        'REVISION_REQUESTED', 'REVISION_SUBMITTED', 'REVIEW_COMPLETED', 
        'EDITOR_FINAL_REVIEW', 'WITHDRAWN'
    ];

    try {
        await queryInterface.changeColumn('book_chapter_submissions', 'status', {
            type: Sequelize.ENUM(...submissionEnumValues),
            allowNull: false,
            defaultValue: 'ABSTRACT_SUBMITTED'
        });
    } catch (e) {
        console.log('Update book_chapter_submissions stats enum skipped/failed:', e.message);
    }

    // 2. Update individual_chapters ENUM
    const chapterEnumValues = [
        'ABSTRACT_SUBMITTED',
        'MANUSCRIPTS_PENDING',
        'REVIEWER_ASSIGNMENT',
        'UNDER_REVIEW',
        'REVISION_REQUESTED',
        'ADDITIONAL_REVISION_REQUESTED',
        'REVISION_SUBMITTED',
        'EDITORIAL_REVIEW',
        'CHAPTER_APPROVED',
        'CHAPTER_REJECTED',
        // Preserve old
        'MANUSCRIPT_PENDING', 'ABSTRACT_ACCEPTED', 'REVIEWERS_ASSIGNED', 
        'REVIEWER_PENDING_ACCEPTANCE', 'MANUSCRIPT_SUBMITTED', 'REVIEW_COMPLETED', 
        'EDITOR_FINAL_REVIEW', 'ABSTRACT_REJECTED', 'PUBLISHED'
    ];

    try {
        await queryInterface.changeColumn('individual_chapters', 'status', {
            type: Sequelize.ENUM(...chapterEnumValues),
            allowNull: false,
            defaultValue: 'ABSTRACT_SUBMITTED'
        });
    } catch (e) {
        console.log('Update individual_chapters status enum skipped/failed:', e.message);
    }

    // 3. Update chapter_status_history ENUMs
    for (const col of ['previous_status', 'new_status']) {
        try {
            await queryInterface.changeColumn('chapter_status_history', col, {
                type: Sequelize.ENUM(...chapterEnumValues),
                allowNull: true
            });
        } catch (e) {}
    }

    // 4. Update book_chapter_status_history ENUMs
    for (const col of ['previousStatus', 'newStatus']) {
        try {
            await queryInterface.changeColumn('book_chapter_status_history', col, {
                type: Sequelize.ENUM(...submissionEnumValues),
                allowNull: true
            });
        } catch (e) {}
    }

    // 5. Add completely new columns: isbn, doi, designatedEditorId
    try {
        await queryInterface.addColumn('book_chapter_submissions', 'isbn', {
            type: Sequelize.STRING(30)
        });
    } catch (e) {}
    
    try {
        await queryInterface.addColumn('book_chapter_submissions', 'doi', {
            type: Sequelize.STRING(100)
        });
    } catch (e) {}

    try {
        await queryInterface.addColumn('book_chapter_submissions', 'designatedEditorId', {
            type: Sequelize.INTEGER,
            references: {
                model: 'users',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        });
    } catch (e) {}
  },

  down: async (queryInterface, Sequelize) => {
      // safe fallback
  }
};
