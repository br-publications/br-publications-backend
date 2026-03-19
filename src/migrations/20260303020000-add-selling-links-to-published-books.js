'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const table = await queryInterface.describeTable('published_books');

        if (!table.googleLink) {
            await queryInterface.addColumn('published_books', 'googleLink', {
                type: Sequelize.STRING(500),
                allowNull: true,
            });
        }

        if (!table.flipkartLink) {
            await queryInterface.addColumn('published_books', 'flipkartLink', {
                type: Sequelize.STRING(500),
                allowNull: true,
            });
        }

        if (!table.amazonLink) {
            await queryInterface.addColumn('published_books', 'amazonLink', {
                type: Sequelize.STRING(500),
                allowNull: true,
            });
        }
    },

    async down(queryInterface, Sequelize) {
        const table = await queryInterface.describeTable('published_books');

        if (table.googleLink) {
            await queryInterface.removeColumn('published_books', 'googleLink');
        }
        if (table.flipkartLink) {
            await queryInterface.removeColumn('published_books', 'flipkartLink');
        }
        if (table.amazonLink) {
            await queryInterface.removeColumn('published_books', 'amazonLink');
        }
    }
};
