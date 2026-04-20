import { Op } from 'sequelize';
import PublishingDraft from '../models/publishingDraft';

/**
 * Deletes publishing drafts that haven't been updated in more than 5 days.
 */
export const cleanupExpiredDrafts = async () => {
    try {
        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

        const deletedCount = await PublishingDraft.destroy({
            where: {
                updatedAt: {
                    [Op.lt]: fiveDaysAgo
                }
            }
        });

        if (deletedCount > 0) {
            console.log(`[Cleanup] Deleted ${deletedCount} expired publishing drafts.`);
        }
    } catch (error) {
        console.error('Error cleaning up expired publishing drafts:', error);
    }
};

/**
 * Initializes the periodic cleanup job for drafts.
 * Runs once on startup and then every 24 hours.
 */
export const startDraftCleanup = () => {
    // Run immediately on boot
    cleanupExpiredDrafts();

    // Run every 24 hours
    setInterval(cleanupExpiredDrafts, 24 * 60 * 60 * 1000);
};
