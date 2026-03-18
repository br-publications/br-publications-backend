import { Response } from 'express';
import { Op } from 'sequelize';
import { OAuth2Client } from 'google-auth-library';
import User, { UserRole } from '../models/user';
import { sendSuccess, sendError } from '../utils/responseHandler';
import { generateToken } from '../utils/jwt';
import { sendOTPEmail, sendPasswordResetEmail } from '../utils/emailService';
import { AuthRequest } from '../middleware/auth';
import TokenBlacklist from '../models/tokenBlacklist';
import * as jwt from 'jsonwebtoken';

const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;

// Google OAuth client (must include clientSecret for server-side code exchange)
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

// Helper function to generate OTP expiry time
const getOTPExpiry = () => {
  return new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
};

/**
 * STEP 1: Register a new user
 */
export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, username, email, password, confirmPassword } = req.body;

    // Check if passwords match
    if (password !== confirmPassword) {
      return sendError(res, 'Passwords do not match', 400);
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return sendError(
        res,
        'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
        400
      );
    }

    // Check if user already exists (Check both independently for specific feedback)
    const [existingEmail, existingUsername] = await Promise.all([
      User.findOne({ where: { email: email.toLowerCase().trim() } }),
      User.findOne({ where: { username: username.toLowerCase().trim() } })
    ]);

    const registrationErrors: any = {};
    if (existingEmail) registrationErrors.email = 'Email address already registered';
    if (existingUsername) registrationErrors.username = 'Username already taken';

    if (Object.keys(registrationErrors).length > 0) {
      return sendError(res, 'Registration failed. Some information is already in use.', 409, registrationErrors);
    }

    // Generate OTP
    // const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Create user
    const user = await User.create({
      fullName: fullName.trim(),
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      password,
      // emailOtp,
      emailOtpExpiry: getOTPExpiry(),
      emailVerified: false,
      otpAttempts: 0,
      isActive: true,
      role: UserRole.USER, // Default role
    });

    // Send OTP email
    // await sendOTPEmail(user.email, emailOtp, user.fullName);

    // Return user data (without sensitive info)
    const userData = {
      id: user.id,
      userId: user.userId,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      emailVerified: user.emailVerified,
      role: user.role,
    };

    return sendSuccess(
      res,
      userData,
      'Registration successful! Please verify your email.',
      201
    );
  } catch (error: any) {
    console.error('Registration error:', error);

    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map((err: any) => err.message).join('. ');
      return sendError(res, errors || 'Validation failed', 400);
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
      const field = error.errors[0]?.path || 'field';
      return sendError(res, `The ${field} is already in use.`, 409);
    }

    return sendError(res, 'Registration failed. Please try again.', 500);
  }
};

/**
 * STEP 2: Send OTP (for registration or login)
 */
export const sendOTP = async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    if (user.emailVerified) {
      return sendError(res, 'Email already verified', 400);
    }

    // Generate new OTP
    const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();

    user.emailOtp = emailOtp;
    user.emailOtpExpiry = getOTPExpiry();
    user.otpAttempts = 0;
    await user.save();

    // Send OTP email
    await sendOTPEmail(user.email, emailOtp, user.fullName);

    return sendSuccess(res, null, 'OTP sent successfully to your email.');
  } catch (error) {
    console.error('Send OTP error:', error);
    return sendError(res, 'Failed to send OTP. Please try again.', 500);
  }
};

/**
 * STEP 3: Verify Email OTP
 */
export const verifyEmail = async (req: AuthRequest, res: Response) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    if (user.emailVerified) {
      return sendError(res, 'Email already verified', 400);
    }

    // Check OTP attempts
    if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
      return sendError(
        res,
        'Maximum OTP attempts exceeded. Please request a new OTP.',
        429
      );
    }

    // Check OTP expiry
    if (!user.emailOtpExpiry || new Date() > user.emailOtpExpiry) {
      return sendError(res, 'OTP has expired. Please request a new one.', 400);
    }

    // Verify OTP
    if (user.emailOtp !== otp.trim()) {
      user.otpAttempts += 1;
      await user.save();

      const attemptsLeft = MAX_OTP_ATTEMPTS - user.otpAttempts;
      return sendError(
        res,
        `Invalid OTP. ${attemptsLeft} attempt(s) remaining.`,
        400
      );
    }

    // Mark email as verified
    user.emailVerified = true;
    user.emailOtp = null;
    user.emailOtpExpiry = null;
    user.otpAttempts = 0;
    await user.save();

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      isVerified: user.emailVerified,
    });

    const userData = {
      id: user.id,
      userId: user.userId,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      emailVerified: user.emailVerified,
      role: user.role,
    };

    return sendSuccess(
      res,
      {
        user: userData,
        token
      },
      'Email verified successfully! You are now logged in.'
    );
  } catch (error) {
    console.error('Email verification error:', error);
    return sendError(res, 'Email verification failed. Please try again.', 500);
  }
};

