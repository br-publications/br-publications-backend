import { Op } from 'sequelize';
import path from 'path';
import fs from 'fs';
import TemporaryUpload from '../models/temporaryUpload';
import LocalFile from '../models/localFile';

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

        // 2. Clean up Disk (uploads/temp AND uploads/published_cache)
        const now = Date.now();
        const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000;

        const cleanupRecursive = (dirPath: string): number => {
            let deletedCount = 0;
            if (!fs.existsSync(dirPath)) return 0;

            const files = fs.readdirSync(dirPath);
            for (const file of files) {
                const fullPath = path.join(dirPath, file);
                try {
                    const stats = fs.statSync(fullPath);
                    if (stats.isDirectory()) {
                        deletedCount += cleanupRecursive(fullPath);
                        // Try to remove empty directory
                        try {
                            if (fs.readdirSync(fullPath).length === 0) {
                                fs.rmdirSync(fullPath);
                            }
                        } catch (e) { }
                    } else if (stats.isFile()) {
                        const age = now - stats.mtime.getTime();
                        if (age > TEN_DAYS_MS) {
                            fs.unlinkSync(fullPath);
                            deletedCount++;
                        }
                    }
                } catch (err) {
                    console.error(`❌ Error checking/deleting file ${fullPath}:`, err);
                }
            }
            return deletedCount;
        };

        const tempDeleted = cleanupRecursive(TEMP_UPLOAD_DIR);
        if (tempDeleted > 0) {
            console.log(`🧹 Cleaned up ${tempDeleted} old files from disk (${TEMP_UPLOAD_DIR}).`);
        }

        const PUBLISHED_CACHE_DIR = path.resolve('uploads/published_cache');
        const cacheDeleted = cleanupRecursive(PUBLISHED_CACHE_DIR);
        if (cacheDeleted > 0) {
            console.log(`🧹 Cleaned up ${cacheDeleted} old files from disk (${PUBLISHED_CACHE_DIR}).`);
        }

        // 3. Clean up Expired Local Admin Files (LocalFile)
        const expiredLocalFiles = await LocalFile.findAll({
            where: {
                expiresAt: {
                    [Op.lt]: new Date(),
                },
            },
        });

        for (const localFile of expiredLocalFiles) {
            try {
                const filePath = path.join(process.cwd(), localFile.filePath.startsWith('/') ? localFile.filePath.substring(1) : localFile.filePath);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
                await localFile.destroy();
            } catch (err) {
                console.error(`❌ Error cleaning up expired local file ${localFile.fileName}:`, err);
            }
        }

        if (expiredLocalFiles.length > 0) {
            console.log(`🧹 Cleaned up ${expiredLocalFiles.length} expired local admin files.`);
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
