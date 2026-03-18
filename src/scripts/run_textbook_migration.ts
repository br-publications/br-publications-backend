import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

// Fix path to .env file if running from root
// Adjust relative path as needed
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Also try default location just in case
dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME as string,
    process.env.DB_USER as string,
    process.env.DB_PASSWORD as string,
    {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 5432,
        dialect: 'postgres',
        logging: false,
    }
);

const up = async (queryInterface: any, Sequelize: any) => {
    
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
            type: Sequelize.JSONB,
            allowNull: false,
            comment: 'Main author information (firstName, lastName, email, etc.)'
        },
        coAuthors: {
            type: Sequelize.JSONB,
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
            allowNull: true // Made nullable
        },
        fileData: {
            type: Sequelize.BLOB('long'), // Store binary data
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

    // Add indexes for better query performance
    
    try {
        await queryInterface.addIndex('text_book_submissions', ['submittedBy']);
        await queryInterface.addIndex('text_book_submissions', ['status']);
        await queryInterface.addIndex('text_book_submissions', ['submissionDate']);
        await queryInterface.addIndex('text_book_submissions', ['status', 'submissionDate']);

        await queryInterface.addIndex('text_book_files', ['submissionId']);
        await queryInterface.addIndex('text_book_files', ['fileType']);

        await queryInterface.addIndex('text_book_revisions', ['submissionId']);
        await queryInterface.addIndex('text_book_revisions', ['revisionNumber']);

        await queryInterface.addIndex('text_book_status_history', ['submissionId']);
        await queryInterface.addIndex('text_book_status_history', ['changedAt']);

        await queryInterface.addIndex('text_book_discussions', ['submissionId']);
        await queryInterface.addIndex('text_book_discussions', ['senderId']);
    } catch (e: any) {
        
    }
};

const runMigration = async () => {
    try {
        await sequelize.authenticate();
        

        const queryInterface = sequelize.getQueryInterface();
        const tableExists = await queryInterface.showAllTables();

        // Drop tables in correct order (child tables first)
        if (tableExists.includes('text_book_discussions')) {
            
            await queryInterface.dropTable('text_book_discussions');
        }
        if (tableExists.includes('text_book_status_history')) {
            
            await queryInterface.dropTable('text_book_status_history');
        }
        if (tableExists.includes('text_book_revisions')) {
            
            await queryInterface.dropTable('text_book_revisions');
        }
        if (tableExists.includes('text_book_files')) {
            
            await queryInterface.dropTable('text_book_files');
        }
        if (tableExists.includes('text_book_submissions')) {
            
            await queryInterface.dropTable('text_book_submissions');
        }

        // Run creation
        await up(queryInterface, Sequelize);
        

        process.exit(0);
    } catch (error: any) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

runMigration();
