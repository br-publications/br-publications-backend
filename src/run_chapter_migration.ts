import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

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
        

        const sqlPath = path.join(__dirname, 'migrations', 'manual-chapter-centric-tables.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        
        await sequelize.query(sql);

        

        // Verify tables were created
        const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('individual_chapters', 'chapter_reviewer_assignments', 'chapter_revisions', 'chapter_status_history')
      ORDER BY table_name;
    `);

        
        tables.forEach((table: any) => {
            
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error running migration:', error);
        process.exit(1);
    }
}

runMigration();
