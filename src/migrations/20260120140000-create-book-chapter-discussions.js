'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('book_chapter_discussions', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            submissionId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'book_chapter_submissions',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            userId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            message: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            isInternal: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
                comment: 'If true, only visible to editors/admins'
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

        // Add indexes
        await queryInterface.addIndex('book_chapter_discussions', ['submissionId']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('book_chapter_discussions');
    }
};
