'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            // Add new values to enum_notifications_category
            await queryInterface.sequelize.query(
                "ALTER TYPE \"enum_notifications_category\" ADD VALUE IF NOT EXISTS 'TEXTBOOK_SUBMISSION';",
                { transaction }
            );
            await queryInterface.sequelize.query(
                "ALTER TYPE \"enum_notifications_category\" ADD VALUE IF NOT EXISTS 'TEXTBOOK_REVISION';",
                { transaction }
            );
            await queryInterface.sequelize.query(
                "ALTER TYPE \"enum_notifications_category\" ADD VALUE IF NOT EXISTS 'TEXTBOOK_DECISION';",
                { transaction }
            );
            await queryInterface.sequelize.query(
                "ALTER TYPE \"enum_notifications_category\" ADD VALUE IF NOT EXISTS 'TEXTBOOK_PUBLISHING';",
                { transaction }
            );

            // Add new values to enum_notifications_type
            await queryInterface.sequelize.query(
                "ALTER TYPE \"enum_notifications_type\" ADD VALUE IF NOT EXISTS 'ABSTRACT_ACCEPTED';",
                { transaction }
            );
            await queryInterface.sequelize.query(
                "ALTER TYPE \"enum_notifications_type\" ADD VALUE IF NOT EXISTS 'SUBMISSION_RECEIVED';",
                { transaction }
            );

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    },

    down: async (queryInterface, Sequelize) => {
        // Enums cannot be easily removed in Postgres without dropping and recreating the type.
        // For safety, we will leave the new values in place as they don't harm existing data.
        return Promise.resolve();
    }
};
