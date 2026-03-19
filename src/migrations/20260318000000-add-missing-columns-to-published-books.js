'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const table = await queryInterface.describeTable('published_books');

        if (!table.is_featured) {
            await queryInterface.addColumn('published_books', 'is_featured', {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            });
        }

        if (!table.is_hidden) {
            await queryInterface.addColumn('published_books', 'is_hidden', {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            });
        }
    },

    async down(queryInterface, Sequelize) {
        const table = await queryInterface.describeTable('published_books');

        if (table.is_hidden) {
            await queryInterface.removeColumn('published_books', 'is_hidden');
        }
        if (table.is_featured) {
            await queryInterface.removeColumn('published_books', 'is_featured');
        }
    }
};
