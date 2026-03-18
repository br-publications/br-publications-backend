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

// Multer for disk-based PDF uploads (no size limit — handled by Express limit)
const TEMP_DIR = path.resolve('uploads/temp');
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

const pdfUpload = multer({
    storage: multer.diskStorage({
        destination: (_req, _file, cb) => cb(null, TEMP_DIR),
        filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
    }),
    fileFilter: (_req, file, cb) => {
        if (file.mimetype === 'application/pdf') cb(null, true);
        else cb(new Error('Only PDF files are allowed'));
    },
});

// ============================================================
// Public routes (no auth required)
// ============================================================

/** GET /api/book-chapter-publishing - List all visible published chapters (paginated) */
router.get('/', controller.getAllPublishedChapters);

/** GET /api/book-chapter-publishing/categories - Unique category list */
router.get('/categories', controller.getCategories);

/** GET /api/book-chapter-publishing/:id - Full detail of one published chapter */
router.get('/:id', controller.getPublishedChapterById);

/** GET /api/book-chapter-publishing/:id/cover - Serve cover image binary */
router.get('/:id/cover', controller.getChapterCover);

/** GET /api/book-chapter-publishing/:id/cover/thumbnail - Serve resized cover thumbnail */
router.get('/:id/cover/thumbnail', controller.getChapterCoverThumbnail);

/** GET /api/book-chapter-publishing/:id/toc/:chapterIndex/pdf - Serve chapter PDF binary */
router.get('/:id/toc/:chapterIndex/pdf', controller.getChapterPdf);

/** GET /api/book-chapter-publishing/:id/extra-pdf/:type - Serve extra frontmatter PDFs */
router.get('/:id/extra-pdf/:type', controller.getExtraPdf);

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
