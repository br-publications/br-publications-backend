import express from 'express';
import { authenticate, requireVerified } from '../../middleware/auth';
import { hasRole } from '../../middleware/roleBasedAccessControl.middleware';
import { UserRole } from '../../models/user';
import * as customRoleController from '../controllers/customRoleController';

const router = express.Router();

/**
 * All routes require authentication, email verification, and Admin/Developer role
 */
const adminOnly = [authenticate, requireVerified, hasRole(UserRole.ADMIN, UserRole.DEVELOPER)];

// Custom Role Management Routes
router.get('/custom-roles', adminOnly, customRoleController.getAllCustomRoles);
router.get('/system-roles', adminOnly, customRoleController.getAllSystemRoles);
router.get('/custom-roles/:id', adminOnly, customRoleController.getCustomRoleById);
router.post('/custom-roles', adminOnly, customRoleController.createCustomRole);
router.put('/custom-roles/:id', adminOnly, customRoleController.updateCustomRole);
router.delete('/custom-roles/:id', adminOnly, customRoleController.deleteCustomRole);

// Permission Routes
router.get('/permissions/categories', adminOnly, customRoleController.getPermissionsByCategory);

// User Role Assignment Routes
router.post('/users/:userId/custom-roles', adminOnly, customRoleController.assignRoleToUser);
router.delete(
    '/users/:userId/custom-roles/:roleId',
    adminOnly,
    customRoleController.removeRoleFromUser
);
router.get('/users/:userId/custom-roles', adminOnly, customRoleController.getUserCustomRoles);

export default router;
