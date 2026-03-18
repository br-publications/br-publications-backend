import { QueryInterface, DataTypes } from 'sequelize';

export default {
    async up(queryInterface: QueryInterface): Promise<void> {
        await queryInterface.createTable('conferences', {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            title: {
                type: DataTypes.STRING(600),
                allowNull: false,
            },
            publisher: {
                type: DataTypes.STRING(200),
                allowNull: false,
            },
            publishedDate: {
                type: DataTypes.STRING(50),
                allowNull: true,
            },
            dateRange: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            location: {
                type: DataTypes.STRING(300),
                allowNull: true,
            },
            issn: {
                type: DataTypes.STRING(30),
                allowNull: true,
            },
            doi: {
                type: DataTypes.STRING(200),
                allowNull: true,
            },
            articleCount: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            type: {
                type: DataTypes.STRING(50),
                allowNull: false,
                defaultValue: 'Conference',
            },
            code: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        });

        await queryInterface.addIndex('conferences', ['isActive'], { name: 'idx_conferences_is_active' });
        await queryInterface.addIndex('conferences', ['publisher'], { name: 'idx_conferences_publisher' });
    },

    async down(queryInterface: QueryInterface): Promise<void> {
        await queryInterface.dropTable('conferences');
    },
};
