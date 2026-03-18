'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // 1. Add new columns
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

        await queryInterface.addColumn('text_book_revisions', 'requestComments', {
            type: Sequelize.TEXT,
            allowNull: true
        });

        await queryInterface.addColumn('text_book_revisions', 'status', {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: 'PENDING'
        });

        // 2. Rename 'notes' to 'submissionComments'
        await queryInterface.renameColumn('text_book_revisions', 'notes', 'submissionComments');

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
        // 1. Revert nullability (Warning: This might fail if records with NULLs exist)
        // We attempt to set a default value or delete rows with nulls if we were strict, 
        // but for now we'll just try to alter it back, assuming specific cleanup might be needed manually.
        // To be safe in Dev, we might not stick strictly to NOT NULL if data is dirty.
        // But let's try to restore the schema definition.

        // We can't easily revert NULL to NOT NULL without data cleanup. 
        // For the sake of 'down', we will just allow nulls to remain or better yet, just leave them nullable 
        // to avoid potential errors during rollback in dev environment, 
        // OR we can try to set them back to NOT NULL if we are sure.
        // Given this is a dev environment helper, let's try to match strict schema but wrap in try/catch or just do it.
        // Actually, let's keep it simple and just do the reverse ops.

        /*
          Reverting `submittedBy` and `submittedAt` to NOT NULL is risky if there's data.
          We'll proceed with best effort.
        */

        /* 
           Note: 'submittedBy' was NOT NULL and FK in original.
           We should revert existing rows to have a valid user or delete them? 
           For now, let's just revert the column definitions.
        */

        // 2. Rename back
        await queryInterface.renameColumn('text_book_revisions', 'submissionComments', 'notes');

        // 3. Remove added columns
        await queryInterface.removeColumn('text_book_revisions', 'status');
        await queryInterface.removeColumn('text_book_revisions', 'requestComments');
        await queryInterface.removeColumn('text_book_revisions', 'requestedBy');

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
