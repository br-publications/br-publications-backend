/**
 * ============================================================
 * rateLimiter.ts — Centralized Rate Limiting Configuration
 * ============================================================
 * Uses express-rate-limit to protect against:
 *  - Brute-force login attacks
 *  - OTP enumeration
 *  - Credential stuffing
 *  - Denial of service via repeated requests
 * ============================================================
 */

import rateLimit from 'express-rate-limit';

/** General API limiter — applies to all API routes */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,                  // max 1000 requests per window per IP (increased from 200)
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});

/** Strict limiter for login endpoint */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                   // max 100 login attempts per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please wait 15 minutes before trying again.',
  },
  skipSuccessfulRequests: true, // don't count successful logins
});

/** OTP send limiter — prevents OTP flooding */
export const otpSendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 100,                    // max 100 OTP sends per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many OTP requests. Please wait before requesting another.',
  },
});

/** OTP verification limiter */
export const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                   // max 100 OTP verifications per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many verification attempts. Please wait before trying again.',
  },
});

/** Registration limiter — prevents bulk account creation */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100,                    // max 100 registrations per hour per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many registration attempts. Please try again later.',
  },
  skipSuccessfulRequests: false,
});

/** Password reset limiter */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100,                    // max 100 password reset requests per hour per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many password reset attempts. Please try again in an hour.',
  },
});

/** Contact/public form limiter */
export const contactFormLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100,                   // max 100 inquiry submissions per hour per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many submissions. Please try again later.',
  },
});
