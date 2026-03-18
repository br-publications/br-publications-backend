
import sequelize from '../config/database';

// Check if it's the instance or module
const db = (sequelize as any).default || sequelize;

async function resetChapter() {
    try {
        
        // Updates revisionCount and status
        await db.query(`
            UPDATE "IndividualChapters" 
            SET "revisionCount" = 0, 
                "currentRevisionNumber" = 0,
                "status" = 'MANUSCRIPT_SUBMITTED'
            WHERE id = 21
        `);
        
    } catch (error) {
        console.error('❌ Error resetting chapter:', error);
    }
}

if (db && typeof db.authenticate === 'function') {
    db.authenticate().then(() => {
        
        resetChapter().then(() => process.exit());
    }).catch((err: any) => console.error('DB Connection Error:', err));
} else {
    console.error('Sequelize instance not found or invalid', db);
}
