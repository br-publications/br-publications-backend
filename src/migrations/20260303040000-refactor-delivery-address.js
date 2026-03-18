'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.removeColumn('delivery_addresses', 'preferredCourier');
        await queryInterface.removeColumn('delivery_addresses', 'shippingType');
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.addColumn('delivery_addresses', 'preferredCourier', {
            type: Sequelize.STRING(100),
            allowNull: true,
        });
        await queryInterface.addColumn('delivery_addresses', 'shippingType', {
            type: Sequelize.STRING(100),
            allowNull: true,
        });
    }
};
