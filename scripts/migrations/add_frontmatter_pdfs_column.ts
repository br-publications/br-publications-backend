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

        const queryInterface = sequelize.getQueryInterface();
        const tableDescription = await queryInterface.describeTable('published_book_chapters');

        if (!tableDescription.frontmatterPdfs) {
            console.log('Adding frontmatterPdfs column...');
            await queryInterface.addColumn('published_book_chapters', 'frontmatterPdfs', {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: null
            });
            console.log('✅ Column frontmatterPdfs added successfully.');
        } else {
            console.log('ℹ️ Column frontmatterPdfs already exists.');
        }

    } catch (error) {
        console.error('❌ Error adding column:', error);
    } finally {
        await sequelize.close();
    }
}

addColumn();
