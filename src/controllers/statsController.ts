import { Request, Response } from 'express';
import { QueryTypes, Op } from 'sequelize';

// We access the sequelize instance via the model's static sequelize prop
// Using a direct import avoids circular deps
let sequelizeInstance: any = null;

const getSequelize = () => {
    try {
        if (!sequelizeInstance) {

            const BookChapterSubmission = require('../models/bookChapterSubmission').default;
            if (!BookChapterSubmission) throw new Error('Failed to require bookChapterSubmission model');
            sequelizeInstance = BookChapterSubmission.sequelize;
            if (!sequelizeInstance) throw new Error('BookChapterSubmission.sequelize is undefined');

        }
        return sequelizeInstance;
    } catch (err) {
        console.error('❌ Error in getSequelize:', err);
        throw err;
    }
};

/**
 * GET /api/stats/overview
 * Returns current total counts for KPI cards
 */
export const getOverview = async (req: Request, res: Response): Promise<void> => {
    try {
        const seq = getSequelize();

        const [
            bcsResult,
            textBookResult,
            publishedBooksResult,
            publishedChaptersResult,
            recruitmentResult,
            projectsResult,
            contactResult,
            pendingReviewsResult,
            usersResult,
        ] = await Promise.all([
            seq.query(`SELECT COUNT(*) AS total FROM book_chapter_submissions`, { type: QueryTypes.SELECT }),
            seq.query(`SELECT COUNT(*) AS total FROM text_book_submissions`, { type: QueryTypes.SELECT }),
            seq.query(`SELECT COUNT(*) AS total FROM published_books`, { type: QueryTypes.SELECT }),
            seq.query(`SELECT COUNT(*) AS total FROM published_book_chapters`, { type: QueryTypes.SELECT }),
            seq.query(`SELECT COUNT(*) AS total FROM recruitment_submissions`, { type: QueryTypes.SELECT }),
            seq.query(`SELECT COUNT(*) AS total FROM project_internship_submissions`, { type: QueryTypes.SELECT }),
            seq.query(`SELECT COUNT(*) AS total FROM contact_inquiries WHERE status = 'PENDING'`, { type: QueryTypes.SELECT }),
            seq.query(`SELECT COUNT(*) AS total FROM book_chapter_reviewer_assignments WHERE status = 'PENDING'`, { type: QueryTypes.SELECT }),
            seq.query(`SELECT COUNT(*) AS total FROM users`, { type: QueryTypes.SELECT }),
        ]);

        res.json({
            success: true,
            data: {
                bookChapterSubmissions: parseInt((bcsResult[0] as any).total) || 0,
                textBookSubmissions: parseInt((textBookResult[0] as any).total) || 0,
                publishedBooks: parseInt((publishedBooksResult[0] as any).total) || 0,
                publishedBookChapters: parseInt((publishedChaptersResult[0] as any).total) || 0,
                recruitmentApplications: parseInt((recruitmentResult[0] as any).total) || 0,
                projectsInternships: parseInt((projectsResult[0] as any).total) || 0,
                pendingContactInquiries: parseInt((contactResult[0] as any).total) || 0,
                pendingReviews: parseInt((pendingReviewsResult[0] as any).total) || 0,
                totalUsers: parseInt((usersResult[0] as any).total) || 0,
            },
        });
    } catch (error: any) {
        console.error('❌ Error fetching stats overview:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch statistics', error: error.message });
    }
};

/**
 * GET /api/stats/monthly-report?month=2026-02
 * Returns aggregated data for the given month (defaults to previous month)
 * Used by both the dashboard and the monthly email scheduler
 */
export const getMonthlyReport = async (req: Request, res: Response): Promise<void> => {
    try {
        const seq = getSequelize();

        // Determine month range
        const monthParam = req.query.month as string;
        let startDate: Date;
        let endDate: Date;

        if (monthParam) {
            const [year, month] = monthParam.split('-').map(Number);
            startDate = new Date(year, month - 1, 1);
            endDate = new Date(year, month, 0, 23, 59, 59);
        } else {
            // Default: current month
            const now = new Date();
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        }

        const data = await buildMonthlyReportData(seq, startDate, endDate);

        res.json({
            success: true,
            data,
            period: {
                start: startDate.toISOString(),
                end: endDate.toISOString(),
                label: startDate.toLocaleString('en-IN', { month: 'long', year: 'numeric' }),
            },
        });
    } catch (error: any) {
        console.error('❌ Error fetching monthly report:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch monthly report', error: error.message });
    }
};

/**
 * POST /api/stats/send-email-report
 * Manually trigger the monthly email report (admin only)
 */
