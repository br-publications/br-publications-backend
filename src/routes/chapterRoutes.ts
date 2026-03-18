import express from 'express';
import * as chapterController from '../controllers/chapterController';
import * as chapterAdminController from '../controllers/chapterAdminController';
import * as chapterDiscussionController from '../controllers/chapterDiscussionController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/user';

const router = express.Router();

// ============= ADMIN ROUTES =============

/**
 * @swagger
 * /api/chapters/admin/fix-titles:
 *   post:
 *     summary: Fix chapter titles that have numeric IDs (Admin only)
 *     tags: [Chapters]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Chapters fixed successfully
 */
router.post('/admin/fix-titles', authenticate, authorize([UserRole.ADMIN]), chapterAdminController.fixChapterTitles);

/**
 * @swagger
 * tags:
 *   name: Chapters
 *   description: Chapter management endpoints
 */

/**
 * @swagger
 * /api/chapters/submission/{submissionId}:
 *   get:
 *     summary: Get all chapters for a submission
 *     tags: [Chapters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: submissionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Chapters retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/submission/:submissionId', authenticate, chapterController.getSubmissionChapters);

/**
 * @swagger
 * /api/chapters/submission/{submissionId}/progress:
 *   get:
 *     summary: Get chapter progress for a submission
 *     tags: [Chapters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: submissionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Progress retrieved successfully
 */
router.get('/submission/:submissionId/progress', authenticate, chapterController.getChapterProgress);

/**
 * @swagger
 * /api/chapters/submission/{submissionId}/publishing-eligibility:
 *   get:
 *     summary: Check if submission is eligible for publishing
 *     tags: [Chapters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: submissionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Eligibility checked successfully
 */
router.get('/submission/:submissionId/publishing-eligibility', authenticate, chapterController.checkPublishingEligibility);

/**
 * @swagger
 * /api/chapters/reviewer/assignments:
 *   get:
 *     summary: Get all assignments for current reviewer (Chapter Level)
 *     tags: [Chapters]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Assignments retrieved successfully
 */
router.get('/reviewer/assignments', authenticate, chapterController.getReviewerAssignments);

/**
 * @swagger
 * /api/chapters/{id}:
 *   get:
 *     summary: Get a single chapter by ID
 *     tags: [Chapters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Chapter retrieved successfully
 *       404:
 *         description: Chapter not found
 */
router.get('/:id', authenticate, chapterController.getChapter);

/**
 * @swagger
 * /api/chapters/{id}/upload-manuscript:
 *   post:
 *     summary: Upload manuscript for a chapter
 *     tags: [Chapters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fileId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Manuscript uploaded successfully
 */
router.post('/:id/upload-manuscript', authenticate, chapterController.uploadManuscript);

/**
 * @swagger
 * /api/chapters/{id}/accept-abstract:
 *   post:
 *     summary: Accept chapter abstract (Editor/Admin only)
 *     tags: [Chapters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Abstract accepted successfully
 */
router.post('/:id/accept-abstract', authenticate, authorize([UserRole.ADMIN, UserRole.EDITOR]), chapterController.acceptAbstract);

/**
 * @swagger
 * /api/chapters/{id}/reject-abstract:
 *   post:
 *     summary: Reject chapter abstract (Editor/Admin only)
 *     tags: [Chapters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Abstract rejected
 */
router.post('/:id/reject-abstract', authenticate, authorize([UserRole.ADMIN, UserRole.EDITOR]), chapterController.rejectAbstract);

/**
 * @swagger
 * /api/chapters/{id}/assign-reviewers:
 *   post:
 *     summary: Assign reviewers to a chapter (Editor only)
 *     tags: [Chapters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reviewerIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *               deadline:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Reviewers assigned successfully
 */
router.post('/:id/assign-reviewers', authenticate, authorize([UserRole.EDITOR, UserRole.ADMIN]), chapterController.assignReviewers);

