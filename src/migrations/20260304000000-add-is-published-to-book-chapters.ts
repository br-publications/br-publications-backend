import { QueryInterface, DataTypes } from 'sequelize';

export default {
    async up(queryInterface: QueryInterface): Promise<void> {
        await queryInterface.addColumn('book_chapters', 'is_published', {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        });
    },

    async down(queryInterface: QueryInterface): Promise<void> {
        await queryInterface.removeColumn('book_chapters', 'is_published');
    },
};