/**
 * STEP 4: Login with username or email (Step 1 - Credential Check)
 */
export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { usernameOrEmail, password } = req.body;

    // Find user by username or email
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: usernameOrEmail.toLowerCase().trim() },
          { username: usernameOrEmail.toLowerCase().trim() },
        ],
      },
    });

    if (!user) {
      return sendError(res, 'Invalid credentials', 401);
    }

    // Check if account is active
    if (!user.isActive) {
      return sendError(res, 'Account has been deactivated. Please contact Admin.', 403);
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return sendError(res, 'Invalid credentials', 401);
    }

    // Check if email is verified
    if (!user.emailVerified) {
      // Generate and send new OTP
      const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();
      user.emailOtp = emailOtp;
      user.emailOtpExpiry = getOTPExpiry();
      user.otpAttempts = 0;
      await user.save();

      await sendOTPEmail(user.email, emailOtp, user.fullName);

      return sendError(
        res,
        'Email not verified. An OTP has been sent to your email.',
        403,
        { emailVerified: false, email: user.email }
      );
    }

    // Generate OTP for 2FA
    const loginOtp = Math.floor(100000 + Math.random() * 900000).toString();
    user.emailOtp = loginOtp;
    user.emailOtpExpiry = getOTPExpiry();
    user.otpAttempts = 0;
    await user.save();

    // Send OTP email
    await sendOTPEmail(user.email, loginOtp, user.fullName);

    return sendSuccess(
      res,
      { email: user.email },
      'OTP sent to your email for verification.'
    );
  } catch (error) {
    console.error('Login error:', error);
    return sendError(res, 'Login failed. Please try again.', 500);
  }
};

/**
 * STEP 5: Verify Login OTP (Step 2 - 2FA)
 */
export const verifyLoginOTP = async (req: AuthRequest, res: Response) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Check OTP attempts
    if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
      user.emailOtp = null;
      user.emailOtpExpiry = null;
      await user.save();
      return sendError(
        res,
        'Maximum OTP attempts exceeded. Please login again.',
        429
      );
    }

    // Check OTP expiry
    if (!user.emailOtpExpiry || new Date() > user.emailOtpExpiry) {
      return sendError(res, 'OTP has expired. Please login again.', 400);
    }

    // Verify OTP
    if (user.emailOtp !== otp.trim()) {
      user.otpAttempts += 1;
      await user.save();

      const attemptsLeft = MAX_OTP_ATTEMPTS - user.otpAttempts;
      return sendError(
        res,
        `Invalid OTP. ${attemptsLeft} attempt(s) remaining.`,
        400
      );
    }

    // Clear OTP and update last login
    user.emailOtp = null;
    user.emailOtpExpiry = null;
    user.otpAttempts = 0;
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      isVerified: user.emailVerified,
    });

    const userData = {
      id: user.id,
      userId: user.userId,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      emailVerified: user.emailVerified,
      role: user.role,
      profilePicture: user.profilePicture,
    };

    return sendSuccess(
      res,
      { user: userData, token },
      'Login successful!'
    );
  } catch (error) {
    console.error('Verify login OTP error:', error);
    return sendError(res, 'OTP verification failed. Please try again.', 500);
  }
};

/**
 * STEP 6: Forgot Password - Send OTP
 */
export const forgotPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      // Don't reveal if email exists or not for security
      return sendSuccess(
        res,
        { email: email.toLowerCase().trim() },
        'If an account with this email exists, a password reset code has been sent.'
      );
    }

    // Generate reset OTP
    const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetPasswordToken = resetOtp;
    user.resetPasswordExpiry = getOTPExpiry();
    user.otpAttempts = 0;
    await user.save();

    // Send OTP via email
    await sendPasswordResetEmail(user.email, resetOtp, user.fullName);

    return sendSuccess(
      res,
      { email: user.email },
      'Password reset code has been sent to your email.'
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return sendError(res, 'Failed to process password reset request. Please try again.', 500);
  }
};

/**
 * STEP 7: Verify Reset Password OTP
 */
