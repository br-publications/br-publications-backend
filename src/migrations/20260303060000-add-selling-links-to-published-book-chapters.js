'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('published_book_chapters', 'googleLink', {
            type: Sequelize.TEXT,
            allowNull: true,
        });
        await queryInterface.addColumn('published_book_chapters', 'flipkartLink', {
            type: Sequelize.TEXT,
            allowNull: true,
        });
        await queryInterface.addColumn('published_book_chapters', 'amazonLink', {
            type: Sequelize.TEXT,
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('published_book_chapters', 'amazonLink');
        await queryInterface.removeColumn('published_book_chapters', 'flipkartLink');
        await queryInterface.removeColumn('published_book_chapters', 'googleLink');
    }
};
