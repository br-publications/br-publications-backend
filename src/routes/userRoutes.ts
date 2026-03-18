import express from 'express';
import {
  getAllUsers,
  getUserById,
  getUserByEmail,
  updateUserProfile,
  updateUserRole,
  deleteUserById,
  permanentlyDeleteUserById,
  reactivateUser,
  getUserPermissions,
  getCurrentUser,
  verifyEmailChange,
  resendEmailVerificationOTP,
  getUsersByRole,
  getReviewers,
  impersonateUser,
  getReviewerStats,
  emailReviewer,
  updateProfilePicture,
} from '../controllers/userController';
import { authenticate, requireVerified, AuthRequest } from '../middleware/auth';
import {
  requireAdmin,
  hasPermission,
  isOwner,
  canManageUser,
  hasRole,
} from '../middleware/roleBasedAccessControl.middleware';
import { UserRole } from '../models/user';
import multer from 'multer';

// Configure multer for file uploads (store in memory for DB storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max for profile picture
  }
});

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints with role-based access control
 */

// ===========================
// CURRENT USER ROUTES
// ===========================

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current authenticated user profile
 *     description: |
 *       Returns the profile of the currently authenticated user with their permissions.
 *       No additional permissions required - only authentication.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user retrieved successfully
 *       401:
 *         description: Unauthorized - No valid token
 */
router.get('/me', authenticate, getCurrentUser);

/**
 * @swagger
 * /api/users/me/update:
 *   put:
 *     summary: Update own profile
 *     description: |
 *       Update your own profile information. If email is changed, an OTP will be sent
 *       to the new email address for verification.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: John Smith
 *               username:
 *                 type: string
 *                 example: johnsmith_updated
 *               email:
 *                 type: string
 *                 example: newemail@example.com
 *               profilePicture:
 *                 type: string
 *                 example: https://example.com/profile.jpg
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.put('/me/update', authenticate, (req: AuthRequest, res, next) => {
  // Set the id param to the authenticated user's id
  if (req.authenticatedUser) {
    req.params.id = req.authenticatedUser.id.toString();
  }
  next();
}, updateUserProfile);

/**
 * @swagger
 * /api/users/me/profile-picture:
 *   put:
 *     summary: Update own profile picture
 *     description: Upload a new profile picture (Base64 conversion)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.put('/me/profile-picture', authenticate, upload.single('profilePicture'), updateProfilePicture);

/**
 * @swagger
 * /api/users/me/verify-email:
 *   post:
 *     summary: Verify new email with OTP
 *     description: |
 *       After updating email, use this endpoint to verify the new email address with the OTP
 *       that was sent to the new email.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *             properties:
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired OTP
 *       401:
 *         description: Unauthorized
 *       429:
 *         description: Too many failed attempts
 */
router.post('/me/verify-email', authenticate, verifyEmailChange);

/**
 * @swagger
 * /api/users/me/resend-verification:
 *   post:
 *     summary: Resend email verification OTP
 *     description: |
 *       Request a new OTP to be sent to your email address if the previous one expired
 *       or was not received.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Email already verified
 *       401:
 *         description: Unauthorized
 *       429:
 *         description: Please wait before requesting new OTP
 */
router.post('/me/resend-verification', authenticate, resendEmailVerificationOTP);

// ===========================
// ADMIN/DEVELOPER ROUTES
// ===========================

/**
 * @swagger
 * /api/users/reviewers:
 *   get:
 *     summary: Get all reviewers
 *     description: |
 *       **Required Permission:** `submission:assign-reviewer`
 *       **Roles:** Editor, Admin, Developer
 *       
 *       Returns a list of all active reviewers.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reviewers retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get(
  '/reviewers',
  authenticate,
  requireVerified,
  hasPermission('submission:assign-reviewer'),
  getReviewers
);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users with pagination and search
 *     description: |
 *       **Required Permission:** `user:view-all`
 *       **Roles:** Admin, Developer
 *       
 *       Returns a paginated list of all users with optional search and filter functionality.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of users per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, email, username, or userId
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, author, student, admin, editor, reviewer, developer]
 *         description: Filter by role
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Unauthorized - No valid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 */
router.get(
  '/',
  authenticate,
  requireVerified,
  hasPermission('user:view-all'),
  getAllUsers
);

/**
 * @swagger
 * /api/users/id/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: |
 *       **Required Permission:** `user:read` (for any user) OR own user ID
 *       **Roles:** Admin, Developer, or the user themselves
 *       
 *       Users can view their own profile. Admins/Developers can view any profile.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       400:
 *         description: Invalid user ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Can only view own profile or requires admin permission
 *       404:
 *         description: User not found
 */
