import { QueryInterface, DataTypes } from 'sequelize';

export default {
    async up(queryInterface: QueryInterface): Promise<void> {
        const table = await queryInterface.describeTable('book_chapters');
        if (!table.is_published) {
            await queryInterface.addColumn('book_chapters', 'is_published', {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            });
        }
    },

    async down(queryInterface: QueryInterface): Promise<void> {
        const table = await queryInterface.describeTable('book_chapters');
        if (table.is_published) {
            await queryInterface.removeColumn('book_chapters', 'is_published');
        }
    },
};
