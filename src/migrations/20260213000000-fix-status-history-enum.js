'use strict';

/** MySQL-compatible rewrite of fix-status-history-enum.
 *  In MySQL, ENUMs are column-level. There are no named TYPE objects.
 *  We use changeColumn to update both previousStatus and newStatus columns.
 */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        const newEnumValues = [
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
            'WITHDRAWN',
            // Keep legacy values so existing data doesn't break during migration
            'UNDER_ADMIN_REVIEW',
            'APPROVED',
            'REJECTED',
            'ISBN_PENDING',
            'ISBN_ASSIGNED',
            'AWAITING_DELIVERY',
            'DELIVERED'
        ];

        const cols = ['previousStatus', 'newStatus'];
        for (const col of cols) {
            await queryInterface.changeColumn('text_book_status_history', col, {
                type: Sequelize.ENUM(...newEnumValues),
                allowNull: true,
            });
        }
    },

    down: async (queryInterface, Sequelize) => {
        // Cannot easily roll back ENUM value additions in MySQL
    }
};
