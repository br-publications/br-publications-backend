'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // 1. Add new columns (idempotent)
        const table = await queryInterface.describeTable('text_book_revisions');

        if (!table.requestedBy) {
            await queryInterface.addColumn('text_book_revisions', 'requestedBy', {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            });
        }

        if (!table.requestComments) {
            await queryInterface.addColumn('text_book_revisions', 'requestComments', {
                type: Sequelize.TEXT,
                allowNull: true
            });
        }

        if (!table.status) {
            await queryInterface.addColumn('text_book_revisions', 'status', {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: 'PENDING'
            });
        }

        // 2. Rename 'notes' to 'submissionComments' if needed
        if (table.notes && !table.submissionComments) {
            await queryInterface.renameColumn('text_book_revisions', 'notes', 'submissionComments');
        }

        // 3. Change columns to be nullable
        await queryInterface.changeColumn('text_book_revisions', 'submittedBy', {
            type: Sequelize.INTEGER,
            allowNull: true
        });

        await queryInterface.changeColumn('text_book_revisions', 'submittedAt', {
            type: Sequelize.DATE,
            allowNull: true
        });
    },

    down: async (queryInterface, Sequelize) => {
        const table = await queryInterface.describeTable('text_book_revisions');

        // 1. Rename back if needed
        if (table.submissionComments && !table.notes) {
            await queryInterface.renameColumn('text_book_revisions', 'submissionComments', 'notes');
        }

        // 2. Remove added columns if present
        if (table.status) {
            await queryInterface.removeColumn('text_book_revisions', 'status');
        }
        if (table.requestComments) {
            await queryInterface.removeColumn('text_book_revisions', 'requestComments');
        }
        if (table.requestedBy) {
            await queryInterface.removeColumn('text_book_revisions', 'requestedBy');
        }

        // 4. Revert 'submittedBy' and 'submittedAt' (Optional - might fail if nulls exist)
        // If we want to be strict:
        /*
        await queryInterface.changeColumn('text_book_revisions', 'submittedBy', {
           type: Sequelize.INTEGER,
           allowNull: false
        });
        await queryInterface.changeColumn('text_book_revisions', 'submittedAt', {
           type: Sequelize.DATE,
           allowNull: false,
           defaultValue: Sequelize.NOW
        });
        */
        // Leaving them nullable in DOWN migration is often safer for data preservation unless strict strict schema restoration is required.
        // But to match the original schema file `20260212000001-create-text-book-tables.js`:
        // submittedBy: allowNull: false
        // submittedAt: allowNull: false

        // Let's try to revert strictly.
        try {
            await queryInterface.changeColumn('text_book_revisions', 'submittedBy', {
                type: Sequelize.INTEGER,
                allowNull: false
            });
            await queryInterface.changeColumn('text_book_revisions', 'submittedAt', {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            });
        } catch (e) {
            console.warn('Could not revert columns to NOT NULL during migration rollback. Data might contain NULLs.');
        }
    }
};
