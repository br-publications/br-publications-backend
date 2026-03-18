/**
 * Script to update existing PROJECT_DECISION templates to include {{adminNotes}}
 * Run: node /tmp/update-project-templates.js
 */
'use strict';

require('dotenv').config({ path: 'e:/ai-project/ai-project/br-publications-full-stack/br-publications-backend_v2/.env' });
const { Sequelize } = require('sequelize');
const cfg = require('e:/ai-project/ai-project/br-publications-full-stack/br-publications-backend_v2/src/config/database.js')['development'];

const seq = new Sequelize(cfg.database, cfg.username, cfg.password, {
    host: cfg.host,
    port: cfg.port,
    dialect: cfg.dialect,
    logging: false
});

async function run() {
    try {
        await seq.authenticate();
        console.log('Connected to DB.');

        const updates = [
            {
                code: 'PROJECT_DECISION_ACCEPTED',
                content: '<p>Hello {{name}}, congratulations! Your {{submissionType}} application #{{applicationId}} has been accepted. Notes: {{adminNotes}}</p>'
            },
            {
                code: 'PROJECT_DECISION_REJECTED',
                content: '<p>Hello {{name}}, your {{submissionType}} application #{{applicationId}} could not be approved at this time. Notes: {{adminNotes}}</p>'
            }
        ];

        for (const u of updates) {
            const [result] = await seq.query(
                'UPDATE communication_templates SET content = :content WHERE code = :code',
                { replacements: { ...u } }
            );
            console.log(`✅ Updated: ${u.code}`);
        }

        console.log('Done!');
        await seq.close();
    } catch (err) {
        console.error('Error:', err.message);
        await seq.close();
        process.exit(1);
    }
}

run();
