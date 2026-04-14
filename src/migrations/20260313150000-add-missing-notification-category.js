'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        try {
            await queryInterface.changeColumn('notifications', 'category', {
                type: Sequelize.ENUM('SUBMISSION', 'REVIEW', 'DISCUSSION', 'SYSTEM', 'SUBMISSION_UPDATE', 'TEXTBOOK_SUBMISSION', 'TEXTBOOK_REVISION', 'TEXTBOOK_DECISION', 'TEXTBOOK_PUBLISHING'),
                allowNull: false,
                defaultValue: 'SYSTEM'
            });
        } catch (err) {
            console.log('⚠️ SUBMISSION_UPDATE enum migration error (non-critical):', err.message);
        }
    },

    down: async (queryInterface, Sequelize) => {
        // Enums cannot be easily removed in Postgres without dropping and recreating the type.
        return Promise.resolve();
    }
};
