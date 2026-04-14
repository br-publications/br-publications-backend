'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Create individual_chapters table
        await queryInterface.createTable('individual_chapters', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            submission_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'book_chapter_submissions',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            chapter_title: {
                type: Sequelize.STRING(500),
                allowNull: false,
            },
            chapter_number: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            status: {
                type: Sequelize.ENUM(
                    'ABSTRACT_SUBMITTED',
                    'ABSTRACT_ACCEPTED',
                    'ABSTRACT_REJECTED',
                    'MANUSCRIPTS_PENDING',
                    'MANUSCRIPT_SUBMITTED',
                    'REVIEWERS_ASSIGNED',
                    'REVIEWER_PENDING_ACCEPTANCE',
                    'UNDER_REVIEW',
                    'REVISION_REQUESTED',
                    'REVISION_SUBMITTED',
                    'REVIEW_COMPLETED',
                    'EDITOR_FINAL_REVIEW',
                    'CHAPTER_APPROVED',
                    'CHAPTER_REJECTED',
                    'PUBLISHED'
                ),
                allowNull: false,
                defaultValue: 'ABSTRACT_SUBMITTED',
            },
            assigned_reviewers: {
                type: Sequelize.JSON,
                allowNull: true,
            },
            review_deadline: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            manuscript_file_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'book_chapter_files',
                    key: 'id',
                },
            },
            editor_decision: {
                type: Sequelize.ENUM('APPROVED', 'REJECTED'),
                allowNull: true,
            },
            editor_decision_date: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            editor_decision_notes: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            revision_count: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            current_revision_number: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
        });

        // Create chapter_reviewer_assignments table
        await queryInterface.createTable('chapter_reviewer_assignments', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            chapter_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'individual_chapters',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            reviewer_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
            },
            assigned_by: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
            },
            status: {
                type: Sequelize.ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED'),
                allowNull: false,
                defaultValue: 'PENDING',
            },
            assigned_date: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            acceptance_date: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            rejection_date: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            rejection_reason: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            completion_date: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            recommendation: {
                type: Sequelize.ENUM('ACCEPT', 'REJECT', 'MAJOR_REVISION', 'MINOR_REVISION'),
                allowNull: true,
            },
            comments: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            confidential_comments: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            deadline: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
        });

        // Create chapter_revisions table
        await queryInterface.createTable('chapter_revisions', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            chapter_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'individual_chapters',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            revision_number: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            requested_by: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
            },
            requested_date: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            submitted_date: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            file_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'book_chapter_files',
                    key: 'id',
                },
            },
            reviewer_comments: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            author_response: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            status: {
                type: Sequelize.ENUM('PENDING', 'SUBMITTED', 'APPROVED'),
                allowNull: false,
                defaultValue: 'PENDING',
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
        });

        // Create chapter_status_history table
        await queryInterface.createTable('chapter_status_history', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            chapter_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'individual_chapters',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            previous_status: {
                type: Sequelize.ENUM(
                    'ABSTRACT_SUBMITTED',
                    'ABSTRACT_ACCEPTED',
                    'ABSTRACT_REJECTED',
                    'MANUSCRIPT_PENDING',
                    'MANUSCRIPT_SUBMITTED',
                    'REVIEWERS_ASSIGNED',
                    'REVIEWER_PENDING_ACCEPTANCE',
                    'UNDER_REVIEW',
                    'REVISION_REQUESTED',
                    'REVISION_SUBMITTED',
                    'REVIEW_COMPLETED',
                    'EDITOR_FINAL_REVIEW',
                    'CHAPTER_APPROVED',
                    'CHAPTER_REJECTED',
                    'PUBLISHED'
                ),
                allowNull: true,
            },
            new_status: {
                type: Sequelize.ENUM(
                    'ABSTRACT_SUBMITTED',
                    'ABSTRACT_ACCEPTED',
                    'ABSTRACT_REJECTED',
                    'MANUSCRIPT_PENDING',
                    'MANUSCRIPT_SUBMITTED',
                    'REVIEWERS_ASSIGNED',
                    'REVIEWER_PENDING_ACCEPTANCE',
                    'UNDER_REVIEW',
                    'REVISION_REQUESTED',
                    'REVISION_SUBMITTED',
                    'REVIEW_COMPLETED',
                    'EDITOR_FINAL_REVIEW',
                    'CHAPTER_APPROVED',
                    'CHAPTER_REJECTED',
                    'PUBLISHED'
                ),
                allowNull: false,
            },
            changed_by: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
            },
            action: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },
            notes: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            metadata: {
                type: Sequelize.JSON,
                allowNull: true,
            },
            timestamp: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
        });

        // Add indexes for better query performance
        await queryInterface.addIndex('individual_chapters', ['submission_id']);
        await queryInterface.addIndex('individual_chapters', ['status']);
        await queryInterface.addIndex('individual_chapters', ['chapter_number']);

        await queryInterface.addIndex('chapter_reviewer_assignments', ['chapter_id']);
        await queryInterface.addIndex('chapter_reviewer_assignments', ['reviewer_id']);
        await queryInterface.addIndex('chapter_reviewer_assignments', ['status']);

        await queryInterface.addIndex('chapter_revisions', ['chapter_id']);
        await queryInterface.addIndex('chapter_revisions', ['status']);

        await queryInterface.addIndex('chapter_status_history', ['chapter_id']);
        await queryInterface.addIndex('chapter_status_history', ['timestamp']);
    },

    async down(queryInterface, Sequelize) {
        // Drop tables in reverse order due to foreign key constraints
        await queryInterface.dropTable('chapter_status_history');
        await queryInterface.dropTable('chapter_revisions');
        await queryInterface.dropTable('chapter_reviewer_assignments');
        await queryInterface.dropTable('individual_chapters');
    },
};
