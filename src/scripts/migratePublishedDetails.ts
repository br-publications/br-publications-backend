import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Import models
import PublishedBookChapter from '../models/publishedBookChapter';
import PublishedIndividualChapter from '../models/publishedIndividualChapter';
import PublishedAuthor from '../models/publishedAuthor';
import User from '../models/user';

/**
 * Migrates existing published book chapters' JSON tableContents into the
 * normalized relational tables (published_individual_chapters, published_authors).
 *
 * This function is IDEMPOTENT — it only processes books that have not yet been
 * migrated (i.e., books that have tableContents in JSON but zero rows in
 * published_individual_chapters). It will NEVER delete or overwrite already
 * migrated data, making it safe to run on every server startup.
 *
 * @param sequelize - The active Sequelize instance from the server
 */
export async function migratePublishedDetails(sequelize: Sequelize): Promise<void> {
    console.log('🔧 Running migratePublishedDetails...');

    // Initialize models against the provided sequelize instance
    const models = { User, PublishedBookChapter, PublishedIndividualChapter, PublishedAuthor };
    Object.values(models).forEach((model: any) => {
        if (typeof model.initialize === 'function') model.initialize(sequelize);
    });
    Object.values(models).forEach((model: any) => {
        if (typeof model.associate === 'function') model.associate(models);
    });

    const books = await PublishedBookChapter.findAll();
    console.log(`[migratePublishedDetails] Found ${books.length} published book(s) to check.`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const book of books) {
        const toc = (book as any).tableContents || [];

        if (toc.length === 0) {
            // No legacy JSON data — nothing to migrate for this book
            skippedCount++;
            continue;
        }

        // Check if this book has already been migrated (has relational chapter rows)
        const existingChapterCount = await PublishedIndividualChapter.count({
            where: { publishedBookChapterId: book.id }
        });

        if (existingChapterCount > 0) {
            // Already migrated — skip to avoid overwriting / duplicating data
            console.log(`   ℹ️  Book #${book.id} "${book.title}" already has ${existingChapterCount} chapter row(s). Skipping.`);
            skippedCount++;
            continue;
        }

        // This book needs migration
        console.log(`\n   🔍 Migrating Book #${book.id}: "${book.title}" (${toc.length} chapters)...`);
        const bios = (book as any).authorBiographies || [];

        // 1. Build author map from biographies
        const authorMap = new Map<string, any>();
        for (const bio of bios) {
            if (!bio.authorName) continue;
            const [author] = await PublishedAuthor.findOrCreate({
                where: {
                    name: bio.authorName.trim(),
                    email: (bio.email && bio.email.trim()) || null
                },
                defaults: {
                    name: bio.authorName.trim(),
                    email: (bio.email && bio.email.trim()) || null,
                    affiliation: bio.affiliation || '',
                    biography: bio.biography || '',
                    userId: null
                }
            });
            authorMap.set(bio.authorName.trim().toLowerCase(), author);
            console.log(`      👤 Author matched/created: ${bio.authorName}`);
        }

        // 2. Create individual chapter rows and link authors
        for (const [index, row] of toc.entries()) {
            const indChapter = await PublishedIndividualChapter.create({
                publishedBookChapterId: book.id,
                chapterNumber: row.chapterNumber || String(index + 1).padStart(2, '0'),
                title: row.title || 'Untitled Chapter',
                authors: row.authors || '',
                abstract: row.abstract || '',
                pagesFrom: row.pagesFrom || null,
                pagesTo: row.pagesTo || null,
                pdfKey: row.pdfKey || null,
                pdfName: row.pdfName || null,
            });

            // Link authors via junction table
            const authorNames = row.authors
                ? row.authors.split(/[,;&]|\band\b/i).map((s: string) => s.trim()).filter(Boolean)
                : [];

            for (const name of authorNames) {
                const authorRecord = authorMap.get(name.toLowerCase());
                if (authorRecord) {
                    await (indChapter as any).addAuthorDetail(authorRecord);
                    console.log(`         🔗 Linked chapter "${indChapter.title}" → author "${authorRecord.name}"`);
                }
            }
        }

        console.log(`   ✅ Book #${book.id} migrated successfully.`);
        migratedCount++;
    }

    console.log(`✅ migratePublishedDetails complete. Migrated: ${migratedCount}, Skipped (already done or empty): ${skippedCount}.`);
}

// ─── Standalone CLI entrypoint ─────────────────────────────────────────────
// Allows running directly: npm run migrate:published
// This block only executes when the file is run directly, NOT when imported.
if (require.main === module) {
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

    (async () => {
        try {
            await sequelize.authenticate();
            console.log('✅ Database connected.');
            await migratePublishedDetails(sequelize);
            await sequelize.close();
            process.exit(0);
        } catch (err) {
            console.error('❌ Migration failed:', err);
            process.exit(1);
        }
    })();
}