export const sendMonthlyEmailNow = async (req: Request, res: Response): Promise<void> => {
    try {
        const { sendMonthlyReport } = await import('../utils/monthlyReportScheduler');
        await sendMonthlyReport();
        res.json({ success: true, message: 'Monthly report email sent successfully' });
    } catch (error: any) {
        console.error('Error sending monthly report email:', error);
        res.status(500).json({ success: false, message: 'Failed to send monthly report' });
    }
};

/**
 * GET /api/stats/extended
 * Returns extended data for Phase 2 charts (User Growth, Roles, Top Reviewers, Editor Workload)
 */
export const getExtendedStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const seq = getSequelize();

        const [
            userGrowthResult,
            userRolesResult,
            reviewerActivityResult,
            topReviewersResult,
            editorWorkloadResult,
        ] = await Promise.all([
            // 1. User Growth (Last 6 Months)
            // Group by month using DATE_TRUNC
            seq.query(`
                SELECT DATE_TRUNC('month', "createdAt") AS month, COUNT(id) AS count
                FROM users 
                WHERE "createdAt" >= (NOW() - INTERVAL '6 months')
                GROUP BY DATE_TRUNC('month', "createdAt")
                ORDER BY month ASC
    `, { type: QueryTypes.SELECT }),

            // 2. User Roles Breakdown
            seq.query(`
                SELECT role, COUNT(id) AS count 
                FROM users 
                GROUP BY role
    `, { type: QueryTypes.SELECT }),

            // 3. Reviewer Activity (Assignment Statuses)
            seq.query(`
                SELECT status, COUNT(id) AS count 
                FROM book_chapter_reviewer_assignments 
                GROUP BY status
    `, { type: QueryTypes.SELECT }),

            // 4. Top Reviewers (by # of COMPLETED assignments)
            seq.query(`
                SELECT r.id, r."fullName" as name, r.email, COUNT(a.id) AS count 
                FROM book_chapter_reviewer_assignments a 
                JOIN users r ON a."reviewerId" = r.id 
                WHERE a.status = 'COMPLETED' 
                GROUP BY r.id, r."fullName", r.email 
                ORDER BY count DESC 
                LIMIT 5
    `, { type: QueryTypes.SELECT }),

            // 5. Editor Workload (by # of submissions currently assigned)
            seq.query(`
                SELECT e.id, e."fullName" as name, e.email, COUNT(s.id) AS count 
                FROM book_chapter_submissions s 
                JOIN users e ON s."assignedEditorId" = e.id 
                GROUP BY e.id, e."fullName", e.email 
                ORDER BY count DESC 
                LIMIT 5
            `, { type: QueryTypes.SELECT })
        ]);

        const toStatusMap = (rows: any[], keyField: string) => {
            const map: Record<string, number> = {};
            rows.forEach((r: any) => { map[r[keyField]] = parseInt(r.count) || 0; });
            return map;
        };

        const toArrayNumbers = (rows: any[]) => {
            return rows.map((r: any) => ({
                ...r,
                count: parseInt(r.count) || 0
            }));
        };

        res.json({
            success: true,
            data: {
                userGrowth: toArrayNumbers(userGrowthResult),
                userRoles: toStatusMap(userRolesResult, 'role'),
                reviewerActivity: toStatusMap(reviewerActivityResult, 'status'),
                topReviewers: toArrayNumbers(topReviewersResult),
                editorWorkload: toArrayNumbers(editorWorkloadResult),
            }
        });

    } catch (error: any) {
        console.error('❌ Error fetching extended stats:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch extended statistics', error: error.message });
    }
};

/**
 * GET /api/stats/engagement
 * Returns Phase 3 data for Geographic Distribution, Publishing Trends, and Recent Activity Feed
 */