/**
 * @swagger
 * /api/chapters/assignment/{id}/response:
 *   post:
 *     summary: Reviewer accepts or rejects assignment
 *     tags: [Chapters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Assignment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [accept, reject]
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Response recorded successfully
 */
router.post('/assignment/:id/response', authenticate, authorize([UserRole.REVIEWER]), chapterController.reviewerResponse);

/**
 * @swagger
 * /api/chapters/assignment/{id}/save-draft:
 *   post:
 *     summary: Save review draft for a chapter (Reviewer only)
 *     tags: [Chapters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Assignment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recommendation:
 *                 type: string
 *               comments:
 *                 type: string
 *               confidentialComments:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review draft saved successfully
 */
router.post('/assignment/:id/save-draft', authenticate, authorize([UserRole.REVIEWER]), chapterController.saveReviewDraft);

/**
 * @swagger
 * /api/chapters/assignment/{id}/submit-review:
 *   post:
 *     summary: Submit review for a chapter (Reviewer only)
 *     tags: [Chapters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Assignment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recommendation:
 *                 type: string
 *                 enum: [ACCEPT, REJECT, MAJOR_REVISION, MINOR_REVISION]
 *               comments:
 *                 type: string
 *               confidentialComments:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review submitted successfully
 */
router.post('/assignment/:id/submit-review', authenticate, authorize([UserRole.REVIEWER]), chapterController.submitReview);

/**
 * @swagger
 * /api/chapters/{id}/request-revision:
 *   post:
 *     summary: Request revision for a chapter
 *     tags: [Chapters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reviewerComments:
 *                 type: string
 *     responses:
 *       200:
 *         description: Revision requested successfully
 */
router.post('/:id/request-revision', authenticate, authorize([UserRole.REVIEWER, UserRole.EDITOR, UserRole.ADMIN]), chapterController.requestRevision);

/**
 * @swagger
 * /api/chapters/revision/{id}/submit:
 *   post:
 *     summary: Submit revision for a chapter (Author)
 *     tags: [Chapters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Revision ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fileId:
 *                 type: integer
 *               authorResponse:
 *                 type: string
 *     responses:
 *       200:
 *         description: Revision submitted successfully
 */
router.post('/revision/:id/submit', authenticate, chapterController.submitRevision);

/**
 * @swagger
 * /api/chapters/{id}/editor-decision:
 *   post:
 *     summary: Make editor decision on a chapter (Editor only)
 *     tags: [Chapters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               decision:
 *                 type: string
 *                 enum: [APPROVED, REJECTED]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Decision made successfully
 */
router.post('/:id/editor-decision', authenticate, authorize([UserRole.EDITOR, UserRole.ADMIN]), chapterController.editorDecision);

/**
 * @swagger
 * /api/chapters/{id}/status-history:
 *   get:
 *     summary: Get status history for a chapter
 *     tags: [Chapters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Status history retrieved successfully
 */
router.get('/:id/status-history', authenticate, chapterController.getStatusHistory);

// ============= CHAPTER DISCUSSION ROUTES =============

/**
 * @swagger
 * /api/chapters/{chapterId}/discussions:
 *   get:
 *     summary: Get all discussions for a chapter
 *     tags: [Chapters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chapterId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Discussions retrieved successfully
 */
router.get('/:chapterId/discussions', authenticate, chapterDiscussionController.getChapterDiscussions);

/**
 * @swagger
 * /api/chapters/{chapterId}/discussions:
 *   post:
 *     summary: Create a new discussion message for a chapter
 *     tags: [Chapters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chapterId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *               isInternal:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Discussion posted successfully
 */
router.post('/:chapterId/discussions', authenticate, chapterDiscussionController.createChapterDiscussion);

/**
 * @swagger
 * /api/chapters/{chapterId}/discussions/{discussionId}:
 *   delete:
 *     summary: Delete a discussion message
 *     tags: [Chapters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chapterId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: discussionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Discussion deleted successfully
 */
router.delete('/:chapterId/discussions/:discussionId', authenticate, chapterDiscussionController.deleteChapterDiscussion);

export default router;
