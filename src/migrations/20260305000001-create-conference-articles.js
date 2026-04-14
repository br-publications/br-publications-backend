'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const { DataTypes } = Sequelize;

        const tables = await queryInterface.showAllTables();
        if (!tables.includes('conference_articles')) {
            await queryInterface.createTable('conference_articles', {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                    allowNull: false,
                },
                conferenceId: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'conferences',
                        key: 'id',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                },
                title: {
                    type: DataTypes.STRING(600),
                    allowNull: false,
                },
                authors: {
                    type: DataTypes.JSON,
                    allowNull: false,
                    defaultValue: [],
                    comment: 'Array of author name strings',
                },
                year: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                },
                pages: {
                    type: DataTypes.STRING(20),
                    allowNull: true,
                },
                abstract: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                doi: {
                    type: DataTypes.STRING(200),
                    allowNull: true,
                },
                keywords: {
                    type: DataTypes.JSON,
                    allowNull: true,
                    defaultValue: null,
                    comment: 'Array of keyword strings',
                },
                isActive: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: true,
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

            await queryInterface.addIndex('conference_articles', ['conferenceId'], { name: 'idx_conf_articles_conf_id' });
            await queryInterface.addIndex('conference_articles', ['isActive'], { name: 'idx_conf_articles_is_active' });
            await queryInterface.addIndex('conference_articles', ['year'], { name: 'idx_conf_articles_year' });
        }
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('conference_articles');
    },
};
