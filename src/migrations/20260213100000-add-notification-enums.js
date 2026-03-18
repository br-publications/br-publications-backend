'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        try {
            // Add new values to enum_notifications_category
            await queryInterface.sequelize.query(
                "ALTER TYPE \"enum_notifications_category\" ADD VALUE IF NOT EXISTS 'TEXTBOOK_SUBMISSION';"
            ).catch(() => {
                // Silently ignore if enum doesn't exist yet
            });
            
            await queryInterface.sequelize.query(
                "ALTER TYPE \"enum_notifications_category\" ADD VALUE IF NOT EXISTS 'TEXTBOOK_REVISION';"
            ).catch(() => {});
            
            await queryInterface.sequelize.query(
                "ALTER TYPE \"enum_notifications_category\" ADD VALUE IF NOT EXISTS 'TEXTBOOK_DECISION';"
            ).catch(() => {});
            
            await queryInterface.sequelize.query(
                "ALTER TYPE \"enum_notifications_category\" ADD VALUE IF NOT EXISTS 'TEXTBOOK_PUBLISHING';"
            ).catch(() => {});

            // Add new values to enum_notifications_type
            await queryInterface.sequelize.query(
                "ALTER TYPE \"enum_notifications_type\" ADD VALUE IF NOT EXISTS 'ABSTRACT_ACCEPTED';"
            ).catch(() => {});
            
            await queryInterface.sequelize.query(
                "ALTER TYPE \"enum_notifications_type\" ADD VALUE IF NOT EXISTS 'SUBMISSION_RECEIVED';"
            ).catch(() => {});
        } catch (err) {
            // Log but don't fail
            console.log('⚠️ Notification enum migration skipped - enums may not exist yet');
        }
    },

    down: async (queryInterface, Sequelize) => {
        // Enums cannot be easily removed in Postgres without dropping and recreating the type.
        // For safety, we will leave the new values in place as they don't harm existing data.
        return Promise.resolve();
    }
};
