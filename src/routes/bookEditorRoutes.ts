import express from 'express';
import {
    assignEditor,
    bulkAssignEditors,
    getEditorsByBookTitle,
    getBooksByEditor,
    removeEditorAssignment,
    setPrimaryEditor,
} from '../controllers/bookEditorController';
import { authenticate, requireVerified } from '../middleware/auth';
import { requireAdmin } from '../middleware/roleBasedAccessControl.middleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Book Editors
 *   description: Book editor assignment management endpoints
 */

// Assign editor to book (Admin only)
router.post(
    '/',
    authenticate,
    requireVerified,
    requireAdmin,
    assignEditor
);

// Bulk assign editors (Admin only)
router.post(
    '/bulk',
    authenticate,
    requireVerified,
    requireAdmin,
    bulkAssignEditors
);

// Get editors by book title ID (Authenticated users)
router.get(
    '/book/:bookTitleId',
    authenticate,
    requireVerified,
    getEditorsByBookTitle
);

// Get books by editor ID (Authenticated users)
router.get(
    '/editor/:editorId',
    authenticate,
    requireVerified,
    getBooksByEditor
);

// Remove editor assignment (Admin only)
router.delete(
    '/:id',
    authenticate,
    requireVerified,
    requireAdmin,
    removeEditorAssignment
);

// Set primary editor (Admin only)
router.patch(
    '/:bookTitleId/set-primary/:editorId',
    authenticate,
    requireVerified,
    requireAdmin,
    setPrimaryEditor
);

export default router;
