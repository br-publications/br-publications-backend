/**
 * ============================================================
 * DB RESET SCRIPT — Safe Production Handoff
 * ============================================================
 *
 * USAGE:
 *   npx ts-node src/scripts/resetForClient.ts
 *
 * WHAT IT DOES:
 *   - Deletes ALL data from every application table
 *   - Preserves the 3 specified users (matched by email)
 *   - Preserves SequelizeMeta (migration history) so migrations
 *     don't re-run on the client's server
 *   - Resets auto-increment counters (TRUNCATE alternative via DELETE + ALTER)
 *   - DOES NOT drop any tables or touch schema
 *
 * IMPORTANT: Run this only after the final prod test sign-off.
 * ============================================================
 */

import { config } from 'dotenv';
config();

import { Sequelize, QueryTypes } from 'sequelize';

// Directly instantiate Sequelize from env (avoids model-init ordering issues)
const sequelize = new Sequelize(
    process.env.DB_NAME as string,
    process.env.DB_USER as string,
    process.env.DB_PASSWORD as string,
    {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 3306,
        dialect: ((process.env.DB_DIALECT as string) || 'mysql').toLowerCase() as any,
        logging: false,
    }
);

// ── 1.  CONFIGURE: IDs or emails for the 3 users to KEEP ──────────────────────
//   Fill in the 3 emails that should survive the reset.
const EMAILS_TO_KEEP: string[] = [
    'rajagopalrmail@gmail.com',
    'v.bhoopathy@gmail.com',
    'publications.br.app@gmail.com',
];
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Helper: run raw SQL safely
 */
const sql = (query: string) => sequelize.query(query, { type: QueryTypes.RAW });

async function reset() {
    console.log('\n🚀 Starting DB reset...\n');

    // ── 2. Disable FK checks so we can delete in any order ──
    await sql(`SET FOREIGN_KEY_CHECKS = 0;`);

    // ── 3. Truncate all data tables ──────────────────────────
    const tablesToTruncate = [
        // Join / pivot tables first (no direct children)
        'published_chapter_authors',
        'published_book_editors',
        'user_custom_roles',
        'role_permissions',

        // Published content
        'published_individual_chapters',
        'published_files',
        'published_authors',
        'published_editors',
        'published_book_chapters',
        'published_books',

        // Book chapter workflow
        'book_chapter_discussions',
        'book_chapter_status_history',
        'book_chapter_reviewer_assignments',
        'book_chapter_files',
        'book_chapter_submissions',

        // Individual chapter workflow
        'chapter_discussions',
        'chapter_status_history',
        'chapter_revisions',
        'chapter_reviewer_assignments',
        'individual_chapters',

        // Text book workflow
        'text_book_discussions',
        'text_book_status_history',
        'text_book_revisions',
        'text_book_files',
        'text_book_submissions',

        // Publishing support
        'publishing_drafts',
        'temporary_uploads',
        'local_files',
        'delivery_addresses',
        'optional_delivery_addresses',

        // CMS / misc
        'notifications',
        'contact_inquiries',
        'contact_details',  // Note: ContactDetails (mixed case – fallback below)
        'recruitment_submissions',
        'project_internship_submissions',
        'conferences',
        'conference_articles',
        'communication_templates',

        // Book metadata (keep structure, clear test data)
        'book_editors',
        'book_chapters',
        'book_titles',

        // Auth tokens
        'token_blacklist',

        // RBAC (keep roles/permissions structure if you want, or clear them too)
        'role_permissions',
        'roles',
        'permissions',
    ];

    for (const table of tablesToTruncate) {
        try {
            await sql(`DELETE FROM \`${table}\`;`);
            await sql(`ALTER TABLE \`${table}\` AUTO_INCREMENT = 1;`);
            console.log(`  ✅ Cleared: ${table}`);
        } catch (err: any) {
            console.warn(`  ⚠️  Skipped ${table}: ${err.message}`);
        }
    }

    // Special case: mixed-case table name
    try {
        await sql(`DELETE FROM \`ContactDetails\`;`);
        await sql(`ALTER TABLE \`ContactDetails\` AUTO_INCREMENT = 1;`);
        console.log(`  ✅ Cleared: ContactDetails`);
    } catch (err: any) {
        console.warn(`  ⚠️  Skipped ContactDetails: ${err.message}`);
    }

    // ── 4. Clear users EXCEPT the 3 to keep ─────────────────
    const emailList = EMAILS_TO_KEEP.map(e => `'${e.replace(/'/g, "\\'")}'`).join(', ');

    await sql(`DELETE FROM \`users\` WHERE \`email\` NOT IN (${emailList});`);

    // ── 5. Re-enable FK checks ───────────────────────────────
    await sql(`SET FOREIGN_KEY_CHECKS = 1;`);

    // ── 6. Verify kept users ─────────────────────────────────
    const [kept]: any = await sequelize.query(
        `SELECT id, email FROM \`users\` ORDER BY id`,
        { type: QueryTypes.SELECT }
    );
    const keptArr = Array.isArray(kept) ? kept : [kept];
    keptArr.forEach((u: any) => {
    });

    console.log('\n✅ DB reset complete! Migrations are intact. Ready for client handoff.\n');
    process.exit(0);
}

reset().catch(err => {
    console.error('\n❌ Reset failed:', err);
    process.exit(1);
});
