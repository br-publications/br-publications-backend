import express from 'express';
import * as contactController from '../controllers/contactController';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/roleBasedAccessControl.middleware';

const router = express.Router();

// Public route to get contact details
router.get('/', contactController.getContactDetails);

// Protected route to update contact details (Admin only)
router.put('/', authenticate, requireAdmin, contactController.updateContactDetails);

export default router;
