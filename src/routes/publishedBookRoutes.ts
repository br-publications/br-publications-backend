import express from 'express';
import * as controller from '../controllers/publishedBookController';
import { authenticate, requireVerified } from '../middleware/auth';
import { requireAdmin } from '../middleware/roleBasedAccessControl.middleware';
import multer from 'multer';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Published Books
 *   description: Public API for published books
 */

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Get all published books with pagination and search
 *     tags: [Published Books]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search term for title, author, or description
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *         description: Filter by category
 *     responses:
 *       200:
 *         description: Books retrieved successfully
 */
router.get('/', controller.getAllBooks);

/**
 * @swagger
 * /api/books/categories:
 *   get:
 *     summary: Get unique categories
 *     tags: [Published Books]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 */
router.get('/categories', controller.getCategories);

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Get book details by ID
 *     tags: [Published Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book details retrieved
 *       404:
 *         description: Book not found
 */
router.get('/:id', controller.getBookById);

/**
 * @swagger
 * /api/books/{id}/cover:
 *   get:
 *     summary: Get book cover image
 *     tags: [Published Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Cover image
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Cover image not found
 */
router.get('/:id/cover', controller.getBookCover);

/**
 * @swagger
 * /api/books/{id}/cover/thumbnail:
 *   get:
 *     summary: Get book cover thumbnail
 *     tags: [Published Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Book ID
 *       - in: query
 *         name: width
 *         schema: { type: integer, default: 200 }
 *         description: Thumbnail width
 *       - in: query
 *         name: height
 *         schema: { type: integer, default: 300 }
 *         description: Thumbnail height
 *     responses:
 *       200:
 *         description: Cover thumbnail
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Cover image not found
 */
router.get('/:id/cover/thumbnail', controller.getBookCoverThumbnail);

// Update book details (Admin only)
router.put(
    '/:id',
    authenticate,
    requireVerified,
    requireAdmin,
    controller.updateBookDetails
);

// Update book cover (Admin only)
router.put(
    '/:id/cover',
    authenticate,
    requireVerified,
    requireAdmin,
    upload.single('coverImage'),
    controller.updateBookCover
);

// Toggle visibility (Admin only)
router.put(
    '/:id/visibility',
    authenticate,
    requireVerified,
    requireAdmin,
    controller.updateVisibility
);

// Toggle featured status (Admin only)
router.put(
    '/:id/featured',
    authenticate,
    requireVerified,
    requireAdmin,
    controller.updateFeatured
);

// Delete book (Admin only)
router.delete(
    '/:id',
    authenticate,
    requireVerified,
    requireAdmin,
    controller.deleteBook
);

export default router;
