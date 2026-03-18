import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const sequelize = new Sequelize(
    process.env.DB_NAME as string,
    process.env.DB_USER as string,
    process.env.DB_PASSWORD as string,
    {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 5432,
        dialect: 'postgres',
        logging: console.log,
    }
);

async function addColumn() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database.');

        const queryInterface = sequelize.getQueryInterface();
        const tableDescription = await queryInterface.describeTable('text_book_submissions');

        if (!tableDescription.isBulkSubmission) {
            console.log('Adding isBulkSubmission column...');
            await queryInterface.addColumn('text_book_submissions', 'isBulkSubmission', {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            });
            console.log('✅ Column added successfully.');
        } else {
            console.log('ℹ️ Column isBulkSubmission already exists.');
        }

    } catch (error) {
        console.error('❌ Error adding column:', error);
    } finally {
        await sequelize.close();
    }
}

addColumn();
