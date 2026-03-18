'use strict';

/**
 * One-time migration script: adds content_mode column to communication_templates.
 * Run: node scripts/add-content-mode-column.js
 */

const { Sequelize, DataTypes } = require('sequelize');
const config = require('../../src/config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
        host: dbConfig.host,
        dialect: dbConfig.dialect,
        logging: false,
    }
);

async function run() {
    const qi = sequelize.getQueryInterface();

    try {
        await sequelize.authenticate();
        console.log('✅ DB connected');

        const tableDesc = await qi.describeTable('communication_templates');

        if (tableDesc.content_mode) {
            console.log('ℹ️  Column content_mode already exists — skipping.');
        } else {
            await qi.addColumn('communication_templates', 'content_mode', {
                type: DataTypes.STRING(10),
                allowNull: false,
                defaultValue: 'rich',
                comment: '"rich" = use content field for emails, "html" = use htmlContent field',
            });
            console.log('✅ Column content_mode added to communication_templates');
        }
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

run();
