'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            // Add 'SUBMISSION_UPDATE' to enum_notifications_category
            await queryInterface.sequelize.query(
                "ALTER TYPE \"enum_notifications_category\" ADD VALUE IF NOT EXISTS 'SUBMISSION_UPDATE';",
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
        return Promise.resolve();
    }
};
