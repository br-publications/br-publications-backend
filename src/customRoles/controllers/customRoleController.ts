import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import customRoleService from '../services/customRoleService';
import { sendSuccess, sendError } from '../../utils/responseHandler';

/**
 * Get all custom roles
 */
export const getAllCustomRoles = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void | Response> => {
    try {
        const customRoles = await customRoleService.getAllCustomRoles();
        return sendSuccess(res, { customRoles }, 'Custom roles retrieved successfully');
    } catch (error: any) {
        console.error('Get all custom roles error:', error);
        return sendError(res, 'Failed to retrieve custom roles', 500);
    }
};

/**
 * Get all system roles
 */
export const getAllSystemRoles = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void | Response> => {
    try {
        const systemRoles = await customRoleService.getAllSystemRoles();

        // Filter out Super Admin (developer) role from the response
        const filteredRoles = systemRoles.filter(role => role.name !== 'developer');

        return sendSuccess(res, { systemRoles: filteredRoles }, 'System roles retrieved successfully');
    } catch (error: any) {
        console.error('Get all system roles error:', error);
        return sendError(res, 'Failed to retrieve system roles', 500);
    }
};

/**
 * Get custom role by ID
 */
export const getCustomRoleById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void | Response> => {
    try {
        const roleId = parseInt(req.params.id);

        if (isNaN(roleId)) {
            return sendError(res, 'Invalid role ID', 400);
        }

        const role = await customRoleService.getCustomRoleById(roleId);
        return sendSuccess(res, { role }, 'Custom role retrieved successfully');
    } catch (error: any) {
        console.error('Get custom role by ID error:', error);
        return sendError(res, error.message || 'Failed to retrieve custom role', 500);
    }
};

/**
 * Create new custom role
 */
export const createCustomRole = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void | Response> => {
    try {
        const { name, displayName, description, permissionIds } = req.body;
        const createdBy = req.authenticatedUser!.id;

        // Validation
        if (!name || !displayName) {
            return sendError(res, 'Role name and display name are required', 400);
        }

        if (!permissionIds || !Array.isArray(permissionIds) || permissionIds.length === 0) {
            return sendError(res, 'At least one permission must be selected', 400);
        }

        // Validate name format (lowercase, underscores only)
        const nameRegex = /^[a-z_]+$/;
        if (!nameRegex.test(name)) {
            return sendError(
                res,
                'Role name must be lowercase with underscores only (e.g., content_manager)',
                400
            );
        }

        const role = await customRoleService.createCustomRole({
            name,
            displayName,
            description,
            permissionIds,
            createdBy,
        });

        return sendSuccess(res, { role }, 'Custom role created successfully', 201);
    } catch (error: any) {
        console.error('Create custom role error:', error);
        return sendError(res, 'Failed to create custom role', 500);
    }
};

/**
 * Update custom role
 */
export const updateCustomRole = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void | Response> => {
    try {
        const roleId = parseInt(req.params.id);
        const { displayName, description, permissionIds } = req.body;

        if (isNaN(roleId)) {
            return sendError(res, 'Invalid role ID', 400);
        }

        const role = await customRoleService.updateCustomRole(roleId, {
            displayName,
            description,
            permissionIds,
        });

        return sendSuccess(res, { role }, 'Custom role updated successfully');
    } catch (error: any) {
        console.error('Update custom role error:', error);
        return sendError(res, 'Failed to update custom role', 500);
    }
};

/**
 * Delete custom role
 */
export const deleteCustomRole = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void | Response> => {
    try {
        const roleId = parseInt(req.params.id);

        if (isNaN(roleId)) {
            return sendError(res, 'Invalid role ID', 400);
        }

        await customRoleService.deleteCustomRole(roleId);
        return sendSuccess(res, null, 'Custom role deleted successfully');
    } catch (error: any) {
        console.error('Delete custom role error:', error);
        return sendError(res, 'Failed to delete custom role', 500);
    }
};

/**
 * Get all permissions grouped by category
 */
export const getPermissionsByCategory = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void | Response> => {
    try {
        const permissions = await customRoleService.getPermissionsByCategory();
        return sendSuccess(res, { permissions }, 'Permissions retrieved successfully');
    } catch (error: any) {
        console.error('Get permissions by category error:', error);
        return sendError(res, 'Failed to retrieve permissions', 500);
    }
};

/**
 * Assign custom role to user
 */
export const assignRoleToUser = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void | Response> => {
    try {
        const userId = parseInt(req.params.userId);
        const { roleId } = req.body;
        const assignedBy = req.authenticatedUser!.id;

        if (isNaN(userId) || !roleId) {
            return sendError(res, 'Invalid user ID or role ID', 400);
        }

        await customRoleService.assignRoleToUser(userId, roleId, assignedBy);
        return sendSuccess(res, null, 'Role assigned to user successfully');
    } catch (error: any) {
        console.error('Assign role to user error:', error);
        return sendError(res, error.message || 'Failed to assign role to user', 500);
    }
};

/**
 * Remove custom role from user
 */
export const removeRoleFromUser = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void | Response> => {
    try {
        const userId = parseInt(req.params.userId);
        const roleId = parseInt(req.params.roleId);

        if (isNaN(userId) || isNaN(roleId)) {
            return sendError(res, 'Invalid user ID or role ID', 400);
        }

        await customRoleService.removeRoleFromUser(userId, roleId);
        return sendSuccess(res, null, 'Role removed from user successfully');
    } catch (error: any) {
        console.error('Remove role from user error:', error);
        return sendError(res, error.message || 'Failed to remove role from user', 500);
    }
};

/**
 * Get user's custom roles
 */
export const getUserCustomRoles = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void | Response> => {
    try {
        const userId = parseInt(req.params.userId);

        if (isNaN(userId)) {
            return sendError(res, 'Invalid user ID', 400);
        }

        const roles = await customRoleService.getUserCustomRoles(userId);
        return sendSuccess(res, { roles }, 'User custom roles retrieved successfully');
    } catch (error: any) {
        console.error('Get user custom roles error:', error);
        return sendError(res, 'Failed to retrieve user custom roles', 500);
    }
};
