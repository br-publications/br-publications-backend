
const { Sequelize } = require('sequelize');
const config = require('../config/database');

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

async function checkTables() {
    try {
        await sequelize.authenticate();
        const [results] = await sequelize.query(
            "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
        );
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkTables();
