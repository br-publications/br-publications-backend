'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('chapter_discussions', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            chapter_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'individual_chapters',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            message: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            is_internal: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
                allowNull: false
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Add indexes
        await queryInterface.addIndex('chapter_discussions', ['chapter_id']);
        await queryInterface.addIndex('chapter_discussions', ['user_id']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('chapter_discussions');
    }
};
