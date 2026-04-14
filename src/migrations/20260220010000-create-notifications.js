'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const { DataTypes } = Sequelize;

        // MySQL: ENUMs are defined inline in createTable, no separate TYPE creation needed.


        await queryInterface.createTable('notifications', {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            recipientId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            senderId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onDelete: 'SET NULL',
            },
            type: {
                type: DataTypes.ENUM(
                    'INFO', 'SUCCESS', 'WARNING', 'ERROR',
                    'ABSTRACT_ACCEPTED', 'SUBMISSION_RECEIVED'
                ),
                allowNull: false,
                defaultValue: 'INFO',
            },
            category: {
                type: DataTypes.ENUM(
                    'SUBMISSION', 'REVIEW', 'DISCUSSION', 'SYSTEM',
                    'SUBMISSION_UPDATE', 'TEXTBOOK_SUBMISSION', 'TEXTBOOK_REVISION',
                    'TEXTBOOK_DECISION', 'TEXTBOOK_PUBLISHING'
                ),
                allowNull: false,
                defaultValue: 'SYSTEM',
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            message: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            relatedEntityId: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            relatedEntityType: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            isRead: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        });

        // Indexes for better query performance
        await queryInterface.addIndex('notifications', ['recipientId']);
        await queryInterface.addIndex('notifications', ['senderId']);
        await queryInterface.addIndex('notifications', ['isRead']);
        await queryInterface.addIndex('notifications', ['recipientId', 'isRead']);
    },

    down: async (queryInterface) => {
        await queryInterface.dropTable('notifications');
    },
};
