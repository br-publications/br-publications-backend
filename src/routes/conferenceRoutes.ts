import express from 'express';
import * as controller from '../controllers/conferenceController';
import { authenticate, requireVerified } from '../middleware/auth';
import { requireAdmin } from '../middleware/roleBasedAccessControl.middleware';

const router = express.Router();

// ── Public endpoints ─────────────────────────────────────────

/** GET /api/conferences — paginated, searchable list */
router.get('/', controller.getConferences);

/** GET /api/conferences/:id — single conference details */
router.get('/:id', controller.getConferenceById);

/** GET /api/conferences/:id/articles — articles for a conference */
router.get('/:id/articles', controller.getArticlesByConference);

/** GET /api/conferences/:id/articles/:articleId — single article detail */
router.get('/:id/articles/:articleId', controller.getArticleById);

// ── Admin endpoints ──────────────────────────────────────────

/** POST /api/conferences — create a new conference */
router.post(
    '/',
    authenticate,
    requireVerified,
    requireAdmin,
    controller.createConference
);

/** PUT /api/conferences/:id — update conference */
router.put(
    '/:id',
    authenticate,
    requireVerified,
    requireAdmin,
    controller.updateConference
);

/** DELETE /api/conferences/:id — soft-delete conference */
router.delete(
    '/:id',
    authenticate,
    requireVerified,
    requireAdmin,
    controller.deleteConference
);

/** POST /api/conferences/:id/articles — add article to conference */
router.post(
    '/:id/articles',
    authenticate,
    requireVerified,
    requireAdmin,
    controller.createArticle
);

/** PUT /api/conferences/:id/articles/:articleId — update article */
router.put(
    '/:id/articles/:articleId',
    authenticate,
    requireVerified,
    requireAdmin,
    controller.updateArticle
);

/** DELETE /api/conferences/:id/articles/:articleId — soft-delete article */
router.delete(
    '/:id/articles/:articleId',
    authenticate,
    requireVerified,
    requireAdmin,
    controller.deleteArticle
);

export default router;
