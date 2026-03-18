import express from 'express';
import {
    createBookChapter,
    getChaptersByBookTitle,
    getAllChapters,
    getChapterById,
    updateBookChapter,
    deleteBookChapter,
    reorderChapters,
} from '../controllers/bookChapterController';
import { authenticate, requireVerified } from '../middleware/auth';
import { requireAdmin } from '../middleware/roleBasedAccessControl.middleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Book Chapters
 *   description: Book chapter management endpoints
 */

// Create book chapter (Admin only)
router.post(
    '/',
    authenticate,
    requireVerified,
    requireAdmin,
    createBookChapter
);

// Get all chapters (Authenticated users)
router.get(
    '/',
    authenticate,
    requireVerified,
    getAllChapters
);

// Get chapter by ID (Authenticated users)
router.get(
    '/:id',
    authenticate,
    requireVerified,
    getChapterById
);

// Update chapter (Admin only)
router.put(
    '/:id',
    authenticate,
    requireVerified,
    requireAdmin,
    updateBookChapter
);

// Delete chapter (Admin only)
router.delete(
    '/:id',
    authenticate,
    requireVerified,
    requireAdmin,
    deleteBookChapter
);

// Get chapters by book title ID (Authenticated users)
router.get(
    '/book/:bookTitleId',
    authenticate,
    requireVerified,
    getChaptersByBookTitle
);

// Reorder chapters (Admin only)
router.put(
    '/book/:bookTitleId/reorder',
    authenticate,
    requireVerified,
    requireAdmin,
    reorderChapters
);

export default router;
