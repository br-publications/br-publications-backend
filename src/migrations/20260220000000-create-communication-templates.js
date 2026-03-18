'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('communication_templates', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            code: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
                comment: 'Unique code to identify the template (e.g., SUBMISSION_RECEIVED)'
            },
            type: {
                type: Sequelize.ENUM('EMAIL', 'NOTIFICATION'),
                allowNull: false
            },
            subject: {
                type: Sequelize.STRING,
                allowNull: false,
                comment: 'Email subject or Notification title'
            },
            content: {
                type: Sequelize.TEXT,
                allowNull: false,
                comment: 'HTML content for emails, text for notifications'
            },
            variables: {
                type: Sequelize.JSON,
                allowNull: true,
                comment: 'List of available variables for this template'
            },
            description: {
                type: Sequelize.STRING,
                allowNull: true
            },
            isActive: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        // Add index on code for fast lookups
        await queryInterface.addIndex('communication_templates', ['code']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('communication_templates');
    }
};
