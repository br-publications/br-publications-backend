import express from 'express';
import {
    createBookTitle,
    getAllBookTitles,
    getBookTitleById,
    updateBookTitle,
    deleteBookTitle,
    getBookTitleWithChapters,
    getBookTitleByExactTitle,
} from '../controllers/bookTitleController';
import { authenticate, requireVerified } from '../middleware/auth';
import { hasPermission, requireAdmin } from '../middleware/roleBasedAccessControl.middleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Book Titles
 *   description: Book title management endpoints
 */

// Create book title (Admin only)
router.post(
    '/',
    authenticate,
    requireVerified,
    requireAdmin,
    createBookTitle
);

// Get all book titles (Authenticated users)
router.get(
    '/',
    authenticate,
    requireVerified,
    getAllBookTitles
);

// Get book title by exact title string (Authenticated users)
router.get(
    '/by-title',
    authenticate,
    requireVerified,
    getBookTitleByExactTitle
);

// Get book title by ID (Authenticated users)
router.get(
    '/:id',
    authenticate,
    requireVerified,
    getBookTitleById
);

// Get book title with chapters (Authenticated users)
router.get(
    '/:id/with-chapters',
    authenticate,
    requireVerified,
    getBookTitleWithChapters
);

// Update book title (Admin only)
router.put(
    '/:id',
    authenticate,
    requireVerified,
    requireAdmin,
    updateBookTitle
);

// Delete book title (Admin only)
router.delete(
    '/:id',
    authenticate,
    requireVerified,
    requireAdmin,
    deleteBookTitle
);

export default router;
