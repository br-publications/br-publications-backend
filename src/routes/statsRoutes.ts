import { Router } from 'express';
import { getOverview, getMonthlyReport, getExtendedStats, getEngagementStats, sendMonthlyEmailNow } from '../controllers/statsController';
import * as authMiddleware from '../middleware/auth';

const router = Router();

// All stats routes require admin auth
router.use(authMiddleware.authenticate);
router.use(authMiddleware.authorize(['admin', 'developer']));

// GET /api/stats/overview — KPI counts
router.get('/overview', getOverview);

// GET /api/stats/monthly-report?month=2026-02
router.get('/monthly-report', getMonthlyReport);

// GET /api/stats/extended — Phase 2 charts (User Growth, Roles, Editor/Reviewer stats)
router.get('/extended', getExtendedStats);

// GET /api/stats/engagement — Phase 3 charts (Geo, Publishing Trends, Live Activity)
router.get('/engagement', getEngagementStats);

// POST /api/stats/send-email-report — trigger email manually
router.post('/send-email-report', sendMonthlyEmailNow);

export default router;