export const verifyResetOTP = async (req: AuthRequest, res: Response) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Check OTP attempts
    if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
      user.resetPasswordToken = null;
      user.resetPasswordExpiry = null;
      await user.save();
      return sendError(
        res,
        'Maximum OTP attempts exceeded. Please request a new password reset.',
        429
      );
    }

    // Check OTP expiry
    if (!user.resetPasswordExpiry || new Date() > user.resetPasswordExpiry) {
      return sendError(res, 'OTP has expired. Please request a new password reset.', 400);
    }

    // Verify OTP
    if (user.resetPasswordToken !== otp.trim()) {
      user.otpAttempts += 1;
      await user.save();

      const attemptsLeft = MAX_OTP_ATTEMPTS - user.otpAttempts;
      return sendError(
        res,
        `Invalid OTP. ${attemptsLeft} attempt(s) remaining.`,
        400
      );
    }

    // OTP is valid, reset attempts
    user.otpAttempts = 0;
    await user.save();

    // Generate temporary reset token
    const resetToken = jwt.sign(
      { email: user.email, purpose: 'password-reset' },
      process.env.JWT_SECRET as string,
      { expiresIn: '15m' }
    );

    return sendSuccess(
      res,
      {
        email: user.email,
        verified: true,
        resetToken
      },
      'OTP verified successfully. You can now reset your password.'
    );
  } catch (error) {
    console.error('Verify reset OTP error:', error);
    return sendError(res, 'OTP verification failed. Please try again.', 500);
  }
};

/**
 * STEP 8: Reset Password
 */
export const resetPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    // Verify reset token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Reset token is required. Please verify OTP first.', 401);
    }

    const resetToken = authHeader.substring(7);

    // Verify the reset token
    let decoded: any;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET as string);

      // Check if token is for password reset
      if (decoded.purpose !== 'password-reset') {
        return sendError(res, 'Invalid reset token', 401);
      }

      // Check if token email matches request email
      if (decoded.email.toLowerCase() !== email.toLowerCase().trim()) {
        return sendError(res, 'Invalid reset token for this email', 401);
      }
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return sendError(res, 'Reset token has expired. Please request a new password reset.', 401);
      }
      if (error.name === 'JsonWebTokenError') {
        return sendError(res, 'Invalid reset token. Please verify OTP again.', 401);
      }
      throw error;
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      return sendError(res, 'Passwords do not match', 400);
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return sendError(
        res,
        'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
        400
      );
    }

    const user = await User.findOne({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Verify reset OTP is still valid (double check)
    if (!user.resetPasswordToken) {
      return sendError(res, 'Invalid or expired reset session. Please request a new password reset.', 400);
    }

    // Check OTP expiry
    if (!user.resetPasswordExpiry || new Date() > user.resetPasswordExpiry) {
      return sendError(res, 'Reset session has expired. Please request a new password reset.', 400);
    }

    // Update password (will be hashed by beforeUpdate hook)
    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpiry = null;
    user.otpAttempts = 0;
    await user.save();

    return sendSuccess(res, null, 'Password reset successful! You can now login with your new password.');
  } catch (error: any) {
    console.error('Reset password error:', error);

    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map((err: any) => err.message).join('. ');
      return sendError(res, errors || 'Validation failed', 400);
    }

    return sendError(res, 'Password reset failed. Please try again.', 500);
  }
};

/**
 * STEP 9: Google OAuth Callback
 */
