'use strict';

/**
 * One-time migration script: adds html_content column to communication_templates.
 * Run: node scripts/add-html-content-column.js
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

        if (tableDesc.html_content) {
            console.log('ℹ️  Column html_content already exists — skipping.');
        } else {
            await qi.addColumn('communication_templates', 'html_content', {
                type: DataTypes.TEXT,
                allowNull: true,
                comment: 'Full HTML source version of the template (separate from rich-text content)',
            });
            console.log('✅ Column html_content added to communication_templates');
        }
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

run();
