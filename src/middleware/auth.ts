import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user';
import TokenBlacklist from '../models/tokenBlacklist';
import { sendError } from '../utils/responseHandler';

// Extend the Express Request interface to include the authenticated user
export interface AuthRequest extends Request {
  authenticatedUser?: User; // Full User instance with all methods
  token?: string; // Store the token for logout purposes
}

// JWT Payload interface
interface JwtPayload {
  userId: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Middleware to authenticate requests using JWT
 * Attaches the full User instance to req.authenticatedUser
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'No token provided. Authentication required.', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return sendError(res, 'No token provided. Authentication required.', 401);
    }

    // Verify token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not defined in environment variables');
      return sendError(res, 'Server configuration error', 500);
    }

    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return sendError(res, 'Token has expired. Please login again.', 401);
      }
      if (error.name === 'JsonWebTokenError') {
        return sendError(res, 'Invalid token. Please login again.', 401);
      }
      throw error;
    }

    // Check if token has been blacklisted (logged out)
    const blacklisted = await TokenBlacklist.findOne({ where: { token } });
    if (blacklisted) {
      return sendError(res, 'Token has been revoked. Please login again.', 401);
    }

    // Fetch the full user instance from database
    const user = await User.findOne({
      where: {
        id: decoded.userId,
        isActive: true // Only allow active users
      }
    });

    if (!user) {
      return sendError(res, 'User not found or account is deactivated.', 404);
    }

    // Role Consistency Check
    // If user's role has changed since token issuance, force re-login
    if (decoded.role && user.role !== decoded.role) {
      console.warn(`🔒 Security: Role mismatch for user ${user.id}. Token: ${decoded.role}, DB: ${user.role}`);
      return sendError(res, 'Role changed. Please login again.', 401);
    }

    // Attach the full User instance to the request
    // This gives access to all instance methods like hasPermission(), hasRole(), etc.

    req.authenticatedUser = user;

    // Also store the token for logout functionality
    req.token = token;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return sendError(res, 'Authentication failed. Please try again.', 401);
  }
};

/**
 * Middleware to require email verification
 * Should be used after authenticate middleware
 */
export const requireVerified = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const user = req.authenticatedUser;

    if (!user) {
      return sendError(res, 'Authentication required', 401);
    }

    if (!user.emailVerified) {
      return sendError(
        res,
        'Email verification required. Please verify your email to access this resource.',
        403
      );
    }

    next();
  } catch (error) {
    console.error('Email verification check error:', error);
    return sendError(res, 'Verification check failed', 500);
  }
};

/**
 * Middleware to check if user is active
 * Should be used after authenticate middleware
 */
export const requireActive = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const user = req.authenticatedUser;

    if (!user) {
      return sendError(res, 'Authentication required', 401);
    }

    if (!user.isActive) {
      return sendError(
        res,
        'Your Account has been deactivated. Please contact Admin.',
        403
      );
    }

    next();
  } catch (error) {
    console.error('Active status check error:', error);
    return sendError(res, 'Status check failed', 500);
  }
};

/**
 * Middleware factory to check if user has a specific permission
 * @param permission - The permission to check (e.g., 'user:read', 'submission:create')
 */
export const requirePermission = (permission: string) => {
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
 * @param permissions - Array of permissions to check
 */
export const requireAnyPermission = (permissions: string[]) => {
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
 * @param permissions - Array of permissions to check
 */
export const requireAllPermissions = (permissions: string[]) => {
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
 * Optional authentication - doesn't fail if no token provided
 * Useful for endpoints that work differently for authenticated vs unauthenticated users
 */
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without authentication
      return next();
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret || !token) {
      return next();
    }

    try {
      const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
      const user = await User.findOne({
        where: {
          id: decoded.userId,
          isActive: true
        }
      });

      if (user) {
        req.authenticatedUser = user;
      }
    } catch (error) {
      // Invalid token, but we don't fail - just continue without auth

    }

    next();
  } catch (error) {
    console.error('Optional authentication error:', error);
    next();
  }
};

/**
 * Middleware factory to check if user has one of the specified roles
 * @param roles - Array of allowed roles (e.g., ['ADMIN', 'EDITOR'])
 */
export const authorize = (roles: string[]) => {
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
      if (user.role === 'developer') {
        return next();
      }

      if (!roles.includes(user.role)) {

        return sendError(
          res,
          `Access denied. Required role: ${roles.join(' or ')}`,
          403
        );
      }


      next();
    } catch (error) {
      console.error('Authorization check error:', error);
      return sendError(res, 'Authorization check failed', 500);
    }
  };
};

export default {
  authenticate,
  requireVerified,
  requireActive,
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  optionalAuth,
  authorize,
};
