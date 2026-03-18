import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import User, { UserRole } from '../models/user';
import { sendError } from '../utils/responseHandler';

/**
 * Middleware to require admin role
 */
export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const user = req.authenticatedUser;

    if (!user) {
      return sendError(res, 'Authentication required', 401);
    }

    if (!user.hasRole(UserRole.ADMIN) && !user.hasRole(UserRole.DEVELOPER)) {
      return sendError(res, 'Access denied. Admin privileges required.', 403);
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    return sendError(res, 'Authorization check failed', 500);
  }
};

/**
 * Middleware to require developer role
 */
export const requireDeveloper = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const user = req.authenticatedUser;

    if (!user) {
      return sendError(res, 'Authentication required', 401);
    }

    if (!user.hasRole(UserRole.DEVELOPER)) {
      return sendError(res, 'Access denied. Developer privileges required.', 403);
    }

    next();
  } catch (error) {
    console.error('Developer check error:', error);
    return sendError(res, 'Authorization check failed', 500);
  }
};

/**
 * Middleware factory to check if user has a specific permission
 * @param permission - The permission string to check (e.g., 'user:read', 'submission:create')
 */
export const hasPermission = (permission: string) => {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> => {
    try {
      const user = req.authenticatedUser;

      if (!user) {
        return sendError(res, 'Authentication required', 401);
      }

      if (!user.hasPermission(permission)) {
        return sendError(
          res,
          `Access denied. Required permission: ${permission}`,
          403
        );
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return sendError(res, 'Permission check failed', 500);
    }
  };
};

/**
 * Middleware factory to check if user has any of the specified permissions
 * @param permissions - Array of permission strings
 */
export const hasAnyPermission = (permissions: string[]) => {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> => {
    try {
      const user = req.authenticatedUser;

      if (!user) {
        return sendError(res, 'Authentication required', 401);
      }

      if (!user.hasAnyPermission(permissions)) {
        return sendError(
          res,
          `Access denied. Required one of: ${permissions.join(', ')}`,
          403
        );
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return sendError(res, 'Permission check failed', 500);
    }
  };
};

/**
 * Middleware factory to check if user has all of the specified permissions
 * @param permissions - Array of permission strings
 */
export const hasAllPermissions = (permissions: string[]) => {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> => {
    try {
      const user = req.authenticatedUser;

      if (!user) {
        return sendError(res, 'Authentication required', 401);
      }

      if (!user.hasAllPermissions(permissions)) {
        return sendError(
          res,
          `Access denied. Required all of: ${permissions.join(', ')}`,
          403
        );
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return sendError(res, 'Permission check failed', 500);
    }
  };
};

/**
 * Middleware factory to check if user has any of the specified roles
 * @param roles - One or more UserRole values
 */
export const hasRole = (...roles: UserRole[]) => {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> => {
    try {
      const user = req.authenticatedUser;

      if (!user) {
        return sendError(res, 'Authentication required', 401);
      }

      // Developer (Super Admin) bypasses all role checks
      if (user.role === UserRole.DEVELOPER) {
        return next();
      }

      if (!user.hasAnyRole(roles)) {
        console.error(`[RBAC] Access denied for user ${user.username} (ID: ${user.id}, Role: ${user.role}). Required one of: ${JSON.stringify(roles)}`);
        return sendError(
          res,
          `You are not authorized to perform this action. Required role: ${roles.join(' or ')}`,
          403
        );
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      return sendError(res, 'Role check failed', 500);
    }
  };
};

/**
 * Middleware factory to check if user has a role level at or above the specified level
 * @param role - The minimum role level required
 */
export const hasRoleLevel = (role: UserRole) => {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> => {
    try {
      const user = req.authenticatedUser;

      if (!user) {
        return sendError(res, 'Authentication required', 401);
      }

      if (!user.hasRoleLevel(role)) {
        return sendError(
          res,
          `Access denied. Required role level: ${role} or higher`,
          403
        );
      }

      next();
    } catch (error) {
      console.error('Role level check error:', error);
      return sendError(res, 'Role level check failed', 500);
    }
  };
};

/**
 * Middleware to check if the authenticated user is the owner of the resource
 * Checks if req.params.id matches req.authenticatedUser.id
 */
export const isOwner = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const user = req.authenticatedUser;
    const resourceUserId = parseInt(req.params.id);

    if (!user) {
      return sendError(res, 'Authentication required', 401);
    }

    if (isNaN(resourceUserId)) {
      return sendError(res, 'Invalid resource ID', 400);
    }

    // Allow if user is the owner OR has admin/developer role
    if (user.id !== resourceUserId && !user.isAdminOrDeveloper()) {
      return sendError(
        res,
        'Access denied. You can only access your own resources.',
        403
      );
    }

    next();
  } catch (error) {
    console.error('Ownership check error:', error);
    return sendError(res, 'Ownership check failed', 500);
  }
};

/**
 * Middleware to check if the authenticated user is the owner OR has specific permission
 * @param permission - The permission to check if not owner
 */
export const isOwnerOrHasPermission = (permission: string) => {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> => {
    try {
      const user = req.authenticatedUser;
      const resourceUserId = parseInt(req.params.id);

      if (!user) {
        return sendError(res, 'Authentication required', 401);
      }

      if (isNaN(resourceUserId)) {
        return sendError(res, 'Invalid resource ID', 400);
      }

      // Allow if user is the owner OR has the required permission
      if (user.id !== resourceUserId && !user.hasPermission(permission)) {
        return sendError(
          res,
          `Access denied. You must be the owner or have '${permission}' permission.`,
          403
        );
      }

      next();
    } catch (error) {
      console.error('Owner/Permission check error:', error);
      return sendError(res, 'Authorization check failed', 500);
    }
  };
};

/**
 * Middleware to check if user can manage the target user
 * Uses the User model's canManageUser method
 */
export const canManageUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const requestingUser = req.authenticatedUser;
    const targetUserId = parseInt(req.params.id);

    if (!requestingUser) {
      return sendError(res, 'Authentication required', 401);
    }

    if (isNaN(targetUserId)) {
      return sendError(res, 'Invalid user ID', 400);
    }

    // Fetch target user
    const targetUser = await User.findByPk(targetUserId);

    if (!targetUser) {
      return sendError(res, 'Target user not found', 404);
    }

    // Check if requesting user can manage target user
    if (!requestingUser.canManageUser(targetUser)) {
      return sendError(
        res,
        'Access denied. You cannot manage this user.',
        403
      );
    }

    next();
  } catch (error) {
    console.error('User management check error:', error);
    return sendError(res, 'User management check failed', 500);
  }
};

