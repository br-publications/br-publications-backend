'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('published_books', 'googleLink', {
            type: Sequelize.STRING(500),
            allowNull: true,
        });
        await queryInterface.addColumn('published_books', 'flipkartLink', {
            type: Sequelize.STRING(500),
            allowNull: true,
        });
        await queryInterface.addColumn('published_books', 'amazonLink', {
            type: Sequelize.STRING(500),
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('published_books', 'googleLink');
        await queryInterface.removeColumn('published_books', 'flipkartLink');
        await queryInterface.removeColumn('published_books', 'amazonLink');
    }
};
