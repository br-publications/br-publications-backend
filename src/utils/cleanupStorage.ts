import { Op } from 'sequelize';
import path from 'path';
import fs from 'fs';
import TemporaryUpload from '../models/temporaryUpload';

const TEMP_UPLOAD_DIR = path.resolve('uploads/temp');

/**
 * Purge expired database entries and old files from disk
 */
export const cleanupStorage = async () => {
    try {
        // 1. Clean up Database (TemporaryUpload)
        const deletedRows = await TemporaryUpload.destroy({
            where: {
                expiresAt: {
                    [Op.lt]: new Date(),
                },
            },
        });

        if (deletedRows > 0) {
            console.log(`🧹 Cleaned up ${deletedRows} expired database entries from TemporaryUpload.`);
        }

        // 2. Clean up Disk (uploads/temp)
        if (fs.existsSync(TEMP_UPLOAD_DIR)) {
            const files = fs.readdirSync(TEMP_UPLOAD_DIR);
            const now = Date.now();
            const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;

            let deletedFilesCount = 0;

            for (const file of files) {
                const filePath = path.join(TEMP_UPLOAD_DIR, file);
                try {
                    const stats = fs.statSync(filePath);
                    const age = now - stats.mtime.getTime();

                    // Delete files older than 5 days
                    if (age > FIVE_DAYS_MS && stats.isFile()) {
                        fs.unlinkSync(filePath);
                        deletedFilesCount++;
                    }
                } catch (err) {
                    console.error(`❌ Error checking/deleting file ${file}:`, err);
                }
            }

            if (deletedFilesCount > 0) {
                console.log(`🧹 Cleaned up ${deletedFilesCount} old files from disk (${TEMP_UPLOAD_DIR}).`);
            }
        }
    } catch (error) {
        console.error('❌ Error in cleanupStorage:', error);
    }
};

/**
 * Start the periodic cleanup task
 */
export const startStorageCleanup = () => {
    // Run immediately on start
    cleanupStorage();

    // Then run every 6 hours (21600000 ms)
    setInterval(cleanupStorage, 6 * 60 * 60 * 1000);
};
