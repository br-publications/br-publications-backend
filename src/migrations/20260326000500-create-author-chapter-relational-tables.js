'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const { DataTypes } = Sequelize;

        // 1. Create published_authors table
        await queryInterface.createTable('published_authors', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            affiliation: {
                type: DataTypes.STRING(500),
                allowNull: true,
            },
            biography: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            user_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        });

        // 2. Create published_individual_chapters table (Normalized TOC)
        await queryInterface.createTable('published_individual_chapters', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            published_book_chapter_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'published_book_chapters',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            title: {
                type: DataTypes.STRING(500),
                allowNull: false,
            },
            chapter_number: {
                type: DataTypes.STRING(50),
                allowNull: true,
            },
            authors: {
                type: DataTypes.TEXT,
                allowNull: true,
                comment: 'Legacy comma-separated author names for display',
            },
            pages_from: {
                type: DataTypes.STRING(20),
                allowNull: true,
            },
            pages_to: {
                type: DataTypes.STRING(20),
                allowNull: true,
            },
            pdf_key: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            pdf_name: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            abstract: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        });

        // 3. Create published_chapter_authors junction table
        await queryInterface.createTable('published_chapter_authors', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            published_individual_chapter_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'published_individual_chapters',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            published_author_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'published_authors',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        });

        // Add Indexes
        await queryInterface.addIndex('published_authors', ['email']);
        await queryInterface.addIndex('published_authors', ['name']);
        await queryInterface.addIndex('published_individual_chapters', ['published_book_chapter_id']);
        await queryInterface.addIndex('published_chapter_authors', ['published_individual_chapter_id'], { name: 'idx_pca_chapter_id' });
        await queryInterface.addIndex('published_chapter_authors', ['published_author_id'], { name: 'idx_pca_author_id' });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('published_chapter_authors');
        await queryInterface.dropTable('published_individual_chapters');
        await queryInterface.dropTable('published_authors');
    },
};
