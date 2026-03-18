/**
 * ============================================================
 * MONTHLY REPORT SCHEDULER
 * ============================================================
 * Runs on the 1st of every month at 08:00 AM.
 * Aggregates last month's data and sends a report to all admins.
 */

import cron from 'node-cron';
import { QueryTypes } from 'sequelize';
import { buildMonthlyReportData } from '../controllers/statsController';
import { sendMonthlyAdminReportEmail } from './emails/monthlyReportEmail';

let sequelizeInstance: any = null;
const getSequelize = () => {
    if (!sequelizeInstance) {
        const User = require('../models/user').default;
        sequelizeInstance = User.sequelize;
    }
    return sequelizeInstance;
};

export const sendMonthlyReport = async (): Promise<void> => {
    try {

        const seq = getSequelize();

        // Calculate "last month" date range
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        const periodLabel = startDate.toLocaleString('en-IN', { month: 'long', year: 'numeric' });

        // Fetch all admin emails
        const admins: Array<{ email: string; fullName: string }> = await seq.query(
            `SELECT email, "fullName" FROM users WHERE role IN ('admin', 'developer') AND "emailVerified" = true`,
            { type: QueryTypes.SELECT }
        );

        if (admins.length === 0) {
            console.warn('⚠️  No admin users found — monthly report not sent.');
            return;
        }

        // Aggregate all data
        const reportData = await buildMonthlyReportData(seq, startDate, endDate);

        // Send to each admin
        const report = {
            period: {
                label: periodLabel,
                start: startDate.toISOString(),
                end: endDate.toISOString(),
            },
            data: reportData,
        };

        const results = await Promise.allSettled(
            admins.map((admin) =>
                sendMonthlyAdminReportEmail(admin.email, admin.fullName || 'Admin', report)
            )
        );

        const sent = results.filter((r) => r.status === 'fulfilled').length;
        const failed = results.filter((r) => r.status === 'rejected').length;

    } catch (error) {
        console.error('❌ Failed to send monthly report:', error);
        throw error;
    }
};

/**
 * Start the cron scheduler.
 * Schedule: 0 8 1 * * = 08:00 AM on the 1st of every month
 */
export const startMonthlyReportScheduler = (): void => {
    // Run on the 1st of every month at 08:00 AM (server timezone)
    cron.schedule('0 8 1 * *', async () => {

        await sendMonthlyReport();
    });


};