export const getEngagementStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const seq = getSequelize();

        const [
            geoResult,
            trendsBooksResult,
            trendsChapResult,
            recentUsersResult,
            recentSubsResult
        ] = await Promise.all([
            // 1. Geographic Distribution (Group by Country)
            seq.query(`
                SELECT COALESCE(country, 'Unknown') as country, COUNT(id) AS count 
                FROM users 
                GROUP BY country 
                ORDER BY count DESC 
                LIMIT 10
    `, { type: QueryTypes.SELECT }),

            // 2. Publishing Trends (Books over 12 mo)
            seq.query(`
                SELECT DATE_TRUNC('month', "createdAt") AS month, COUNT(id) AS count 
                FROM published_books 
                WHERE "createdAt" >= (NOW() - INTERVAL '12 months') 
                GROUP BY DATE_TRUNC('month', "createdAt") 
                ORDER BY month ASC
    `, { type: QueryTypes.SELECT }),

            // 3. Publishing Trends (Chapters over 12 mo)
            seq.query(`
                SELECT DATE_TRUNC('month', created_at) AS month, COUNT(id) AS count 
                FROM published_book_chapters 
                WHERE created_at >= (NOW() - INTERVAL '12 months') 
                GROUP BY DATE_TRUNC('month', created_at) 
                ORDER BY month ASC
    `, { type: QueryTypes.SELECT }),

            // 4. Recent Activity: Users
            seq.query(`
                SELECT 'USER_SIGNUP' as type, id, "fullName" as title, "createdAt" as timestamp 
                FROM users 
                ORDER BY "createdAt" DESC 
                LIMIT 10
    `, { type: QueryTypes.SELECT }),

            // 5. Recent Activity: Submissions
            seq.query(`
                SELECT 'SUBMISSION' as type, id, "bookTitle" as title, "createdAt" as timestamp 
                FROM book_chapter_submissions 
                ORDER BY "createdAt" DESC 
                LIMIT 10
            `, { type: QueryTypes.SELECT })
        ]);

        const toArrayNumbers = (rows: any[]) => {
            return rows.map((r: any) => ({
                ...r,
                count: parseInt(r.count) || 0
            }));
        };

        // Merge and sort recent activity chronologically
        const recentActivity = [...(recentUsersResult as any[]), ...(recentSubsResult as any[])]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 10);

        // Merge Trends by Month
        const trendsMap: Record<string, { month: string; books: number; chapters: number }> = {};

        // Populate Books
        (trendsBooksResult as any[]).forEach(r => {
            const m = new Date(r.month).toISOString().slice(0, 7); // YYYY-MM
            trendsMap[m] = { month: r.month, books: parseInt(r.count), chapters: 0 };
        });

        // Populate Chapters
        (trendsChapResult as any[]).forEach(r => {
            const m = new Date(r.month).toISOString().slice(0, 7); // YYYY-MM
            if (!trendsMap[m]) {
                trendsMap[m] = { month: r.month, books: 0, chapters: parseInt(r.count) };
            } else {
                trendsMap[m].chapters += parseInt(r.count);
            }
        });

        const publishingTrends = Object.values(trendsMap).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

        res.json({
            success: true,
            data: {
                geographicDistribution: toArrayNumbers(geoResult),
                publishingTrends,
                recentActivity
            }
        });

    } catch (error: any) {
        console.error('❌ Error fetching engagement stats:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch engagement statistics', error: error.message });
    }
};

