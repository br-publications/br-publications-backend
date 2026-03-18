import { QueryInterface, DataTypes } from 'sequelize';

export default {
    up: async (queryInterface: QueryInterface): Promise<void> => {
        // Create contact_inquiries table
        await queryInterface.createTable('contact_inquiries', {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING(200),
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            phone: {
                type: DataTypes.STRING(50),
                allowNull: true,
            },
            message: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            status: {
                type: DataTypes.ENUM('PENDING', 'ACKNOWLEDGED'),
                allowNull: false,
                defaultValue: 'PENDING',
            },
            admin_notes: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            reviewed_by: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onDelete: 'SET NULL',
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        });

        await queryInterface.addIndex('contact_inquiries', ['status']);
        await queryInterface.addIndex('contact_inquiries', ['email']);
        
    },

    down: async (queryInterface: QueryInterface): Promise<void> => {
        await queryInterface.dropTable('contact_inquiries');
        
    },
};