/**
 * Middleware to allow access for owner or admin/developer
 * Commonly used for profile updates, account deletion, etc.
 */
export const isOwnerOrAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const user = req.authenticatedUser;
    const resourceUserId = parseInt(req.params.id);

    if (!user) {
      return sendError(res, 'Authentication required', 401);
    }

    if (isNaN(resourceUserId)) {
      return sendError(res, 'Invalid resource ID', 400);
    }

    // Allow if user is the owner OR is admin/developer
    if (user.id !== resourceUserId && !user.isAdminOrDeveloper()) {
      return sendError(
        res,
        'Access denied. You can only manage your own account unless you are an admin.',
        403
      );
    }

    next();
  } catch (error) {
    console.error('Owner/Admin check error:', error);
    return sendError(res, 'Authorization check failed', 500);
  }
};

/**
 * Middleware to check if user is admin or developer
 */
export const isAdminOrDeveloper = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const user = req.authenticatedUser;

    if (!user) {
      return sendError(res, 'Authentication required', 401);
    }

    if (!user.isAdminOrDeveloper()) {
      return sendError(
        res,
        'Access denied. Admin or Developer privileges required.',
        403
      );
    }

    next();
  } catch (error) {
    console.error('Admin/Developer check error:', error);
    return sendError(res, 'Authorization check failed', 500);
  }
};

/**
 * Middleware to prevent developers from being managed by admins
 * Used in routes where admins shouldn't be able to modify developer accounts
 */
export const preventDeveloperManagement = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const requestingUser = req.authenticatedUser;
    const targetUserId = parseInt(req.params.id);

    if (!requestingUser) {
      return sendError(res, 'Authentication required', 401);
    }

    if (isNaN(targetUserId)) {
      return sendError(res, 'Invalid user ID', 400);
    }

    // If requesting user is a developer, allow
    if (requestingUser.isDeveloper()) {
      return next();
    }

    // Fetch target user
    const targetUser = await User.findByPk(targetUserId);

    if (!targetUser) {
      return sendError(res, 'Target user not found', 404);
    }

    // If target is a developer and requester is not, deny
    if (targetUser.isDeveloper()) {
      return sendError(
        res,
        'Access denied. Only developers can manage developer accounts.',
        403
      );
    }

    next();
  } catch (error) {
    console.error('Developer management prevention error:', error);
    return sendError(res, 'Authorization check failed', 500);
  }
};

export default {
  requireAdmin,
  requireDeveloper,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasRole,
  hasRoleLevel,
  isOwner,
  isOwnerOrHasPermission,
  canManageUser,
  isOwnerOrAdmin,
  isAdminOrDeveloper,
  preventDeveloperManagement,
};
