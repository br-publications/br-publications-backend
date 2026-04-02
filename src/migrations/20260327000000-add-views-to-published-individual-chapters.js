'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('published_individual_chapters', 'views', {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('published_individual_chapters', 'views');
    }
};
