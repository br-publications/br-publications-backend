import express from 'express';
import {
  register,
  sendOTP,
  verifyEmail,
  login,
  verifyLoginOTP,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  googleAuthCallback,
  googleSendOTP,
  googleVerifyOTP,
  getCurrentUser,
  updateProfile,
  logout,
  logoutAllDevices,
} from '../controllers/authController';
import {
  validateRegistration,
  validateLogin,
  validateOTP,
  validatePasswordReset,
  validateForgotPassword,
} from '../middleware/validation';
import { authenticate, requireVerified } from '../middleware/auth';
import {
  loginLimiter,
  otpSendLimiter,
  otpVerifyLimiter,
  registerLimiter,
  passwordResetLimiter,
} from '../middleware/rateLimiter';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and authorization endpoints with Google OAuth
 */

// ===========================
// PUBLIC ROUTES (No Authentication)
// ===========================

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user (defaults to 'user' role)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - username
 *               - email
 *               - password
 *               - confirmPassword
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: John Doe
 *               username:
 *                 type: string
 *                 example: johndoe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: Password@123
 *               confirmPassword:
 *                 type: string
 *                 example: Password@123
 *     responses:
 *       201:
 *         description: Registration successful
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email or username already registered
 */
router.post('/register', registerLimiter, register);

/**
 * @swagger
 * /api/auth/send-otp:
 *   post:
 *     summary: Send or resend OTP to email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       404:
 *         description: User not found
 */
router.post('/send-otp', otpSendLimiter, sendOTP);

/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: Verify email with OTP
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Email verified successfully, JWT token returned
 *       400:
 *         description: Invalid or expired OTP
 *       404:
 *         description: User not found
 */
router.post('/verify-email', otpVerifyLimiter, validateOTP, verifyEmail);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with username or email (Step 1 - Credential Check)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usernameOrEmail
 *               - password
 *             properties:
 *               usernameOrEmail:
 *                 type: string
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 example: Password@123
 *     responses:
 *       200:
 *         description: OTP sent for 2FA
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Account not verified or deactivated
 */
router.post('/login', loginLimiter, validateLogin, login);

/**
 * @swagger
 * /api/auth/verify-login-otp:
 *   post:
 *     summary: Verify login OTP (Step 2 - 2FA)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login successful, JWT token returned
 *       400:
 *         description: Invalid or expired OTP
 *       404:
 *         description: User not found
 */
router.post('/verify-login-otp', otpVerifyLimiter, validateOTP, verifyLoginOTP);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset OTP
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: Reset OTP sent to email
 *       404:
 *         description: User not found
 */
router.post('/forgot-password', passwordResetLimiter, validateForgotPassword, forgotPassword);

/**
 * @swagger
 * /api/auth/verify-reset-otp:
 *   post:
 *     summary: Verify password reset OTP
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid or expired OTP
 */
router.post('/verify-reset-otp', otpVerifyLimiter, validateOTP, verifyResetOTP);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password with verified OTP
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               newPassword:
 *                 type: string
 *                 example: NewPassword@123
 *               confirmPassword:
 *                 type: string
 *                 example: NewPassword@123
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Validation error or invalid OTP
 */
router.post('/reset-password', passwordResetLimiter, validatePasswordReset, resetPassword);

// ===========================
// GOOGLE OAUTH ROUTES
// ===========================

/**
 * @swagger
 * /api/auth/google/callback:
 *   post:
 *     summary: Handle Google OAuth callback
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - redirectUri
 *             properties:
 *               code:
 *                 type: string
 *                 description: Authorization code from Google
 *               redirectUri:
 *                 type: string
 *                 example: http://localhost:5173/auth/google/callback
 *               flow:
 *                 type: string
 *                 enum: [register, login]
 *                 example: register
 *     responses:
 *       200:
 *         description: OTP sent for verification OR direct login (if no OTP required)
 *       400:
 *         description: Invalid authorization code
 *       500:
 *         description: Google authentication failed
 */
router.post('/google/callback', googleAuthCallback);

/**
 * @swagger
 * /api/auth/google/send-otp:
 *   post:
 *     summary: Send OTP for Google OAuth users
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.post('/google/send-otp', otpSendLimiter, googleSendOTP);

/**
 * @swagger
 * /api/auth/google/verify-otp:
 *   post:
 *     summary: Verify OTP for Google OAuth users
 *     tags: [Authentication]
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
 *         description: Authentication successful, JWT token returned
 *       400:
 *         description: Invalid or expired OTP
 *       401:
 *         description: Unauthorized
 */
router.post('/google/verify-otp', otpVerifyLimiter, googleVerifyOTP);

// ===========================
// PROTECTED ROUTES (Require Authentication)
// ===========================

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user information
 *     description: Requires authentication. Returns user profile information.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *       401:
 *         description: Unauthorized - No valid token
 *       404:
 *         description: User not found
 */
router.get('/me', authenticate, getCurrentUser);

/**
 * @swagger
 * /api/auth/update-profile:
 *   put:
 *     summary: Update user profile
 *     description: Requires authentication and verified account.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: John Updated
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Account not verified
 */
router.put('/update-profile', authenticate, requireVerified, updateProfile);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user (revoke current token)
 *     description: Requires authentication. Blacklists the current token.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/logout', authenticate, logout);

/**
 * @swagger
 * /api/auth/logout-all:
 *   post:
 *     summary: Logout from all devices
 *     description: Requires authentication. Blacklists all active tokens for the user.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out from all devices successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/logout-all', authenticate, logoutAllDevices);

export default router;
