/**
 * Standalone script to create the contact_inquiries table.
 * Run with: npx ts-node src/scripts/create-contact-inquiries-table.ts
 */

import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME as string,
    process.env.DB_USER as string,
    process.env.DB_PASSWORD as string,
    {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 5432,
        dialect: 'postgres',
        logging: false,
    }
);

async function run() {
    try {
        await sequelize.authenticate();
        

        const queryInterface = sequelize.getQueryInterface();

        // Check if table already exists
        const tables = await queryInterface.showAllTables();
        if (tables.includes('contact_inquiries')) {
            
            await sequelize.close();
            return;
        }

        await queryInterface.createTable('contact_inquiries', {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            name: { type: DataTypes.STRING(200), allowNull: false },
            email: { type: DataTypes.STRING(255), allowNull: false },
            phone: { type: DataTypes.STRING(50), allowNull: true },
            message: { type: DataTypes.TEXT, allowNull: false },
            status: {
                type: DataTypes.ENUM('PENDING', 'ACKNOWLEDGED'),
                allowNull: false,
                defaultValue: 'PENDING',
            },
            admin_notes: { type: DataTypes.TEXT, allowNull: true },
            reviewed_by: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: { model: 'users', key: 'id' },
                onDelete: 'SET NULL',
            },
            created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
            updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        });

        await queryInterface.addIndex('contact_inquiries', ['status']);
        await queryInterface.addIndex('contact_inquiries', ['email']);

        
        await sequelize.close();
    } catch (error) {
        console.error('❌ Migration failed:', error);
        await sequelize.close();
        process.exit(1);
    }
}

run();
