import express from 'express';
import {
    submitTextBook,
    getMySubmissions,
    getSubmissionById,
    getAdminSubmissions,
    proposalDecision,
    requestRevision,
    submitRevision,
    finalDecision,
    applyIsbn,
    receiveIsbn,
    startPublication,
    publishTextBook,
    downloadFile,
    sendDiscussionMessage,
    getDiscussions,
    getSubmissionStats,
    sendBulkUploadReport,
    checkIsbnAvailability
} from '../controllers/textBookSubmissionController';
import { authenticate, requireVerified } from '../middleware/auth';
import { requireAdmin, hasRole } from '../middleware/roleBasedAccessControl.middleware';
import { UserRole } from '../models/user';
import multer from 'multer';

const router = express.Router();

// Configure multer for file uploads (store in memory for DB storage)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 20 * 1024 * 1024 // 20MB max
    }
});

/**
 * @swagger
 * tags:
 *   name: Text Book Submissions
 *   description: Text book submission management endpoints
 */

// Submit new text book (Authenticated users)
router.post(
    '/submit',
    authenticate,
    requireVerified,
    hasRole(UserRole.USER, UserRole.AUTHOR, UserRole.ADMIN, UserRole.DEVELOPER),
    upload.fields([
        { name: 'contentFile', maxCount: 1 },
        { name: 'fullTextFile', maxCount: 1 }
    ]),
    submitTextBook
);

// Get my submissions (Author)
router.get(
    '/my-submissions',
    authenticate,
    requireVerified,
    getMySubmissions
);

// Get admin submissions (Admin only)
router.get(
    '/admin/submissions',
    authenticate,
    requireVerified,
    requireAdmin,
    getAdminSubmissions
);

// Get submission stats (Author or Admin)
router.get(
    '/stats',
    authenticate,
    requireVerified,
    getSubmissionStats
);

// Get submission by ID (Author or Admin)
router.get(
    '/:id',
    authenticate,
    requireVerified,
    getSubmissionById
);

// Admin makes proposal decision (accept/reject initial proposal) (Admin only)
router.post(
    '/:id/proposal-decision',
    authenticate,
    requireVerified,
    requireAdmin,
    proposalDecision
);

// Admin requests revision (Admin only)
router.post(
    '/:id/request-revision',
    authenticate,
    requireVerified,
    requireAdmin,
    requestRevision
);

// Author submits revision (Author)
router.post(
    '/:id/submit-revision',
    authenticate,
    requireVerified,
    upload.fields([{ name: 'revisionFile', maxCount: 1 }]),
    submitRevision
);

// Admin makes final decision (accept/reject submission) (Admin only)
router.post(
    '/:id/final-decision',
    authenticate,
    requireVerified,
    requireAdmin,
    finalDecision
);

// Admin applies for ISBN (Admin only)
router.post(
    '/:id/apply-isbn',
    authenticate,
    requireVerified,
    requireAdmin,
    applyIsbn
);

// Admin records ISBN receipt (Admin only)
router.post(
    '/:id/receive-isbn',
    authenticate,
    requireVerified,
    requireAdmin,
    receiveIsbn
);

// Admin starts publication process (Admin only)
router.post(
    '/:id/start-publication',
    authenticate,
    requireVerified,
    requireAdmin,
    startPublication
);

// Publish text book (Admin only)
router.post(
    '/:id/publish',
    authenticate,
    requireVerified,
    requireAdmin,
    upload.single('coverImage'),
    publishTextBook
);

// Download file (Author or Admin)
router.get(
    '/:id/download/:fileId',
    authenticate,
    requireVerified,
    downloadFile
);

// Send discussion message (Author or Admin)
router.post(
    '/:id/discussion',
    authenticate,
    requireVerified,
    sendDiscussionMessage
);

// Get discussions (Author or Admin)
router.get(
    '/:id/discussions',
    authenticate,
    requireVerified,
    getDiscussions
);

// Send bulk upload report (Admin only)
router.post(
    '/bulk-report',
    authenticate,
    requireVerified,
    requireAdmin,
    sendBulkUploadReport
);

// Check ISBN availability (Author or Admin)
router.post(
    '/check-isbn',
    authenticate,
    requireVerified,
    checkIsbnAvailability
);

export default router;
