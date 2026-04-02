import { Sequelize } from 'sequelize';

export async function fixPublishedChaptersTable(sequelize: Sequelize) {
    try {
        console.log('🔧 Running fixPublishedChaptersTable hotfix...');

        const columnsToAdd = [
            { name: 'primary_editor', type: 'VARCHAR(200)' },
            { name: 'main_author', type: 'JSONB' },
            { name: 'co_authors_data', type: 'JSONB' },
            { name: 'google_link', type: 'TEXT' },
            { name: 'flipkart_link', type: 'TEXT' },
            { name: 'amazon_link', type: 'TEXT' },
            { name: 'keywords', type: 'JSONB' },
            { name: 'frontmatter_pdfs', type: 'JSONB' },
            { name: 'is_hidden', type: 'BOOLEAN DEFAULT false' },
            { name: 'is_featured', type: 'BOOLEAN DEFAULT false' }
        ];

        for (const col of columnsToAdd) {
            try {
                await sequelize.query(
                    `ALTER TABLE published_book_chapters ADD COLUMN IF NOT EXISTS "${col.name}" ${col.type};`
                );
                console.log(`   ✅ Column "${col.name}" checked/added.`);
            } catch (colErr: any) {
                console.error(`   ❌ Failed to add column "${col.name}":`, colErr.message);
            }
        }

        console.log('✅ Successfully patched published_book_chapters directly in the Database!');
    } catch (e) {
        console.error('❌ fixPublishedChaptersTable failed', e);
        throw e;
    }
}
