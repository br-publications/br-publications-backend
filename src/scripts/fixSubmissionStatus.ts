
const { Client } = require('pg');
require('dotenv').config();

const fixSubmissionStatus = async () => {
    const client = new Client({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: Number(process.env.DB_PORT) || 5432,
    });

    try {
        await client.connect();
        

        const query = `
            UPDATE book_chapter_submissions
            SET status = 'UNDER_REVIEW', "updatedAt" = NOW()
            WHERE status = 'FULL_CHAPTER_SUBMITTED'
            AND id IN (
                SELECT "submission_id" 
                FROM individual_chapters 
                WHERE status IN ('UNDER_REVIEW', 'REVIEW_COMPLETED')
            )
            RETURNING id, "bookTitle";
        `;

        const res = await client.query(query);
        
        

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.end();
    }
};

fixSubmissionStatus();
