import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME!, process.env.DB_USER!, process.env.DB_PASSWORD!, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false
});

const migrationsToMark = [
    '20260223000001-create-published-book-chapters.js',
    '20260224114848-change-profile-picture-type.js',
    '20260224164500-add-detailed-profile-fields-to-users.js',
    '20260226000000-create-contact-inquiries.ts',
    '20260301022100-make-recruitment-fields-optional.js',
    '20260302100000-create-delivery-addresses.js',
    '20260303000000-add-awaiting-delivery-status.js'
];

async function syncMigrations() {
    try {
        await sequelize.authenticate();
        console.log('Connected to database.');

        // Check if SequelizeMeta exists
        const [results] = await sequelize.query("SELECT * FROM information_schema.tables WHERE table_name = 'SequelizeMeta'");

        if (results.length === 0) {
            console.log('SequelizeMeta table not found. Running migrations normally might be better.');
            return;
        }

        for (const migration of migrationsToMark) {
            const [existing] = await sequelize.query(`SELECT name FROM "SequelizeMeta" WHERE name = :name`, {
                replacements: { name: migration },
                type: 'SELECT' as any
            });

            if (!existing) {
                console.log(`Marking migration ${migration} as completed...`);
                await sequelize.query(`INSERT INTO "SequelizeMeta" (name) VALUES (:name)`, {
                    replacements: { name: migration }
                });
            } else {
                console.log(`Migration ${migration} already marked as completed.`);
            }
        }

        console.log('Migration sync completed.');
    } catch (error) {
        console.error('Error syncing migrations:', error);
    } finally {
        await sequelize.close();
    }
}

syncMigrations();