router.get(
  '/id/:id',
  authenticate,
  requireVerified,
  getUserById
);

/**
 * @swagger
 * /api/users/email/{email}:
 *   get:
 *     summary: Get user by email
 *     description: |
 *       **Required Permission:** `user:read`
 *       **Roles:** Admin, Developer, Editor, Reviewer
 *       
 *       Search for a user by their email address.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: User email
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       400:
 *         description: Invalid email address
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: User not found
 */
router.get(
  '/email/:email',
  authenticate,
  requireVerified,
  hasPermission('user:read'),
  getUserByEmail
);

/**
 * @swagger
 * /api/users/{id}/permissions:
 *   get:
 *     summary: Get user permissions
 *     description: |
 *       **Required Permission:** Own user OR `user:read`
 *       
 *       Get a list of all permissions for a specific user based on their role.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User permissions retrieved successfully
 *       400:
 *         description: Invalid user ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.get(
  '/:id/permissions',
  authenticate,
  requireVerified,
  getUserPermissions
);

// ===========================
// USER PROFILE MANAGEMENT
// ===========================

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user profile
 *     description: |
 *       **Required Permission:** Own user OR `user:update`
 *       **Roles:** Any user can update their own profile. Admin/Developer can update any profile.
 *       
 *       Update user profile information (fullName, username, email, profilePicture).
 *       Regular users should use /api/users/me/update for better experience.
 *       If email is changed, OTP verification will be required.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: John Smith Updated
 *               username:
 *                 type: string
 *                 example: johnsmith_updated
 *               email:
 *                 type: string
 *                 example: johnupdated@example.com
 *               profilePicture:
 *                 type: string
 *                 example: https://example.com/profile.jpg
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Can only update own profile or requires admin permission
 *       404:
 *         description: User not found
 */
router.put(
  '/:id',
  authenticate,
  requireVerified,
  updateUserProfile
);

/**
 * @swagger
 * /api/users/{id}/role:
 *   put:
 *     summary: Update user role
 *     description: |
 *       **Required Permission:** `user:assign-roles`
 *       **Roles:** Admin, Developer
 *       
 *       Update a user's role. Admins cannot assign/modify developer roles.
 *       Only developers can create or modify developer accounts.
 *       Admins cannot manage developer accounts at all.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, author, student, admin, editor, reviewer, developer]
 *                 example: editor
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       400:
 *         description: Invalid role
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Cannot manage this user's role
 *       404:
 *         description: User not found
 */
router.put(
  '/:id/role',
  authenticate,
  requireVerified,
  hasPermission('user:assign-roles'),
  updateUserRole
);

// ===========================
// ACCOUNT MANAGEMENT
// ===========================

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Deactivate user account (soft delete)
 *     description: |
 *       **Required Permission:** Own user OR `user:delete`
 *       **Roles:** Any user can deactivate their own account. Admin/Developer can deactivate any account.
 *       
 *       Soft delete - Sets isActive to false. Admins cannot deactivate developer accounts.
 *       Developer accounts can only be deactivated by other developers.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: Account deactivated successfully
 *       400:
 *         description: Invalid user ID or account already deactivated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Can only delete own account or requires admin permission
 *       404:
 *         description: User not found
 */
router.delete(
  '/:id',
  authenticate,
  requireVerified,
  deleteUserById
);

/**
 * @swagger
 * /api/users/{id}/permanent:
 *   delete:
 *     summary: Permanently delete user account (hard delete)
 *     description: |
 *       **Required Permission:** Developer only
 *       **Roles:** Developer
 *       
 *       Permanently removes user from database. This action cannot be undone.
 *       Only developers can perform this action, and they cannot delete their own account.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User permanently deleted
 *       400:
 *         description: Invalid user ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Requires developer privileges
 *       404:
 *         description: User not found
 */
router.delete(
  '/:id/permanent',
  authenticate,
  requireVerified,
  hasRole(UserRole.DEVELOPER, UserRole.ADMIN),
  permanentlyDeleteUserById
);

/**
 * @swagger
 * /api/users/{id}/reactivate:
 *   post:
 *     summary: Reactivate deactivated user account
 *     description: |
 *       **Required Permission:** Own user OR `user:update`
 *       **Roles:** User can reactivate their own account. Admin/Developer can reactivate any account.
 *       
 *       Reactivates a previously deactivated account by setting isActive to true.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: Account reactivated successfully
 *       400:
 *         description: Invalid user ID or account already active
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Can only reactivate own account or requires admin permission
 *       404:
 *         description: User not found
 */
