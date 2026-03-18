
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

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

async function migrateRejected() {
    try {
        console.log('🔌 Connecting to database...');
        await sequelize.authenticate();

        const BookChapterSubmission = (await import('../../src/models/bookChapterSubmission')).default;

        BookChapterSubmission.initialize(sequelize);

        // Find submissions with EDITOR_REJECTED
        const [updatedCount] = await BookChapterSubmission.update(
            { status: 'REJECTED' as any },
            {
                where: {
                    status: 'EDITOR_REJECTED'
                }
            }
        );

        if (updatedCount > 0) {
            console.log(`✅ Migrated ${updatedCount} submissions from EDITOR_REJECTED to REJECTED.`);
        } else {
            console.log('ℹ️ No EDITOR_REJECTED submissions found.');
        }

        await sequelize.close();
        console.log('🎉 Done!');

    } catch (error) {
        console.error('Error:', error);
    }
}

migrateRejected();
