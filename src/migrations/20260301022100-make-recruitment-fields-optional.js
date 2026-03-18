'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('recruitment_submissions', 'scopusId', {
            type: Sequelize.STRING(255),
            allowNull: true,
        });
        await queryInterface.changeColumn('recruitment_submissions', 'biography', {
            type: Sequelize.TEXT,
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.changeColumn('recruitment_submissions', 'scopusId', {
            type: Sequelize.STRING(255),
            allowNull: false,
        });
        await queryInterface.changeColumn('recruitment_submissions', 'biography', {
            type: Sequelize.TEXT,
            allowNull: false,
        });
    }
};
