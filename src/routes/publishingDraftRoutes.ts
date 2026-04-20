import express from 'express';
import { authenticate, requireVerified } from '../middleware/auth';
import * as controller from '../controllers/publishingDraftController';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Publishing Drafts
 *   description: Management of persistent drafts for the publishing wizard
 */

// List all drafts for the logged-in user
router.get('/', authenticate, requireVerified, controller.listDrafts);

// Get specific draft by Submission ID
router.get('/submission/:submissionId', authenticate, requireVerified, controller.getDraft);

// Get specific draft by ID
router.get('/:id', authenticate, requireVerified, controller.getDraft);

// Upsert a draft (Create or Update)
router.post('/', authenticate, requireVerified, controller.upsertDraft);

// Delete specific draft by Submission ID
router.delete('/submission/:submissionId', authenticate, requireVerified, controller.deleteDraft);

// Delete specific draft by ID
router.delete('/:id', authenticate, requireVerified, controller.deleteDraft);

export default router;
