import { Sequelize } from 'sequelize';

export async function fixTable(sequelize: Sequelize) {
    try {
        console.log('Running fixTable...');
        
        // 1. Add fileData column
        await sequelize.query(
            "ALTER TABLE book_chapter_files ADD COLUMN IF NOT EXISTS \"fileData\" bytea;"
        ).catch(e => console.log('fileData already exists or syntax error', e.message));
        
        // 2. Make fileUrl nullable
        await sequelize.query(
            "ALTER TABLE book_chapter_files ALTER COLUMN \"fileUrl\" DROP NOT NULL;"
        ).catch(e => console.log('fileUrl is already nullable or does not exist', e.message));

        console.log('Successfully patched book_chapter_files directly in the Database!');
    } catch (e) {
        console.error('fixTable failed', e);
        throw e;
    }
}