// ─────────────────────────────────────────────
// HELPER — shared by controller + scheduler
// ─────────────────────────────────────────────
export const buildMonthlyReportData = async (seq: any, startDate: Date, endDate: Date) => {
    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();

    const [
        bcsTotal,
        bcsStatusBreakdown,
        textBookTotal,
        textBookStatusBreakdown,
        newPublishedBooks,
        newPublishedChapters,
        publishedByType,
        recruitmentTotal,
        recruitmentStatusBreakdown,
        recruitmentByRole,
        projectsTotal,
        projectsTypeBreakdown,
        projectsStatusBreakdown,
        contactTotal,
        contactStatusBreakdown,
        usersThisMonth,
    ] = await Promise.all([
        // 1. Book Chapter Submissions
        seq.query(`SELECT COUNT(*) AS total FROM book_chapter_submissions WHERE "createdAt" BETWEEN :start AND :end`, {
            replacements: { start: startISO, end: endISO }, type: QueryTypes.SELECT,
        }),
        seq.query(`SELECT status, COUNT(*) AS count FROM book_chapter_submissions WHERE "createdAt" BETWEEN :start AND :end GROUP BY status`, {
            replacements: { start: startISO, end: endISO }, type: QueryTypes.SELECT,
        }),

        // 2. Textbook Submissions
        seq.query(`SELECT COUNT(*) AS total FROM text_book_submissions WHERE "createdAt" BETWEEN :start AND :end`, {
            replacements: { start: startISO, end: endISO }, type: QueryTypes.SELECT,
        }),
        seq.query(`SELECT status, COUNT(*) AS count FROM text_book_submissions WHERE "createdAt" BETWEEN :start AND :end GROUP BY status`, {
            replacements: { start: startISO, end: endISO }, type: QueryTypes.SELECT,
        }),

        // 3. Published Books (textbooks)
        seq.query(`SELECT COUNT(*) AS total FROM published_books WHERE "createdAt" BETWEEN :start AND :end`, {
            replacements: { start: startISO, end: endISO }, type: QueryTypes.SELECT,
        }),
        // 3b. Published Book Chapters
        seq.query(`SELECT COUNT(*) AS total FROM published_book_chapters WHERE created_at BETWEEN :start AND :end`, {
            replacements: { start: startISO, end: endISO }, type: QueryTypes.SELECT,
        }),
        seq.query(`SELECT "bookType", COUNT(*) AS count FROM published_books GROUP BY "bookType"`, {
            type: QueryTypes.SELECT,
        }),

        // 4. Recruitment
        seq.query(`SELECT COUNT(*) AS total FROM recruitment_submissions WHERE "createdAt" BETWEEN :start AND :end`, {
            replacements: { start: startISO, end: endISO }, type: QueryTypes.SELECT,
        }),
        seq.query(`SELECT status, COUNT(*) AS count FROM recruitment_submissions WHERE "createdAt" BETWEEN :start AND :end GROUP BY status`, {
            replacements: { start: startISO, end: endISO }, type: QueryTypes.SELECT,
        }),
        seq.query(`SELECT "appliedRole", COUNT(*) AS count FROM recruitment_submissions WHERE "createdAt" BETWEEN :start AND :end GROUP BY "appliedRole"`, {
            replacements: { start: startISO, end: endISO }, type: QueryTypes.SELECT,
        }),

        // 5. Projects/Internships
        seq.query(`SELECT COUNT(*) AS total FROM project_internship_submissions WHERE "createdAt" BETWEEN :start AND :end`, {
            replacements: { start: startISO, end: endISO }, type: QueryTypes.SELECT,
        }),
        seq.query(`SELECT "submissionType", COUNT(*) AS count FROM project_internship_submissions WHERE "createdAt" BETWEEN :start AND :end GROUP BY "submissionType"`, {
            replacements: { start: startISO, end: endISO }, type: QueryTypes.SELECT,
        }),
        seq.query(`SELECT status, COUNT(*) AS count FROM project_internship_submissions WHERE "createdAt" BETWEEN :start AND :end GROUP BY status`, {
            replacements: { start: startISO, end: endISO }, type: QueryTypes.SELECT,
        }),

        // 6. Contact Inquiries
        seq.query(`SELECT COUNT(*) AS total FROM contact_inquiries WHERE created_at BETWEEN :start AND :end`, {
            replacements: { start: startISO, end: endISO }, type: QueryTypes.SELECT,
        }),
        seq.query(`SELECT status, COUNT(*) AS count FROM contact_inquiries WHERE created_at BETWEEN :start AND :end GROUP BY status`, {
            replacements: { start: startISO, end: endISO }, type: QueryTypes.SELECT,
        }),

        // Users registered this month
        seq.query(`SELECT COUNT(*) AS total FROM users WHERE "createdAt" BETWEEN :start AND :end`, {
            replacements: { start: startISO, end: endISO }, type: QueryTypes.SELECT,
        }),
    ]);

    const toStatusMap = (rows: any[]) => {
        const map: Record<string, number> = {};
        rows.forEach((r: any) => {
            const key = r.status || r.submissionType || r.appliedRole || r.bookType || 'Unknown';
            map[key] = parseInt(r.count) || 0;
        });
        return map;
    };

    return {
        bookChapterSubmissions: {
            total: parseInt((bcsTotal[0] as any).total) || 0,
            byStatus: toStatusMap(bcsStatusBreakdown as any[]),
        },
        textBookSubmissions: {
            total: parseInt((textBookTotal[0] as any).total) || 0,
            byStatus: toStatusMap(textBookStatusBreakdown as any[]),
        },
        publications: {
            newBooks: parseInt((newPublishedBooks[0] as any).total) || 0,
            newChapters: parseInt((newPublishedChapters[0] as any).total) || 0,
            totalByType: toStatusMap(publishedByType as any[]),
        },
        recruitment: {
            total: parseInt((recruitmentTotal[0] as any).total) || 0,
            byStatus: toStatusMap(recruitmentStatusBreakdown as any[]),
            byRole: toStatusMap(recruitmentByRole as any[]),
        },
        projects: {
            total: parseInt((projectsTotal[0] as any).total) || 0,
            byType: toStatusMap(projectsTypeBreakdown as any[]),
            byStatus: toStatusMap(projectsStatusBreakdown as any[]),
        },
        contactInquiries: {
            total: parseInt((contactTotal[0] as any).total) || 0,
            byStatus: toStatusMap(contactStatusBreakdown as any[]),
        },
        newUsers: parseInt((usersThisMonth[0] as any).total) || 0,
    };
};
