'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const { DataTypes } = Sequelize;
        const table = await queryInterface.describeTable('book_chapters');
        if (!table.is_published && !table.isPublished) {
            await queryInterface.addColumn('book_chapters', 'isPublished', {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            });
        }
    },

    async down(queryInterface, Sequelize) {
        const table = await queryInterface.describeTable('book_chapters');
        if (table.is_published) {
            await queryInterface.removeColumn('book_chapters', 'is_published');
        }
    },
};
