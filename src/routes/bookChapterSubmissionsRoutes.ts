// routes/bookChapterSubmissionsRoutes.ts
import express from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth';
import { hasRole } from '../middleware/roleBasedAccessControl.middleware';
import { UserRole } from '../models/user';
import * as controller from '../controllers/bookChapterSubmission';

const router = express.Router();

// Configure multer for file upload (store in memory)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Allow only specific file types
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'));
    }
  },
});

/**
 * @swagger
 * tags:
 *   name: Book Chapters
 *   description: Book chapter submission and management endpoints
 */

// ========================================
// PUBLIC / AUTHOR ROUTES
// ========================================

/**
 * @swagger
 * /api/book-chapters/submit:
 *   post:
 *     summary: Submit initial book chapter proposal
 *     description: Submit a new book chapter proposal with optional manuscript file. User role will be updated to AUTHOR if not already.
 *     tags: [Book Chapters]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - mainAuthor
 *               - bookTitle
 *               - bookChapterTitles
 *               - abstract
 *               - keywords
 *             properties:
 *               mainAuthor:
 *                 type: string
 *                 description: JSON string of main author object
 *               coAuthors:
 *                 type: string
 *                 description: JSON string of co-authors array
 *               bookTitle:
 *                 type: string
 *               bookChapterTitles:
 *                 type: string
 *                 description: JSON string of chapter titles array
 *               abstract:
 *                 type: string
 *               keywords:
 *                 type: string
 *                 description: JSON string of keywords array
 *               manuscript:
 *                 type: string
 *                 format: binary
 *                 description: Optional manuscript file (PDF, DOC, DOCX)
 *     responses:
 *       201:
 *         description: Submission created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/submit', authenticate, hasRole(UserRole.USER, UserRole.AUTHOR), upload.single('manuscript'), controller.submitBookChapter);

/**
 * @swagger
 * /api/book-chapters/{id}:
 *   put:
 *     summary: Update submission details (Author only)
 *     description: Update details like title, abstract, etc. Allowed only before reviewers are assigned.
 *     tags: [Book Chapters]
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
 *               bookTitle: { type: string }
 *               abstract: { type: string }
 *               keywords: { type: array, items: { type: string } }
 *     responses:
 *       200:
 *         description: Submission updated successfully
 *       403:
 *         description: Forbidden - Cannot update in current status
 */
router.put('/:id', authenticate, controller.updateSubmission);

/**
 * @swagger
 * /api/book-chapters/my-submissions:
 *   get:
 *     summary: Get all submissions by current user
 *     tags: [Book Chapters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Submissions retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/my-submissions', authenticate, controller.getMySubmissions);

/**
 * @swagger
 * /api/book-chapters/{id}:
 *   get:
 *     summary: Get submission details by ID
 *     tags: [Book Chapters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Submission details retrieved
 *       403:
 *         description: Forbidden - No permission to view this submission
 *       404:
 *         description: Submission not found
 */
router.get('/:id', authenticate, controller.getSubmissionById);

/**
 * @swagger
 * /api/book-chapters/{id}/history:
 *   get:
 *     summary: Get submission status history
 *     tags: [Book Chapters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: History retrieved successfully
 *       403:
 *         description: Forbidden
 */
router.get('/:id/history', authenticate, controller.getSubmissionHistory);

/**
 * @swagger
 * /api/book-chapters/{id}/upload-full-chapter:
 *   post:
 *     summary: Author uploads full chapter after editor acceptance
 *     tags: [Book Chapters]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [fullChapter]
 *             properties:
 *               fullChapter:
 *                 type: string
 *                 format: binary
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Full chapter uploaded successfully
 *       400:
 *         description: Invalid status for upload
 */
router.post('/:id/upload-full-chapter', authenticate, upload.single('fullChapter'), controller.uploadFullChapter);

