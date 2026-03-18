import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { Client } from 'pg';

dotenv.config();

async function runMigration() {
    const client = new Client({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 5432,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    });

    try {
        await client.connect();

        // Check if migration already ran
        const metaResult = await client.query(
            `SELECT name FROM "SequelizeMeta" WHERE name = '20260220-refactor-submission-flow.sql'`
        );
        if (metaResult.rows.length > 0) {
            await client.end();
            process.exit(0);
        }

        // Show current state before migration
        const submissionCounts = await client.query(`
            SELECT status, COUNT(*) as count 
            FROM book_chapter_submissions 
            GROUP BY status 
            ORDER BY status
        `);
        submissionCounts.rows.forEach((row: any) => {
        });

        const chapterCounts = await client.query(`
            SELECT status, COUNT(*) as count 
            FROM individual_chapters 
            GROUP BY status 
            ORDER BY status
        `);
        chapterCounts.rows.forEach((row: any) => {
        });

        // Run the SQL migration
        const sqlPath = path.join(__dirname, 'migrations', '20260220-refactor-submission-flow.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        await client.query(sql);

        // Show state after migration
        const newSubmissionCounts = await client.query(`
            SELECT status, COUNT(*) as count 
            FROM book_chapter_submissions 
            GROUP BY status 
            ORDER BY status
        `);
        newSubmissionCounts.rows.forEach((row: any) => {
        });

        const newChapterCounts = await client.query(`
            SELECT status, COUNT(*) as count 
            FROM individual_chapters 
            GROUP BY status 
            ORDER BY status
        `);
        newChapterCounts.rows.forEach((row: any) => {
        });

        await client.end();
        process.exit(0);
    } catch (error) {
        await client.end();
        process.exit(1);
    }
}

runMigration();
