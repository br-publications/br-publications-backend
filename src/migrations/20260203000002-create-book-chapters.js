'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('book_chapters', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            bookTitleId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'book_titles',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT',
            },
            chapterTitle: {
                type: Sequelize.STRING(500),
                allowNull: false,
            },
            chapterNumber: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            isActive: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
        });

        // Add unique constraint for bookTitleId + chapterTitle (if it doesn't exist)
        try {
            await queryInterface.addConstraint('book_chapters', {
                fields: ['bookTitleId', 'chapterTitle'],
                type: 'unique',
                name: 'unique_chapter_per_book',
            });
        } catch (error) {
            // Constraint already exists, skip
            if (!error.message.includes('already exists')) {
                throw error;
            }
        }

        // Add indexes
        await queryInterface.addIndex('book_chapters', ['bookTitleId'], {
            name: 'idx_book_chapters_book_title_id',
        });

        await queryInterface.addIndex('book_chapters', ['isActive'], {
            name: 'idx_book_chapters_is_active',
        });

        await queryInterface.addIndex('book_chapters', ['chapterNumber'], {
            name: 'idx_book_chapters_chapter_number',
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('book_chapters');
    },
};