/**
 * @swagger
 * /api/book-chapters/chapters/{chapterId}/upload-manuscript:
 *   post:
 *     summary: Author uploads manuscript for a specific chapter
 *     tags: [Book Chapters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chapterId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [manuscript]
 *             properties:
 *               manuscript:
 *                 type: string
 *                 format: binary
 *               customFileName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Manuscript uploaded successfully
 */
router.post('/chapters/:chapterId/upload-manuscript', authenticate, upload.single('manuscript'), controller.uploadChapterManuscript);


/**
 * @swagger
 * /api/book-chapters/{id}/submit-revision:
 *   post:
 *     summary: Author submits revised chapter
 *     tags: [Book Chapters]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [revision]
 *             properties:
 *               revision:
 *                 type: string
 *                 format: binary
 *               responseNotes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Revision submitted successfully
 */
router.post('/:id/submit-revision', authenticate, upload.single('revision'), controller.submitRevision);

/**
 * @swagger
 * /api/book-chapters/{id}:
 *   delete:
 *     summary: Delete submission (Admin or Author if INITIAL_SUBMITTED)
 *     tags: [Book Chapters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Submission deleted successfully
 *       403:
 *         description: Forbidden - Cannot delete in current status
 */
router.delete('/:id', authenticate, controller.deleteSubmission);

// ========================================
// ADMIN ROUTES
// ========================================

/**
 * @swagger
 * /api/book-chapters/admin/submissions:
 *   get:
 *     summary: Get all submissions for admin dashboard
 *     tags: [Book Chapters - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: tab
 *         schema: { type: string, enum: [new, active, completed], default: new }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Submissions retrieved successfully
 */
router.get('/admin/submissions', authenticate, hasRole(UserRole.ADMIN), controller.getAdminSubmissions);

/**
 * @swagger
 * /api/book-chapters/{id}/assign-editor:
 *   post:
 *     summary: Admin assigns editor to submission
 *     tags: [Book Chapters - Admin]
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
 *             required: [editorId]
 *             properties:
 *               editorId: { type: integer }
 *               notes: { type: string }
 *     responses:
 *       200:
 *         description: Editor assigned successfully
 */
router.post('/:id/assign-editor', authenticate, hasRole(UserRole.ADMIN), controller.assignEditor);

/**
 * @swagger
 * /api/book-chapters/{id}/publish:
 *   post:
 *     summary: Publish approved chapter on website
 *     tags: [Book Chapters - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               publicationUrl: { type: string }
 *               publishedDate: { type: string }
 *               volume: { type: string }
 *               issue: { type: string }
 *               pageNumbers: { type: string }
 *     responses:
 *       200:
 *         description: Chapter published successfully
 */
router.post('/:id/publish', authenticate, hasRole(UserRole.ADMIN, UserRole.EDITOR), controller.publishChapter);

/**
 * @swagger
 * /api/book-chapters/stats:
 *   get:
 *     summary: Get overall statistics
 *     tags: [Book Chapters - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
router.get('/stats', authenticate, hasRole(UserRole.ADMIN), controller.getStatistics);

// ========================================
// EDITOR ROUTES
// ========================================

/**
 * @swagger
 * /api/book-chapters/editor/submissions:
 *   get:
 *     summary: Get all submissions assigned to current editor
 *     tags: [Book Chapters - Editor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *     responses:
 *       200:
 *         description: Editor submissions retrieved successfully
 */
router.get('/editor/submissions', authenticate, hasRole(UserRole.EDITOR), controller.getEditorSubmissions);

/**
 * @swagger
 * /api/book-chapters/{id}/editor-decision:
 *   post:
 *     summary: Editor accepts or rejects initial submission
 *     tags: [Book Chapters - Editor]
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
 *             required: [decision]
 *             properties:
 *               decision: { type: string, enum: [accept, reject] }
 *               notes: { type: string }
 *     responses:
 *       200:
 *         description: Decision processed successfully
 */
