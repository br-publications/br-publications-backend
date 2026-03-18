import express from 'express';
import * as validationMiddleware from '../middleware/validation';
import * as authMiddleware from '../middleware/auth';
import { hasRole } from '../middleware/roleBasedAccessControl.middleware';
import { UserRole } from '../models/user';
import * as projectInternshipController from '../controllers/projectInternshipController';

const router = express.Router();

// Submit application (User)
router.post(
    '/submit',
    authMiddleware.authenticate,
    hasRole(UserRole.USER, UserRole.STUDENT, UserRole.AUTHOR),
    projectInternshipController.submitApplication
);

// Get my submissions (User)
router.get(
    '/my-submissions',
    authMiddleware.authenticate,
    projectInternshipController.getMySubmissions
);

// Get all submissions (Admin)
router.get(
    '/admin/all',
    authMiddleware.authenticate,
    authMiddleware.authorize(['admin', 'developer', 'editor']),
    projectInternshipController.getAllSubmissions
);

// Get submission by ID (User/Admin)
router.get(
    '/:id',
    authMiddleware.authenticate,
    projectInternshipController.getSubmissionById
);

// Update status (Admin)
router.put(
    '/status/:id',
    authMiddleware.authenticate,
    authMiddleware.authorize(['admin', 'developer']),
    projectInternshipController.updateSubmissionStatus
);

export default router;
