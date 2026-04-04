import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate, requireVerified } from '../../middleware/auth';
import { requireAdmin, hasRoleLevel } from '../../middleware/roleBasedAccessControl.middleware';
import User, { UserRole } from '../../models/user';
import * as controller from './bookChapterPublishingController';

const router = express.Router();

// Multer for in-memory cover image uploads (max 10MB)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed for cover upload'));
        }
    },
});

// Multer for memory-based PDF uploads
const pdfUpload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (_req, file, cb) => {
        if (file.mimetype === 'application/pdf') cb(null, true);
        else cb(new Error('Only PDF files are allowed'));
    },
});

// ============================================================
// Public routes (no auth required)
// ============================================================

/**
 * @swagger
 * tags:
 *   name: Book Chapter Publishing
 *   description: Public and Admin API for published book chapter management
 */

/**
 * @swagger
 * /api/book-chapter-publishing:
 *   get:
 *     summary: List all visible published chapters (paginated)
 *     tags: [Book Chapter Publishing]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of published chapters
 */
/** GET /api/book-chapter-publishing - List all visible published chapters (paginated) */
router.get('/', controller.getAllPublishedChapters);

/**
 * @swagger
 * /api/book-chapter-publishing/categories:
 *   get:
 *     summary: Get unique category list
 *     tags: [Book Chapter Publishing]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 */
/** GET /api/book-chapter-publishing/categories - Unique category list */
router.get('/categories', controller.getCategories);

/**
 * @swagger
 * /api/book-chapter-publishing/{id}:
 *   get:
 *     summary: Full detail of one published chapter
 *     tags: [Book Chapter Publishing]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Chapter details
 */
/** GET /api/book-chapter-publishing/:id - Full detail of one published chapter */
router.get('/:id', controller.getPublishedChapterById);

/** GET /api/book-chapter-publishing/authors - List all authors */
router.get('/authors', controller.getAllPublishedAuthors);

/** GET /api/book-chapter-publishing/authors/:id - Author detail with chapters */
router.get('/authors/:id', controller.getPublishedAuthorById);


/** GET /api/book-chapter-publishing/:id/cover - Serve cover image binary */
router.get('/:id/cover', controller.getChapterCover);

/** GET /api/book-chapter-publishing/:id/cover/thumbnail - Serve resized cover thumbnail */
router.get('/:id/cover/thumbnail', controller.getChapterCoverThumbnail);

/** GET /api/book-chapter-publishing/:id/toc/:chapterIndex/pdf - Serve chapter PDF binary */
router.get('/:id/toc/:chapterIndex/pdf', controller.getChapterPdf);

/** GET /api/book-chapter-publishing/:id/extra-pdf/:type - Serve extra frontmatter PDFs */
router.get('/:id/extra-pdf/:type', controller.getExtraPdf);

/** GET /api/book-chapter-publishing/download/:fileId - Fetch any published file by its UUID (with caching) */
router.get('/download/:fileId', controller.downloadPublishedFile);

/** POST /api/book-chapter-publishing/chapters/:chapterId/views - Increment view count */
router.post('/chapters/:chapterId/views', controller.incrementChapterViews);

// ============================================================
// Admin routes (Auth + Admin role required)
// ============================================================

/** POST /api/book-chapter-publishing/:id/upload-temp-pdf
 *  Upload a single PDF file to temporary disk storage.
 *  Returns a fileKey to reference in the publish payload.
 */
router.post(
    '/:id/upload-temp-pdf',
    authenticate,
    requireVerified,
    hasRoleLevel(UserRole.EDITOR),
    pdfUpload.single('pdf'),
    controller.uploadTempPdf,
);

/**
 * @swagger
 * /api/book-chapter-publishing/upload-temp-pdf:
 *   post:
 *     summary: Upload a single PDF file (wizard)
 *     tags: [Book Chapter Publishing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               pdf:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Returns fileKey to use in publish payload
 */
/** POST /api/book-chapter-publishing/upload-temp-pdf
 *  Upload a single PDF file for a direct publication (no submission ID).
 */
router.post(
    '/upload-temp-pdf',
    authenticate,
    requireVerified,
    hasRoleLevel(UserRole.EDITOR),
    pdfUpload.single('pdf'),
    controller.uploadTempPdf,
);

/**
 * @swagger
 * /api/book-chapter-publishing/{id}/publish:
 *   post:
 *     summary: Publish a submission (ID belongs to BookChapterSubmission)
 *     tags: [Book Chapter Publishing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isbn: { type: string }
 *               tableContents: { type: array, items: { type: object } }
 *     responses:
 *       200:
 *         description: Book chapter published successfully
 */
/** POST /api/book-chapter-publishing/:id/publish
 *  Publish a submission (id = bookChapterSubmission.id).
 *  Body contains all wizard data including coverImage (base64) and
 *  tableContents array with pdfKey (disk reference) per chapter.
 */
router.post(
    '/:id/publish',
    authenticate,
    requireVerified,
    hasRoleLevel(UserRole.EDITOR),
    controller.publishBookChapter,
);

/** POST /api/book-chapter-publishing/direct
 *  Directly publish a manual entry from the wizard. 
 *  Does not require an existing submission.
 */
router.post(
    '/direct',
    authenticate,
    requireVerified,
    hasRoleLevel(UserRole.EDITOR),
    controller.publishDirectBookChapter,
);

/** POST /api/book-chapter-publishing/check-isbn
 *  Check which of the provided ISBNs already exist in published_book_chapters.
 *  Returns the subset of ISBNs that are already taken.
 */
router.post(
    '/check-isbn',
    authenticate,
    requireVerified,
    hasRoleLevel(UserRole.EDITOR),
    controller.checkBookChapterIsbnAvailability,
);

/**
 * @swagger
 * /api/book-chapter-publishing/{id}:
 *   put:
 *     summary: Update details of a published chapter
 *     tags: [Book Chapter Publishing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Chapter updated successfully
 */
/** PUT /api/book-chapter-publishing/:id - Update details of a published chapter */
router.put(
    '/:id',
    authenticate,
    requireVerified,
    hasRoleLevel(UserRole.EDITOR),
    controller.updatePublishedChapter,
);

/** PUT /api/book-chapter-publishing/:id/cover - Replace cover image (multipart or base64 JSON) */
router.put(
    '/:id/cover',
    authenticate,
    requireVerified,
    hasRoleLevel(UserRole.EDITOR),
    upload.single('coverImage'),
    controller.updateChapterCover,
);

/** PUT /api/book-chapter-publishing/:id/visibility - Hide / show */
router.put(
    '/:id/visibility',
    authenticate,
    requireVerified,
    hasRoleLevel(UserRole.EDITOR),
    controller.updateVisibility,
);

/** PUT /api/book-chapter-publishing/:id/featured - Toggle featured flag */
router.put(
    '/:id/featured',
    authenticate,
    requireVerified,
    hasRoleLevel(UserRole.EDITOR),
    controller.updateFeatured,
);

/** DELETE /api/book-chapter-publishing/:id - Delete a published chapter record */
router.delete(
    '/:id',
    authenticate,
    requireVerified,
    hasRoleLevel(UserRole.EDITOR),
    controller.deletePublishedChapter,
);

export default router;