export const googleAuthCallback = async (req: AuthRequest, res: Response) => {
  try {
    const { code, redirectUri, flow } = req.body;

    console.info('🎯 Google Auth Callback started', { flow });
    if (!code) {
      console.warn('❌ Google Auth: No code provided');
      return sendError(res, 'Authorization code is required', 400);
    }

    console.info('📡 Exchanging Google code for tokens...');
    // Exchange authorization code for tokens
    const { tokens } = await googleClient.getToken({
      code,
      redirect_uri: redirectUri,
    });

    googleClient.setCredentials(tokens);

    // Verify the ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    console.info('✅ Google Token verified', { email: payload?.email });

    if (!payload || !payload.email) {
      console.warn('❌ Google Auth: Failed to get user info from payload');
      return sendError(res, 'Failed to get user information from Google', 400);
    }

    const { email, name, sub: googleId, picture } = payload;

    // Check if user exists
    let user = await User.findOne({
      where: {
        [Op.or]: [
          { email: email.toLowerCase() },
          { googleId },
        ],
      },
    });

    if (user) {
      // User exists - Login flow

      // Update googleId if not set
      if (!user.googleId) {
        user.googleId = googleId;
        user.emailVerified = true; // Google emails are pre-verified
        await user.save();
      }

      // Check if account is active
      if (!user.isActive) {
        return sendError(res, 'Account has been deactivated. Please contact Admin.', 403);
      }

      // For existing users, still require OTP verification
      const loginOtp = Math.floor(100000 + Math.random() * 900000).toString();
      user.emailOtp = loginOtp;
      user.emailOtpExpiry = getOTPExpiry();
      user.otpAttempts = 0;
      await user.save();

      console.info('📧 Sending OTP email to:', user.email);
      // Send OTP
      await sendOTPEmail(user.email, loginOtp, user.fullName);
      console.info('✅ OTP Email sent successfully');

      // Generate temporary token
      console.info('🔑 Signining temporary JWT...');
      const tempToken = jwt.sign(
        { email: user.email, googleAuth: true },
        process.env.JWT_SECRET as string,
        { expiresIn: '15m' }
      );

      return sendSuccess(res, {
        requiresOtp: true,
        email: user.email,
        tempToken,
      }, 'OTP sent to your email for verification.');

    } else {
      // New user - Registration flow

      // Generate username from email and sanitize it (remove dots, etc. to match validation regex)
      let baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
      // If result is empty (e.g. only symbols), fallback to 'user'
      if (!baseUsername) baseUsername = 'user';
      let username = baseUsername;
      let counter = 1;

      // Ensure unique username
      while (await User.findOne({ where: { username } })) {
        username = `${baseUsername}${counter}`;
        counter++;
      }

      // Create new user
      user = await User.create({
        fullName: name || email.split('@')[0],
        username,
        email: email.toLowerCase(),
        password: Math.random().toString(36).slice(-12) + 'A1!', // Random strong password
        googleId,
        profilePicture: picture,
        emailVerified: true, // Google emails are pre-verified
        isActive: true,
        role: UserRole.USER,
      });

      // Still send OTP for new Google users
      const loginOtp = Math.floor(100000 + Math.random() * 900000).toString();
      user.emailOtp = loginOtp;
      user.emailOtpExpiry = getOTPExpiry();
      user.otpAttempts = 0;
      await user.save();

      console.info('📧 Sending guest OTP email to:', user.email);
      // Send OTP
      await sendOTPEmail(user.email, loginOtp, user.fullName);
      console.info('✅ Guest OTP Email sent successfully');

      // Generate temporary token
      console.info('🔑 Signining temporary guest JWT...');
      const tempToken = jwt.sign(
        { email: user.email, googleAuth: true },
        process.env.JWT_SECRET as string,
        { expiresIn: '15m' }
      );

      return sendSuccess(res, {
        requiresOtp: true,
        email: user.email,
        tempToken,
        isNewUser: true,
      }, 'Account created successfully! Please verify with OTP sent to your email.');
    }
  } catch (error: any) {
    // Log full error details for debugging - using info for visibility
    console.info('❌ Google auth callback error:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
    });
    const errorMessage = error.response?.data?.error_description
      || error.response?.data?.error
      || error.message
      || 'Google authentication failed';
    return sendError(res, errorMessage, 500);
  }
};

/**
 * STEP 10: Google OAuth - Send OTP
 */
export const googleSendOTP = async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Generate new OTP
    const loginOtp = Math.floor(100000 + Math.random() * 900000).toString();
    user.emailOtp = loginOtp;
    user.emailOtpExpiry = getOTPExpiry();
    user.otpAttempts = 0;
    await user.save();

    // Send OTP
    await sendOTPEmail(user.email, loginOtp, user.fullName);

    return sendSuccess(res, null, 'OTP sent successfully to your email.');
  } catch (error) {
    console.error('Google send OTP error:', error);
    return sendError(res, 'Failed to send OTP. Please try again.', 500);
  }
};

/**
 * STEP 11: Google OAuth - Verify OTP
 */
