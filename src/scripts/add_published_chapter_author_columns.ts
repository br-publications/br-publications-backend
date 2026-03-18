import { Sequelize } from 'sequelize';
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

async function runMigration() {
    try {
        
        await sequelize.authenticate();
        

        

        // Add main_author column
        await sequelize.query(`
            ALTER TABLE published_book_chapters 
            ADD COLUMN IF NOT EXISTS main_author JSONB;
        `);
        

        // Add co_authors_data column
        await sequelize.query(`
            ALTER TABLE published_book_chapters 
            ADD COLUMN IF NOT EXISTS co_authors_data JSONB;
        `);
        

        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error running migration:', error);
        process.exit(1);
    }
}

runMigration();
