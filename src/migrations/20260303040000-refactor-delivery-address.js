'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const table = await queryInterface.describeTable('delivery_addresses');
        if (table.preferredCourier) {
            await queryInterface.removeColumn('delivery_addresses', 'preferredCourier');
        }
        if (table.shippingType) {
            await queryInterface.removeColumn('delivery_addresses', 'shippingType');
        }
    },

    async down(queryInterface, Sequelize) {
        const table = await queryInterface.describeTable('delivery_addresses');
        if (!table.preferredCourier) {
            await queryInterface.addColumn('delivery_addresses', 'preferredCourier', {
                type: Sequelize.STRING(100),
                allowNull: true,
            });
        }
        if (!table.shippingType) {
            await queryInterface.addColumn('delivery_addresses', 'shippingType', {
                type: Sequelize.STRING(100),
                allowNull: true,
            });
        }
    }
};
