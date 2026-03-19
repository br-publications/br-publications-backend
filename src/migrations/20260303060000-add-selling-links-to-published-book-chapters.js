'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const table = await queryInterface.describeTable('published_book_chapters');

        if (!table.googleLink) {
            await queryInterface.addColumn('published_book_chapters', 'googleLink', {
                type: Sequelize.TEXT,
                allowNull: true,
            });
        }

        if (!table.flipkartLink) {
            await queryInterface.addColumn('published_book_chapters', 'flipkartLink', {
                type: Sequelize.TEXT,
                allowNull: true,
            });
        }

        if (!table.amazonLink) {
            await queryInterface.addColumn('published_book_chapters', 'amazonLink', {
                type: Sequelize.TEXT,
                allowNull: true,
            });
        }
    },

    async down(queryInterface, Sequelize) {
        const table = await queryInterface.describeTable('published_book_chapters');

        if (table.amazonLink) {
            await queryInterface.removeColumn('published_book_chapters', 'amazonLink');
        }
        if (table.flipkartLink) {
            await queryInterface.removeColumn('published_book_chapters', 'flipkartLink');
        }
        if (table.googleLink) {
            await queryInterface.removeColumn('published_book_chapters', 'googleLink');
        }
    }
};