router.post(
  '/:id/reactivate',
  authenticate,
  // No requireVerified here since deactivated users might not be marked as verified
  reactivateUser
);

/**
 * @swagger
 * /api/users/{id}/impersonate:
 *   post:
 *     summary: Impersonate a user (Login as User)
 *     description: |
 *       **Required Permission:** Admin or Developer role
 *       
 *       Generates a login token for the target user without password.
 *       Cannot impersonate developers or oneself.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: Login successful (returns token)
 *       403:
 *         description: Forbidden - Insufficient permissions or target is protected
 *       404:
 *         description: User not found
 */
router.post(
  '/:id/impersonate',
  authenticate,
  requireVerified,
  hasRole(UserRole.ADMIN, UserRole.DEVELOPER, UserRole.EDITOR),
  impersonateUser
);

// ===========================
// ROLE-SPECIFIC ROUTES
// ===========================

/**
 * @swagger
 * /api/users/{id}/stats:
 *   get:
 *     summary: Get reviewer statistics
 *     description: |
 *       **Required Permission:** `submission:view`
 *       **Roles:** Editor, Admin
 *       
 *       Returns statistics for a reviewer (assignments, completion rate, etc.).
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Reviewer User ID
 *     responses:
 *       200:
 *         description: Stats retrieved successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Reviewer not found
 */
router.get(
  '/:id/stats',
  authenticate,
  requireVerified,
  hasPermission('submission:assign-reviewer'),
  getReviewerStats
);

/**
 * @swagger
 * /api/users/{id}/email:
 *   post:
 *     summary: Send email to reviewer
 *     description: |
 *       **Required Permission:** Editor, Admin
 *       
 *       Send an email to a reviewer.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Reviewer User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subject
 *               - message
 *             properties:
 *               subject:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email sent successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Reviewer not found
 */
router.post(
  '/:id/email',
  authenticate,
  requireVerified,
  hasRole(UserRole.EDITOR, UserRole.ADMIN), // Explicit role check as per controller logic
  emailReviewer
);


// /**
//  * @swagger
//  * /api/users/role/editors:
//  *   get:
//  *     summary: Get all editors
//  *     description: |
//  *       **Required Permission:** `user:view-all`
//  *       **Roles:** Admin, Developer
//  *       
//  *       Returns a list of all users with editor role.
//  *     tags: [Users]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: query
//  *         name: page
//  *         schema:
//  *           type: integer
//  *           default: 1
//  *       - in: query
//  *         name: limit
//  *         schema:
//  *           type: integer
//  *           default: 10
//  *     responses:
//  *       200:
//  *         description: Editors retrieved successfully
//  *       401:
//  *         description: Unauthorized
//  *       403:
//  *         description: Forbidden - Insufficient permissions
//  */
// router.get(
//   '/role/editors',
//   authenticate,
//   requireVerified,
//   hasPermission('user:view-all'),
//   async (req, res, next) => {
//     // Add role filter to request
//     req.query.role = UserRole.EDITOR;
//     next();
//   },
//   getUserByRole
// );

// /**
//  * @swagger
//  * /api/users/role/reviewers:
//  *   get:
//  *     summary: Get all reviewers
//  *     description: |
//  *       **Required Permission:** Editor, Admin, or Developer role
//  *       **Roles:** Admin, Developer, Editor
//  *       
//  *       Returns a list of all users with reviewer role.
//  *     tags: [Users]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: query
//  *         name: page
//  *         schema:
//  *           type: integer
//  *           default: 1
//  *       - in: query
//  *         name: limit
//  *         schema:
//  *           type: integer
//  *           default: 10
//  *     responses:
//  *       200:
//  *         description: Reviewers retrieved successfully
//  *       401:
//  *         description: Unauthorized
//  *       403:
//  *         description: Forbidden - Insufficient permissions
//  */
// router.get(
//   '/role/reviewers',
//   authenticate,
//   requireVerified,
//   hasRole(UserRole.EDITOR, UserRole.ADMIN, UserRole.DEVELOPER),
//   async (req, res, next) => {
//     // Add role filter to request
//     req.query.role = UserRole.REVIEWER;
//     next();
//   },
//   getAllUsers
// );