router.post('/:id/editor-decision', authenticate, hasRole(UserRole.EDITOR, UserRole.ADMIN), controller.editorDecision);

/**
 * @swagger
 * /api/book-chapters/{submissionId}/accept-abstract:
 *   post:
 *     summary: Editor accepts abstract and initiates manuscript collection
 *     tags: [Book Chapters - Editor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: submissionId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes: { type: string }
 *     responses:
 *       200:
 *         description: Abstract accepted successfully
 */
router.post('/:submissionId/accept-abstract', authenticate, hasRole(UserRole.EDITOR), controller.acceptAbstract);


/**
 * @swagger
 * /api/book-chapters/{id}/assign-reviewers:
 *   post:
 *     summary: Editor assigns 2 reviewers to submission
 *     tags: [Book Chapters - Editor]
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
 *             required: [reviewer1Id, reviewer2Id]
 *             properties:
 *               reviewer1Id: { type: integer }
 *               reviewer2Id: { type: integer }
 *               notes: { type: string }
 *     responses:
 *       200:
 *         description: Reviewers assigned successfully
 */
router.post('/:id/assign-reviewers', authenticate, hasRole(UserRole.EDITOR), controller.assignReviewers);

/**
 * @swagger
 * /api/book-chapters/{id}/final-decision:
 *   post:
 *     summary: Editor makes final decision (approve/reject)
 *     tags: [Book Chapters - Editor]
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
 *             required: [decision]
 *             properties:
 *               decision: { type: string, enum: [approve, reject] }
 *               notes: { type: string }
 *               publicationDetails: { type: object }
 *     responses:
 *       200:
 *         description: Final decision processed successfully
 */
router.post('/:id/final-decision', authenticate, hasRole(UserRole.EDITOR, UserRole.ADMIN), controller.finalDecision);

/**
 * @swagger
 * /api/book-chapters/{id}/reviewers:
 *   get:
 *     summary: Get all reviewers for a submission
 *     tags: [Book Chapters - Editor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Reviewers retrieved
 */
router.get('/:id/reviewers', authenticate, hasRole(UserRole.EDITOR, UserRole.ADMIN), controller.getSubmissionReviewers);

/**
 * @swagger
 * /api/book-chapters/assignments/{assignmentId}/reassign:
 *   post:
 *     summary: Reassign a reviewer
 *     tags: [Book Chapters - Editor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [newReviewerId]
 *             properties:
 *               newReviewerId: { type: integer }
 *               notes: { type: string }
 *     responses:
 *       200:
 *         description: Reviewer reassigned
 */
router.post('/assignments/:assignmentId/reassign', authenticate, hasRole(UserRole.EDITOR), controller.reassignReviewer);

/**
 * @swagger
 * /api/book-chapters/{id}/apply-isbn:
 *   post:
 *     summary: Apply for ISBN after submission is approved
 *     tags: [Book Chapters - Editor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes: { type: string }
 *     responses:
 *       200:
 *         description: ISBN application submitted
 */
router.post('/:id/apply-isbn', authenticate, hasRole(UserRole.EDITOR, UserRole.ADMIN), controller.applyIsbn);

/**
 * @swagger
 * /api/book-chapters/{id}/receive-isbn:
 *   post:
 *     summary: Record received ISBN and DOI
 *     tags: [Book Chapters - Editor]
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
 *             required: [isbn]
 *             properties:
 *               isbn: { type: string }
 *               doi: { type: string }
 *               notes: { type: string }
 *     responses:
 *       200:
 *         description: ISBN recorded, publication in progress
 */
router.post('/:id/receive-isbn', authenticate, hasRole(UserRole.EDITOR, UserRole.ADMIN), controller.receiveIsbn);

