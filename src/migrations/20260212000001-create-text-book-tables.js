'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Create text_book_submissions table
        await queryInterface.createTable('text_book_submissions', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            submittedBy: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            mainAuthor: {
                type: Sequelize.JSON,
                allowNull: false,
                comment: 'Main author information (firstName, lastName, email, etc.)'
            },
            coAuthors: {
                type: Sequelize.JSON,
                allowNull: true,
                comment: 'Array of co-authors with their details'
            },
            bookTitle: {
                type: Sequelize.STRING(500),
                allowNull: false
            },
            status: {
                type: Sequelize.ENUM(
                    'INITIAL_SUBMITTED',
                    'UNDER_ADMIN_REVIEW',
                    'REVISION_REQUESTED',
                    'REVISION_SUBMITTED',
                    'APPROVED',
                    'REJECTED',
                    'ISBN_PENDING',
                    'ISBN_ASSIGNED',
                    'PUBLISHED',
                    'WITHDRAWN'
                ),
                defaultValue: 'INITIAL_SUBMITTED',
                allowNull: false
            },
            currentRevisionNumber: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
                allowNull: false,
                comment: 'Track revision count (max 5)'
            },
            adminNotes: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            isbnNumber: {
                type: Sequelize.STRING(50),
                allowNull: true
            },
            doiNumber: {
                type: Sequelize.STRING(100),
                allowNull: true
            },
            submissionDate: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            },
            approvalDate: {
                type: Sequelize.DATE,
                allowNull: true
            },
            publishDate: {
                type: Sequelize.DATE,
                allowNull: true
            },
            lastUpdatedBy: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });

        // Create text_book_files table
        await queryInterface.createTable('text_book_files', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            submissionId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'text_book_submissions',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            fileType: {
                type: Sequelize.ENUM('CONTENT_FILE', 'FULL_TEXT', 'REVISION'),
                allowNull: false
            },
            fileName: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            filePath: {
                type: Sequelize.STRING(500),
                allowNull: false
            },
            fileSize: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            mimeType: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            revisionNumber: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            uploadedBy: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            uploadedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });

        // Create text_book_revisions table
        await queryInterface.createTable('text_book_revisions', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            submissionId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'text_book_submissions',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            revisionNumber: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            submittedBy: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            notes: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            adminFeedback: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            submittedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            },
            reviewedAt: {
                type: Sequelize.DATE,
                allowNull: true
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });

        // Create text_book_status_history table
        await queryInterface.createTable('text_book_status_history', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            submissionId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'text_book_submissions',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            previousStatus: {
                type: Sequelize.ENUM(
                    'INITIAL_SUBMITTED',
                    'UNDER_ADMIN_REVIEW',
                    'REVISION_REQUESTED',
                    'REVISION_SUBMITTED',
                    'APPROVED',
                    'REJECTED',
                    'ISBN_PENDING',
                    'ISBN_ASSIGNED',
                    'PUBLISHED',
                    'WITHDRAWN'
                ),
                allowNull: true
            },
            newStatus: {
                type: Sequelize.ENUM(
                    'INITIAL_SUBMITTED',
                    'UNDER_ADMIN_REVIEW',
                    'REVISION_REQUESTED',
                    'REVISION_SUBMITTED',
                    'APPROVED',
                    'REJECTED',
                    'ISBN_PENDING',
                    'ISBN_ASSIGNED',
                    'PUBLISHED',
                    'WITHDRAWN'
                ),
                allowNull: false
            },
            changedBy: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            notes: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            changedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });

        // Create text_book_discussions table
        await queryInterface.createTable('text_book_discussions', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            submissionId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'text_book_submissions',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            senderId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            message: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });

        // Add indexes for better query performance (if they don't exist)
        const indexes = [
            { table: 'text_book_submissions', fields: ['submittedBy'] },
            { table: 'text_book_submissions', fields: ['status'] },
            { table: 'text_book_submissions', fields: ['submissionDate'] },
            { table: 'text_book_submissions', fields: ['status', 'submissionDate'] },
            { table: 'text_book_files', fields: ['submissionId'] },
            { table: 'text_book_files', fields: ['fileType'] },
            { table: 'text_book_revisions', fields: ['submissionId'] },
            { table: 'text_book_revisions', fields: ['revisionNumber'] },
            { table: 'text_book_status_history', fields: ['submissionId'] },
            { table: 'text_book_status_history', fields: ['changedAt'] },
            { table: 'text_book_discussions', fields: ['submissionId'] },
            { table: 'text_book_discussions', fields: ['senderId'] }
        ];

        for (const index of indexes) {
            try {
                await queryInterface.addIndex(index.table, index.fields);
            } catch (error) {
                // Index already exists, skip
                if (!error.message.includes('already exists')) {
                    throw error;
                }
            }
        }
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('text_book_discussions');
        await queryInterface.dropTable('text_book_status_history');
        await queryInterface.dropTable('text_book_revisions');
        await queryInterface.dropTable('text_book_files');
        await queryInterface.dropTable('text_book_submissions');
    }
};