export const googleVerifyOTP = async (req: AuthRequest, res: Response) => {
  try {
    const { otp } = req.body;

    // Get email from temp token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'No token provided', 401);
    }

    const tempToken = authHeader.substring(7);
    const decoded: any = jwt.verify(tempToken, process.env.JWT_SECRET as string);

    if (!decoded.email || !decoded.googleAuth) {
      return sendError(res, 'Invalid token', 401);
    }

    const user = await User.findOne({
      where: { email: decoded.email.toLowerCase() }
    });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Check OTP attempts
    if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
      user.emailOtp = null;
      user.emailOtpExpiry = null;
      await user.save();
      return sendError(
        res,
        'Maximum OTP attempts exceeded. Please try again.',
        429
      );
    }

    // Check OTP expiry
    if (!user.emailOtpExpiry || new Date() > user.emailOtpExpiry) {
      return sendError(res, 'OTP has expired. Please request a new one.', 400);
    }

    // Verify OTP
    if (user.emailOtp !== otp.trim()) {
      user.otpAttempts += 1;
      await user.save();

      const attemptsLeft = MAX_OTP_ATTEMPTS - user.otpAttempts;
      return sendError(
        res,
        `Invalid OTP. ${attemptsLeft} attempt(s) remaining.`,
        400
      );
    }

    // Clear OTP and update last login
    user.emailOtp = null;
    user.emailOtpExpiry = null;
    user.otpAttempts = 0;
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      isVerified: user.emailVerified,
    });

    const userData = {
      id: user.id,
      userId: user.userId,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      emailVerified: user.emailVerified,
      role: user.role,
      profilePicture: user.profilePicture,
    };

    return sendSuccess(
      res,
      { user: userData, token },
      'Login successful!'
    );
  } catch (error: any) {
    console.error('Verify login OTP error:', error);

    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Token has expired. Please try again.', 401);
    }
    if (error.name === 'JsonWebTokenError') {
      return sendError(res, 'Invalid token. Please try again.', 401);
    }

    return sendError(res, 'OTP verification failed. Please try again.', 500);
  }
};

/**
 * Get Current User (Protected Route)
 */
export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.authenticatedUser) {
      return sendError(res, 'User not authenticated', 401);
    }

    const user = await User.findOne({
      where: { id: req.authenticatedUser?.id },
      attributes: {
        exclude: ['password', 'emailOtp', 'resetPasswordToken', 'emailOtpExpiry', 'resetPasswordExpiry', 'otpAttempts']
      },
    });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    return sendSuccess(res, user, 'User retrieved successfully');
  } catch (error) {
    console.error('Get current user error:', error);
    return sendError(res, 'Failed to retrieve user information', 500);
  }
};

/**
 * Update User Profile (Protected Route)
 */
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.authenticatedUser) {
      return sendError(res, 'User not authenticated', 401);
    }

    const { fullName } = req.body;

    if (!fullName || fullName.trim().length === 0) {
      return sendError(res, 'Full name is required', 400);
    }

    if (fullName.trim().length < 2 || fullName.trim().length > 100) {
      return sendError(res, 'Full name must be between 2 and 100 characters', 400);
    }

    const user = await User.findOne({ where: { id: req.authenticatedUser?.userId } });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    user.fullName = fullName.trim();
    await user.save();

    const userData = {
      id: user.id,
      userId: user.userId,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      emailVerified: user.emailVerified,
      role: user.role,
      profilePicture: user.profilePicture,
    };

    return sendSuccess(res, userData, 'Profile updated successfully');
  } catch (error) {
    console.error('Update profile error:', error);
    return sendError(res, 'Failed to update profile', 500);
  }
};

/**
 * Logout (Protected Route)
 */
export const logout = async (req: AuthRequest, res: Response) => {
  try {
    // In a stateless JWT implementation, logout is handled client-side by removing the token.
    // However, if using token blacklisting, we would add the token to a blacklist here.

    // Example with token blacklisting (requires TokenBlacklist model):
    const token = req.token;
    if (token && req.authenticatedUser) {
      const decoded = jwt.decode(token) as any;
      if (decoded && decoded.exp) {
        await TokenBlacklist.create({
          token,
          userId: req.authenticatedUser.id,
          expiresAt: new Date(decoded.exp * 1000)
        });
      }
    }

    return sendSuccess(res, null, 'Logged out successfully');
  } catch (error) {
    console.error('Logout error:', error);
    return sendError(res, 'Logout failed', 500);
  }
};

/**
 * Logout from all devices (Protected Route)
 */
export const logoutAllDevices = async (req: AuthRequest, res: Response) => {
  try {
    // This is complex with stateless JWTs. Usually involves a 'tokenVersion' in User model
    // that is included in the token payload. Incrementing it invalidates all old tokens.

    // For this example, we just send a success message as a placeholder for future implementation
    return sendSuccess(res, null, 'Logged out from all devices successfully');
  } catch (error) {
    console.error('Logout all error:', error);
    return sendError(res, 'Logout failed', 500);
  }
};
