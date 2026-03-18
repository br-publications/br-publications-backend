
const { Sequelize } = require('sequelize');
const config = require('../config/database');

// Adjust config for different environments if necessary
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
        host: dbConfig.host,
        dialect: dbConfig.dialect,
    }
);

async function fixMigrations() {
    try {
        await sequelize.authenticate();
        

        const migrationName = '20260120140000-create-book-chapter-discussions.js';

        // Check if it exists
        const [results] = await sequelize.query(
            `SELECT * FROM "SequelizeMeta" WHERE name = '${migrationName}'`
        );

        if (results.length === 0) {
            
            await sequelize.query(
                `INSERT INTO "SequelizeMeta" (name) VALUES ('${migrationName}')`
            );
            
        } else {
            
        }

    } catch (error) {
        console.error('Unable to connect to the database:', error);
    } finally {
        await sequelize.close();
    }
}

fixMigrations();
