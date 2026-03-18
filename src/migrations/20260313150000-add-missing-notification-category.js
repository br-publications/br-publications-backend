'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        try {
            // Add 'SUBMISSION_UPDATE' to enum_notifications_category
            await queryInterface.sequelize.query(
                "ALTER TYPE \"enum_notifications_category\" ADD VALUE IF NOT EXISTS 'SUBMISSION_UPDATE';"
            ).catch(() => {
                // Silently ignore if enum doesn't exist
                console.log('⚠️ SUBMISSION_UPDATE enum migration skipped - enum may not exist yet');
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