/**
 * @swagger
 * /api/book-chapters/chapters/{chapterId}/editorial-decision:
 *   post:
 *     summary: Editor makes per-chapter approve/reject decision
 *     tags: [Book Chapters - Editor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chapterId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [decision]
 *             properties:
 *               decision: { type: string, enum: [approve, reject] }
 *               notes: { type: string }
 *     responses:
 *       200:
 *         description: Editorial decision processed
 */
router.post('/chapters/:chapterId/editorial-decision', authenticate, hasRole(UserRole.EDITOR, UserRole.ADMIN), controller.chapterEditorialDecision);

// ========================================
// REVIEWER ROUTES
// ========================================

/**
 * @swagger
 * /api/book-chapters/reviewer/assignments:
 *   get:
 *     summary: Get all assignments for current reviewer
 *     tags: [Book Chapters - Reviewer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Assignments retrieved successfully
 */
router.get('/reviewer/assignments', authenticate, hasRole(UserRole.REVIEWER), controller.getReviewerAssignments);

/**
 * @swagger
 * /api/book-chapters/assignments/{assignmentId}/respond:
 *   post:
 *     summary: Reviewer accepts or declines assignment
 *     tags: [Book Chapters - Reviewer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [response]
 *             properties:
 *               response: { type: string, enum: [accept, decline] }
 *               notes: { type: string }
 *     responses:
 *       200:
 *         description: Response processed successfully
 */
router.post('/assignments/:assignmentId/respond', authenticate, hasRole(UserRole.REVIEWER), controller.reviewerRespond);

/**
 * @swagger
 * /api/book-chapters/{id}/request-revision:
 *   post:
 *     summary: Reviewer requests revision from author
 *     tags: [Book Chapters - Reviewer]
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
 *             required: [comments]
 *             properties:
 *               comments: { type: string }
 *     responses:
 *       200:
 *         description: Revision requested successfully
 */
router.post('/:id/request-revision', authenticate, hasRole(UserRole.REVIEWER), controller.requestRevision);

/**
 * @swagger
 * /api/book-chapters/assignments/{assignmentId}/complete:
 *   post:
 *     summary: Reviewer completes review with final recommendation
 *     tags: [Book Chapters - Reviewer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [recommendation, reviewerComments]
 *             properties:
 *               recommendation: { type: string, enum: [APPROVE, REJECT, REVISION_NEEDED] }
 *               reviewerComments: { type: string }
 *               confidentialNotes: { type: string }
 *     responses:
 *       200:
 *         description: Review completed successfully
 */
router.post('/assignments/:assignmentId/complete', authenticate, hasRole(UserRole.REVIEWER), controller.completeReview);


/**
 * @swagger
 * /api/book-chapters/files/{id}:
 *   get:
 *     summary: Download a book chapter file
 *     tags: [Book Chapters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: File download
 *       403:
 *         description: Forbidden
 *       404:
 *         description: File not found
 */
router.get('/files/:id', authenticate, controller.downloadFile);

/**
 * @swagger
 * /api/book-chapters/assignments/{assignmentId}/start:
 *   post:
 *     summary: Reviewer starts review status
 *     tags: [Book Chapters - Reviewer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Review started successfully
 */
router.post('/assignments/:assignmentId/start', authenticate, hasRole(UserRole.REVIEWER), controller.startReview);

/**
 * @swagger
 * /api/book-chapters/{id}/discussions:
 *   get:
 *     summary: Get all discussions for a submission
 *     tags: [Book Chapters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Discussions retrieved successfully
 */
router.get('/:id/discussions', authenticate, controller.getSubmissionDiscussions);

/**
 * @swagger
 * /api/book-chapters/{id}/discussions:
 *   post:
 *     summary: Post a new discussion message
 *     tags: [Book Chapters]
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
 *             required: [message]
 *             properties:
 *               message: { type: string }
 *               isInternal: { type: boolean }
 *     responses:
 *       201:
 *         description: Message posted successfully
 */
router.post('/:id/discussions', authenticate, controller.postSubmissionDiscussion);

export default router;
