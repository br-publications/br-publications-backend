'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('published_books', 'cover_image', {
            type: Sequelize.DataTypes.TEXT('long'),
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('published_books', 'cover_image', {
            type: Sequelize.DataTypes.TEXT,
            allowNull: true,
        });
    }
};
