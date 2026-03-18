import express from 'express';
import {
    submitRecruitment,
    getMySubmissions,
    getAllSubmissions,
    getSubmissionById,
    updateSubmissionStatus
} from '../controllers/recruitmentSubmissionController';
import { authenticate, requireVerified } from '../middleware/auth';
import { hasRole } from '../middleware/roleBasedAccessControl.middleware';
import { UserRole } from '../models/user';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/recruitment';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req: any, file, cb) => {
        const userId = req.authenticatedUser?.id || 'anonymous';
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `recruitment-${userId}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max
    }
});

/**
 * @swagger
 * tags:
 *   name: Recruitment
 *   description: Recruitment application management
 */

// User routes
router.post('/', authenticate, requireVerified, hasRole(UserRole.USER, UserRole.AUTHOR, UserRole.STUDENT, UserRole.ADMIN, UserRole.DEVELOPER), upload.single('personalImage'), submitRecruitment);
router.get('/my', authenticate, getMySubmissions);
router.get('/id/:id', authenticate, getSubmissionById);

// Admin/Editor routes
router.get('/admin/all', authenticate, requireVerified, hasRole(UserRole.ADMIN, UserRole.DEVELOPER, UserRole.EDITOR), getAllSubmissions);
router.get('/admin/id/:id', authenticate, requireVerified, hasRole(UserRole.ADMIN, UserRole.DEVELOPER, UserRole.EDITOR), getSubmissionById);
router.put('/status/:id', authenticate, requireVerified, hasRole(UserRole.ADMIN, UserRole.DEVELOPER, UserRole.EDITOR), updateSubmissionStatus);

export default router;
