// Migration to update text book submission workflow
// Adds new status enum values and date tracking fields

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Step 1: Add new date columns (if they don't exist)
        const columns = [
            { name: 'proposalAcceptedDate', type: Sequelize.DATE },
            { name: 'isbnAppliedDate', type: Sequelize.DATE },
            { name: 'isbnReceivedDate', type: Sequelize.DATE },
            { name: 'publicationStartDate', type: Sequelize.DATE }
        ];

        for (const column of columns) {
            try {
                await queryInterface.addColumn('text_book_submissions', column.name, {
                    type: column.type,
                    allowNull: true
                });
            } catch (error) {
                // Column already exists, skip
                if (!error.message.includes('already exists')) {
                    throw error;
                }
            }
        }

        // Step 2: Update the status enum type
        // Check if new enum already exists
        const [newEnumExists] = await queryInterface.sequelize.query(`
            SELECT EXISTS (
                SELECT 1 FROM pg_type WHERE typname = 'enum_text_book_submissions_status_new'
            );
        `);

        if (!newEnumExists[0].exists) {
            // Create the new enum type
            await queryInterface.sequelize.query(`
                CREATE TYPE "enum_text_book_submissions_status_new" AS ENUM (
                    'INITIAL_SUBMITTED',
                    'PROPOSAL_UNDER_REVIEW',
                    'PROPOSAL_REJECTED',
                    'PROPOSAL_ACCEPTED',
                    'REVISION_REQUESTED',
                    'REVISION_SUBMITTED',
                    'SUBMISSION_ACCEPTED',
                    'SUBMISSION_REJECTED',
                    'ISBN_APPLIED',
                    'ISBN_RECEIVED',
                    'PUBLICATION_IN_PROGRESS',
                    'PUBLISHED',
                    'WITHDRAWN'
                );
            `);
        }

        // Step 3: Alter the column to use the new enum with data migration
        // Check if column is already using the new enum
        const [columnType] = await queryInterface.sequelize.query(`
            SELECT udt_name FROM information_schema.columns 
            WHERE table_name = 'text_book_submissions' AND column_name = 'status';
        `);

        if (columnType[0].udt_name !== 'enum_text_book_submissions_status_new') {
            // Drop the default value temporarily
            await queryInterface.sequelize.query(`
                ALTER TABLE text_book_submissions
                ALTER COLUMN status DROP DEFAULT;
            `);

            // Change the column type with data migration
            await queryInterface.sequelize.query(`
                ALTER TABLE text_book_submissions
                ALTER COLUMN status TYPE "enum_text_book_submissions_status_new"
                USING (
                    CASE status::text
                        WHEN 'UNDER_ADMIN_REVIEW' THEN 'PROPOSAL_UNDER_REVIEW'
                        WHEN 'APPROVED' THEN 'SUBMISSION_ACCEPTED'
                        WHEN 'REJECTED' THEN 'SUBMISSION_REJECTED'
                        WHEN 'ISBN_PENDING' THEN 'ISBN_APPLIED'
                        WHEN 'ISBN_ASSIGNED' THEN 'ISBN_RECEIVED'
                        WHEN 'PUBLICATION_IN_PROGRESS' THEN 'PUBLICATION_IN_PROGRESS'
                        ELSE status::text
                    END::"enum_text_book_submissions_status_new"
                );
            `);

            // Drop the old enum type (if it exists)
            await queryInterface.sequelize.query(`
                DROP TYPE IF EXISTS "enum_text_book_submissions_status";
            `);

            // Rename the new enum type to the original name
            await queryInterface.sequelize.query(`
                ALTER TYPE "enum_text_book_submissions_status_new"
                RENAME TO "enum_text_book_submissions_status";
            `);

            // Restore the default value
            await queryInterface.sequelize.query(`
                ALTER TABLE text_book_submissions
                ALTER COLUMN status SET DEFAULT 'INITIAL_SUBMITTED'::"enum_text_book_submissions_status";
            `);
        }
    },

    down: async (queryInterface, Sequelize) => {
        // Remove new columns if they exist
        const table = await queryInterface.describeTable('text_book_submissions');
        if (table.proposalAcceptedDate) {
            await queryInterface.removeColumn('text_book_submissions', 'proposalAcceptedDate');
        }
        if (table.isbnAppliedDate) {
            await queryInterface.removeColumn('text_book_submissions', 'isbnAppliedDate');
        }
        if (table.isbnReceivedDate) {
            await queryInterface.removeColumn('text_book_submissions', 'isbnReceivedDate');
        }
        if (table.publicationStartDate) {
            await queryInterface.removeColumn('text_book_submissions', 'publicationStartDate');
        }

        // Revert to old enum (simplified - in production you'd want to preserve data better)
        await queryInterface.sequelize.query(`
            CREATE TYPE "enum_text_book_submissions_status_old" AS ENUM (
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
            );
        `);

        await queryInterface.sequelize.query(`
            UPDATE text_book_submissions
            SET status = CASE
                WHEN status = 'PROPOSAL_UNDER_REVIEW' THEN 'UNDER_ADMIN_REVIEW'
                WHEN status = 'PROPOSAL_REJECTED' THEN 'REJECTED'
                WHEN status = 'PROPOSAL_ACCEPTED' THEN 'UNDER_ADMIN_REVIEW'
                WHEN status = 'SUBMISSION_ACCEPTED' THEN 'APPROVED'
                WHEN status = 'SUBMISSION_REJECTED' THEN 'REJECTED'
                WHEN status = 'ISBN_APPLIED' THEN 'ISBN_PENDING'
                WHEN status = 'ISBN_RECEIVED' THEN 'ISBN_ASSIGNED'
                WHEN status = 'PUBLICATION_IN_PROGRESS' THEN 'ISBN_ASSIGNED'
                ELSE status::text
            END::text;
        `);

        await queryInterface.sequelize.query(`
            ALTER TABLE text_book_submissions
            ALTER COLUMN status TYPE "enum_text_book_submissions_status_old"
            USING status::text::"enum_text_book_submissions_status_old";
        `);

        await queryInterface.sequelize.query(`
            DROP TYPE IF EXISTS "enum_text_book_submissions_status";
        `);

        await queryInterface.sequelize.query(`
            ALTER TYPE "enum_text_book_submissions_status_old"
            RENAME TO "enum_text_book_submissions_status";
        `);
    }
};
