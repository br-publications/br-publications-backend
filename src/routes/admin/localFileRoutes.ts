import express from 'express';
import multer from 'multer';
import * as controller from '../../controllers/admin/localFileController';
import { authenticate } from '../../middleware/auth';
import { hasRole } from '../../middleware/roleBasedAccessControl.middleware';
import { UserRole } from '../../models/user';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// All routes require authentication and Admin/Developer (Super Admin) role
router.use(authenticate, hasRole(UserRole.ADMIN, UserRole.DEVELOPER));

/**
 * @swagger
 * tags:
 *   name: AdminLocalFiles
 *   description: Administrative local file management for disk-based storage
 */

/**
 * @swagger
 * /api/admin/local-files:
 *   post:
 *     summary: Upload a file to disk storage
 *     tags: [AdminLocalFiles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               submissionId:
 *                 type: integer
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *               extraMetadata:
 *                 type: string
 *                 description: JSON string of additional metadata
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', upload.single('file'), controller.uploadLocalFile);

/**
 * @swagger
 * /api/admin/local-files:
 *   get:
 *     summary: List all local files
 *     tags: [AdminLocalFiles]
 *     parameters:
 *       - in: query
 *         name: submissionId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of local files
 */
router.get('/', controller.listAllLocalFiles);

/**
 * @swagger
 * /api/admin/local-files/{id}:
 *   get:
 *     summary: Get metadata for a specific local file
 *     tags: [AdminLocalFiles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File metadata
 *       404:
 *         description: File not found
 */
router.get('/:id', controller.getLocalFile);

/**
 * @swagger
 * /api/admin/local-files/{id}:
 *   put:
 *     summary: Update a local file (replace content or update metadata)
 *     tags: [AdminLocalFiles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *               extraMetadata:
 *                 type: string
 *                 description: JSON string
 *     responses:
 *       200:
 *         description: File updated successfully
 *       404:
 *         description: File not found
 */
router.put('/:id', upload.single('file'), controller.updateLocalFile);

/**
 * @swagger
 * /api/admin/local-files/{id}:
 *   delete:
 *     summary: Delete a local file by ID
 *     tags: [AdminLocalFiles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File deleted from disk and database
 *       404:
 *         description: File not found
 */
router.delete('/:id', controller.deleteLocalFile);

/**
 * @swagger
 * /api/admin/local-files/details/{submissionId}/{fileName}:
 *   delete:
 *     summary: Delete a local file by submission details and original filename
 *     tags: [AdminLocalFiles]
 *     parameters:
 *       - in: path
 *         name: submissionId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: fileName
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File correctly identified and removed from disk
 *       404:
 *         description: File not found
 */
router.delete('/details/:submissionId/:fileName', controller.deleteLocalFileByDetails);

/**
 * @swagger
 * /api/admin/local-files/physical:
 *   get:
 *     summary: List all physical files in the uploads folder (recursive)
 *     tags: [AdminLocalFiles]
 *     parameters:
 *       - in: query
 *         name: folder
 *         schema:
 *           type: string
 *         description: Optional sub-folder to scan (e.g. published_cache)
 *     responses:
 *       200:
 *         description: Disk file list retrieved
 */
router.get('/physical', controller.getPhysicalUploads);

/**
 * @swagger
 * /api/admin/local-files/physical:
 *   delete:
 *     summary: Physically delete a file from server storage by its path
 *     tags: [AdminLocalFiles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               filePath:
 *                 type: string
 *                 description: Relative path from the 'uploads' folder
 *     responses:
 *       200:
 *         description: File removed from disk
 */
router.delete('/physical', controller.deletePhysicalUpload);

export default router;
