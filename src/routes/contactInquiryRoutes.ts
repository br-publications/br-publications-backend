import express from 'express';
import * as authMiddleware from '../middleware/auth';
import * as contactInquiryController from '../controllers/contactInquiryController';
import { contactFormLimiter } from '../middleware/rateLimiter';

const router = express.Router();

// Submit contact inquiry — PUBLIC (no auth required, rate-limited)
router.post(
    '/submit',
    contactFormLimiter,
    contactInquiryController.submitContactInquiry
);

// Get all inquiries — Admin only
router.get(
    '/admin/all',
    authMiddleware.authenticate,
    authMiddleware.authorize(['admin', 'developer']),
    contactInquiryController.getAllInquiries
);

// Get single inquiry by ID — Admin only
router.get(
    '/:id',
    authMiddleware.authenticate,
    authMiddleware.authorize(['admin', 'developer']),
    contactInquiryController.getInquiryById
);

// Acknowledge inquiry — Admin only
router.put(
    '/acknowledge/:id',
    authMiddleware.authenticate,
    authMiddleware.authorize(['admin', 'developer']),
    contactInquiryController.acknowledgeInquiry
);

export default router;
