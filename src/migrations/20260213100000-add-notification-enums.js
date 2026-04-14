'use strict';

/** MySQL-compatible rewrite: Update notifications ENUMs with additional values.
 *  In MySQL, ENUMs are column-level. We use changeColumn to update both type and category.
 */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        try {
            await queryInterface.changeColumn('notifications', 'type', {
                type: Sequelize.ENUM(
                    'INFO', 'SUCCESS', 'WARNING', 'ERROR',
                    'ABSTRACT_ACCEPTED', 'SUBMISSION_RECEIVED'
                ),
                allowNull: false,
                defaultValue: 'INFO',
            });
        } catch (err) {
            console.log('⚠️ notifications.type enum update skipped:', err.message);
        }

        try {
            await queryInterface.changeColumn('notifications', 'category', {
                type: Sequelize.ENUM(
                    'SUBMISSION', 'REVIEW', 'DISCUSSION', 'SYSTEM',
                    'SUBMISSION_UPDATE', 'TEXTBOOK_SUBMISSION', 'TEXTBOOK_REVISION',
                    'TEXTBOOK_DECISION', 'TEXTBOOK_PUBLISHING'
                ),
                allowNull: false,
                defaultValue: 'SYSTEM',
            });
        } catch (err) {
            console.log('⚠️ notifications.category enum update skipped:', err.message);
        }
    },

    down: async (queryInterface, Sequelize) => {
        return Promise.resolve();
    }
};
