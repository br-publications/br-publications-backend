import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/responseHandler';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernameRegex = /^[a-zA-Z0-9_]{3,50}$/;

export const validateRegistration = (req: Request, res: Response, next: NextFunction) => {
  const { fullName, username, email, password, confirmPassword } = req.body;
  const errors: any = {};

  // Full Name validation
  if (!fullName || fullName.trim().length === 0) {
    errors.fullName = 'Full name is required';
  } else if (fullName.trim().length < 2 || fullName.trim().length > 100) {
    errors.fullName = 'Full name must be between 2 and 100 characters';
  }

  // Username validation
  if (!username || username.trim().length === 0) {
    errors.username = 'Username is required';
  } else if (!usernameRegex.test(username)) {
    errors.username = 'Username must be 3-50 characters and can only contain letters, numbers, and underscores';
  }

  // Email validation
  if (!email || email.trim().length === 0) {
    errors.email = 'Email is required';
  } else if (!emailRegex.test(email)) {
    errors.email = 'Please provide a valid email address';
  }

  // Password validation
  if (!password || password.length === 0) {
    errors.password = 'Password is required';
  } else if (!passwordRegex.test(password)) {
    errors.password = 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)';
  }

  // Confirm Password validation
  if (!confirmPassword || confirmPassword.length === 0) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (Object.keys(errors).length > 0) {
    return sendError(res, 'Validation failed', 400, errors);
  }

  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const { usernameOrEmail, password } = req.body;
  const errors: any = {};

  if (!usernameOrEmail || usernameOrEmail.trim().length === 0) {
    errors.usernameOrEmail = 'Username or email is required';
  }

  if (!password || password.length === 0) {
    errors.password = 'Password is required';
  }

  if (Object.keys(errors).length > 0) {
    return sendError(res, 'Validation failed', 400, errors);
  }

  next();
};

export const validateOTP = (req: Request, res: Response, next: NextFunction) => {
  const { otp } = req.body;
  const errors: any = {};

  if (!otp || otp.trim().length === 0) {
    errors.otp = 'OTP is required';
  } else if (!/^\d{6}$/.test(otp)) {
    errors.otp = 'OTP must be a 6-digit number';
  }

  if (Object.keys(errors).length > 0) {
    return sendError(res, 'Validation failed', 400, errors);
  }

  next();
};

export const validatePasswordReset = (req: Request, res: Response, next: NextFunction) => {
  const { newPassword, confirmPassword } = req.body;
  const errors: any = {};

  if (!newPassword || newPassword.length === 0) {
    errors.newPassword = 'New password is required';
  } else if (!passwordRegex.test(newPassword)) {
    errors.newPassword = 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)';
  }

  if (!confirmPassword || confirmPassword.length === 0) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (newPassword !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (Object.keys(errors).length > 0) {
    return sendError(res, 'Validation failed', 400, errors);
  }

  next();
};

export const validateForgotPassword = (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;
  const errors: any = {};

  if (!email || email.trim().length === 0) {
    errors.email = 'Email is required';
  } else if (!emailRegex.test(email)) {
    errors.email = 'Please provide a valid email address';
  }

  if (Object.keys(errors).length > 0) {
    return sendError(res, 'Validation failed', 400, errors);
  }

  next();
};
