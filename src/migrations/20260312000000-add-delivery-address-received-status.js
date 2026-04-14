'use strict';

/** MySQL-compatible rewrite: Add DELIVERY_ADDRESS_RECEIVED to text_book status ENUMs.
 *  Uses changeColumn instead of PostgreSQL CREATE TYPE / ALTER TYPE.
 */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        const fullEnumValues = [
            'INITIAL_SUBMITTED',
            'UNDER_ADMIN_REVIEW',
            'PROPOSAL_UNDER_REVIEW',
            'PROPOSAL_REJECTED',
            'PROPOSAL_ACCEPTED',
            'REVISION_REQUESTED',
            'REVISION_SUBMITTED',
            'SUBMISSION_ACCEPTED',
            'SUBMISSION_REJECTED',
            'APPROVED',
            'REJECTED',
            'ISBN_APPLIED',
            'ISBN_PENDING',
            'ISBN_RECEIVED',
            'ISBN_ASSIGNED',
            'AWAITING_DELIVERY',
            'AWAITING_DELIVERY_DETAILS',
            'DELIVERY_ADDRESS_RECEIVED',
            'PUBLICATION_IN_PROGRESS',
            'PUBLISHED',
            'WITHDRAWN',
            'DELIVERED'
        ];

        try {
            await queryInterface.changeColumn('text_book_submissions', 'status', {
                type: Sequelize.ENUM(...fullEnumValues),
                allowNull: false,
                defaultValue: 'INITIAL_SUBMITTED',
            });
        } catch (err) {
            console.log('⚠️ text_book_submissions status ENUM update skipped:', err.message);
        }

        for (const col of ['previousStatus', 'newStatus']) {
            try {
                await queryInterface.changeColumn('text_book_status_history', col, {
                    type: Sequelize.ENUM(...fullEnumValues),
                    allowNull: true,
                });
            } catch (err) {
                console.log(`⚠️ text_book_status_history.${col} ENUM update skipped:`, err.message);
            }
        }
    },

    down: async (queryInterface, Sequelize) => {
        // Cannot easily remove ENUM values in MySQL without risk.
    }
};
