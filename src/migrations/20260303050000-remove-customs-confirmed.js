'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const table = await queryInterface.describeTable('delivery_addresses');
        if (table.customsConfirmed) {
            await queryInterface.removeColumn('delivery_addresses', 'customsConfirmed');
        }
    },

    async down(queryInterface, Sequelize) {
        const table = await queryInterface.describeTable('delivery_addresses');
        if (!table.customsConfirmed) {
            await queryInterface.addColumn('delivery_addresses', 'customsConfirmed', {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            });
        }
    }
};
