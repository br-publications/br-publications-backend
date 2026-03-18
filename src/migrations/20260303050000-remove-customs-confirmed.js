'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.removeColumn('delivery_addresses', 'customsConfirmed');
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.addColumn('delivery_addresses', 'customsConfirmed', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        });
    }
};
