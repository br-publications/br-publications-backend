// Migration to update text book submission workflow
// MySQL-compatible rewrite: no named TYPE objects, use changeColumn instead

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
                if (!error.message.includes('already exists') && !error.message.includes('Duplicate column')) {
                    throw error;
                }
            }
        }

        // Step 2: Update the status column to use expanded ENUM values.
        // MySQL handles ENUMs at the column level — no separate TYPE objects.
        // Include both old and new values so existing data remains valid during migration.
        try {
            await queryInterface.changeColumn('text_book_submissions', 'status', {
                type: Sequelize.ENUM(
                    'INITIAL_SUBMITTED',
                    'UNDER_ADMIN_REVIEW',   // legacy
                    'PROPOSAL_UNDER_REVIEW',
                    'PROPOSAL_REJECTED',
                    'PROPOSAL_ACCEPTED',
                    'REVISION_REQUESTED',
                    'REVISION_SUBMITTED',
                    'SUBMISSION_ACCEPTED',
                    'SUBMISSION_REJECTED',
                    'APPROVED',             // legacy
                    'REJECTED',             // legacy
                    'ISBN_APPLIED',
                    'ISBN_PENDING',         // legacy
                    'ISBN_RECEIVED',
                    'ISBN_ASSIGNED',        // legacy
                    'PUBLICATION_IN_PROGRESS',
                    'PUBLISHED',
                    'WITHDRAWN',
                    'AWAITING_DELIVERY',
                    'DELIVERED'
                ),
                allowNull: false,
                defaultValue: 'INITIAL_SUBMITTED',
            });
        } catch (error) {
            console.log('⚠️ text_book_submissions status ENUM update skipped:', error.message);
        }
    },

    down: async (queryInterface, Sequelize) => {
        // Remove new columns if they exist
        const table = await queryInterface.describeTable('text_book_submissions');
        for (const col of ['proposalAcceptedDate', 'isbnAppliedDate', 'isbnReceivedDate', 'publicationStartDate']) {
            if (table[col]) {
                await queryInterface.removeColumn('text_book_submissions', col);
            }
        }
    }
};