// /**
//  * @swagger
//  * /api/users/role/authors:
//  *   get:
//  *     summary: Get all authors
//  *     description: |
//  *       **Required Permission:** Editor, Admin, or Developer role
//  *       **Roles:** Admin, Developer, Editor
//  *       
//  *       Returns a list of all users with author role.
//  *     tags: [Users]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: query
//  *         name: page
//  *         schema:
//  *           type: integer
//  *           default: 1
//  *       - in: query
//  *         name: limit
//  *         schema:
//  *           type: integer
//  *           default: 10
//  *     responses:
//  *       200:
//  *         description: Authors retrieved successfully
//  *       401:
//  *         description: Unauthorized
//  *       403:
//  *         description: Forbidden - Insufficient permissions
//  */
// router.get(
//   '/role/authors',
//   authenticate,
//   requireVerified,
//   hasRole(UserRole.EDITOR, UserRole.ADMIN, UserRole.DEVELOPER),
//   async (req, res, next) => {
//     // Add role filter to request
//     req.query.role = UserRole.AUTHOR;
//     next();
//   },
//   getAllUsers
// );

// /**
//  * @swagger
//  * /api/users/role/students:
//  *   get:
//  *     summary: Get all students
//  *     description: |
//  *       **Required Permission:** `user:view-all`
//  *       **Roles:** Admin, Developer, Editor
//  *       
//  *       Returns a list of all users with student role.
//  *     tags: [Users]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: query
//  *         name: page
//  *         schema:
//  *           type: integer
//  *           default: 1
//  *       - in: query
//  *         name: limit
//  *         schema:
//  *           type: integer
//  *           default: 10
//  *     responses:
//  *       200:
//  *         description: Students retrieved successfully
//  *       401:
//  *         description: Unauthorized
//  *       403:
//  *         description: Forbidden - Insufficient permissions
//  */
// router.get(
//   '/role/students',
//   authenticate,
//   requireVerified,
//   hasRole(UserRole.EDITOR, UserRole.ADMIN, UserRole.DEVELOPER),
//   async (req, res, next) => {
//     // Add role filter to request
//     req.query.role = UserRole.STUDENT;
//     next();
//   },
//   getAllUsers
// );

// /**
//  * @swagger
//  * /api/users/role/admins:
//  *   get:
//  *     summary: Get all admins
//  *     description: |
//  *       **Required Permission:** Developer only
//  *       **Roles:** Developer
//  *       
//  *       Returns a list of all users with admin role. Only developers can view this list.
//  *     tags: [Users]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: query
//  *         name: page
//  *         schema:
//  *           type: integer
//  *           default: 1
//  *       - in: query
//  *         name: limit
//  *         schema:
//  *           type: integer
//  *           default: 10
//  *     responses:
//  *       200:
//  *         description: Admins retrieved successfully
//  *       401:
//  *         description: Unauthorized
//  *       403:
//  *         description: Forbidden - Developer access required
//  */
// router.get(
//   '/role/admins',
//   authenticate,
//   requireVerified,
//   hasRole(UserRole.DEVELOPER),
//   async (req, res, next) => {
//     // Add role filter to request
//     req.query.role = UserRole.ADMIN;
//     next();
//   },
//   getAllUsers
// );


/**
 * @swagger
 * /api/users/role/{role}:
 *   get:
 *     summary: Get all users by role
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: role
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, author, reviewer, editor, admin, developer]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       400:
 *         description: Invalid role
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: No users found with this role
 */
router.get(
  '/role/:role',
  authenticate,
  requireVerified,
  hasPermission('user:read'),
  getUsersByRole
);

// Convenience routes for specific roles
router.get(
  '/role/editors',
  authenticate,
  requireVerified,
  hasPermission('user:read'),
  (req, res, next) => {
    req.params.role = UserRole.EDITOR;
    next();
  },
  getUsersByRole
);

router.get(
  '/role/reviewers',
  authenticate,
  requireVerified,
  hasPermission('user:read'),
  (req, res, next) => {
    req.params.role = UserRole.REVIEWER;
    next();
  },
  getUsersByRole
);

router.get(
  '/role/authors',
  authenticate,
  requireVerified,
  hasPermission('user:read'),
  (req, res, next) => {
    req.params.role = UserRole.AUTHOR;
    next();
  },
  getUsersByRole
);

router.get(
  '/role/admins',
  authenticate,
  requireVerified,
  hasPermission('user:read'),
  (req, res, next) => {
    req.params.role = UserRole.ADMIN;
    next();
  },
  getUsersByRole
);

export default router;

