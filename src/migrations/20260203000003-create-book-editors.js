'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('book_editors', {
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
                onDelete: 'CASCADE',
            },
            editorId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            assignedBy: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT',
            },
            assignedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
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

        // Add unique constraint for bookTitleId + editorId (if it doesn't exist)
        try {
            await queryInterface.addConstraint('book_editors', {
                fields: ['bookTitleId', 'editorId'],
                type: 'unique',
                name: 'unique_editor_per_book',
            });
        } catch (error) {
            // Constraint already exists, skip
            if (!error.message.includes('already exists')) {
                throw error;
            }
        }

        // Add indexes
        await queryInterface.addIndex('book_editors', ['bookTitleId'], {
            name: 'idx_book_editors_book_title_id',
        });

        await queryInterface.addIndex('book_editors', ['editorId'], {
            name: 'idx_book_editors_editor_id',
        });

        await queryInterface.addIndex('book_editors', ['assignedBy'], {
            name: 'idx_book_editors_assigned_by',
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('book_editors');
    },
};
