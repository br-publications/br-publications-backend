'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // We need to update both previousStatus and newStatus columns in text_book_status_history table
        // to use the new enum values, matching text_book_submissions.status.

        const columns = ['previousStatus', 'newStatus'];

        // Define the new enum values
        const newEnumName = 'enum_text_book_submissions_status_shared'; // Using a shared name if possible, or just temp

        // Actually, Sequelize creates specific enum types for each column by default.
        // enum_text_book_status_history_previousStatus
        // enum_text_book_status_history_newStatus

        // We will repeat the process for both columns.

        const updates = [
            { col: 'previousStatus', enumName: 'enum_text_book_status_history_previousStatus' },
            { col: 'newStatus', enumName: 'enum_text_book_status_history_newStatus' }
        ];

        for (const update of updates) {
            const tempEnumName = `${update.enumName}_new`;

            // Check if temp enum already exists (cleanup from failed run)
            await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "${tempEnumName}";`);

            // Create new enum type
            await queryInterface.sequelize.query(`
                CREATE TYPE "${tempEnumName}" AS ENUM (
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

            // Alter column to use new enum with casting
            await queryInterface.sequelize.query(`
                ALTER TABLE text_book_status_history
                ALTER COLUMN "${update.col}" TYPE "${tempEnumName}"
                USING (
                    CASE "${update.col}"::text
                        WHEN 'UNDER_ADMIN_REVIEW' THEN 'PROPOSAL_UNDER_REVIEW'
                        WHEN 'APPROVED' THEN 'SUBMISSION_ACCEPTED'
                        WHEN 'REJECTED' THEN 'SUBMISSION_REJECTED'
                        WHEN 'ISBN_PENDING' THEN 'ISBN_APPLIED'
                        WHEN 'ISBN_ASSIGNED' THEN 'ISBN_RECEIVED'
                        WHEN 'PUBLICATION_IN_PROGRESS' THEN 'PUBLICATION_IN_PROGRESS'
                        ELSE "${update.col}"::text
                    END::"${tempEnumName}"
                );
            `);

            // Drop old enum type
            await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "${update.enumName}";`);

            // Rename new enum to old name
            await queryInterface.sequelize.query(`
                ALTER TYPE "${tempEnumName}"
                RENAME TO "${update.enumName}";
            `);
        }
    },

    down: async (queryInterface, Sequelize) => {
        // Revert is complex, skipping for now as this is a fix-forward
        // In local dev we can just drop the table and re-run migrations if really needed
    }
};
