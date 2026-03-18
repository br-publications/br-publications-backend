/**
 * ============================================================
 * AUTH EMAILS
 * ============================================================
 * Covers: OTP Verification, Password Reset, Welcome Email
 * Template Codes: EMAIL_VERIFICATION, PASSWORD_RESET, WELCOME_EMAIL
 */
import templateService from '../../services/templateService';
import { CommunicationType } from '../../models/communicationTemplate';
import { sendEmail, FRONTEND_URL, EmailCategory } from './base';

/**
 * OTP email for new account verification or email change
 * Trigger: User registers or updates email
 * Template Code: EMAIL_VERIFICATION
 * Variables: {{name}}, {{otp}}
 */
export const sendOTPEmail = async (
  email: string,
  otp: string,
  name: string
): Promise<void> => {
  let subject = 'Email Verification - BR Publications';
  let html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Email Verification</h2>
          <p>Hello ${name},</p>
          <p>Your verification code is:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px;">
            ${otp}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <br>
          <p>Best regards,<br>BR Publications Team</p>
        </div>`;

  const template = await templateService.getTemplate('EMAIL_VERIFICATION', CommunicationType.EMAIL, { name, otp });
  if (template) { subject = template.subject; html = template.content; }

  await sendEmail(email, subject, html, undefined, EmailCategory.GENERAL, true);
};

/**
 * Email Update OTP
 * Trigger: User changes email in profile edit
 * Template Code: PROFILE_EMAIL_UPDATE
 * Variables: {{name}}, {{otp}}
 */
export const sendProfileEmailUpdateOTP = async (
  email: string,
  otp: string,
  name: string
): Promise<void> => {
  let subject = 'Email Update Verification - BR Publications';
  let html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Email Update Verification</h2>
          <p>Hello ${name},</p>
          <p>You requested to update your email address. Your verification code is:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px;">
            ${otp}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this change, please contact support immediately.</p>
          <br>
          <p>Best regards,<br>BR Publications Team</p>
        </div>`;

  const template = await templateService.getTemplate('PROFILE_EMAIL_UPDATE', CommunicationType.EMAIL, { name, otp });
  if (template) { subject = template.subject; html = template.content; }

  await sendEmail(email, subject, html, undefined, EmailCategory.GENERAL, true);
};

/**
 * Password reset OTP
 * Trigger: User clicks "Forgot Password"
 * Template Code: PASSWORD_RESET
 * Variables: {{name}}, {{otp}}
 */
export const sendPasswordResetEmail = async (
  email: string,
  otp: string,
  name: string
): Promise<void> => {
  let subject = 'Password Reset Request - BR Publications';
  let html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Hello ${name},</p>
          <p>You requested to reset your password. Your verification code is:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px;">
            ${otp}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <br>
          <p>Best regards,<br>BR Publications Team</p>
        </div>`;

  const template = await templateService.getTemplate('PASSWORD_RESET', CommunicationType.EMAIL, { name, otp });
  if (template) { subject = template.subject; html = template.content; }

  await sendEmail(email, subject, html, undefined, EmailCategory.GENERAL, true);
};

/**
 * Welcome email for newly created users
 * Trigger: Admin creates a new user account
 * Template Code: WELCOME_EMAIL
 * Variables: {{name}}, {{role}}, {{frontendUrl}}
 */
export const sendWelcomeEmail = async (
  email: string,
  name: string,
  role: string
): Promise<void> => {
  let subject = 'Welcome to BR Publications';
  let html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome ${name}!</h2>
          <p>Thank you for joining BR Publications as a <strong>${role}</strong>.</p>
          <p>You can log in using your registered email and password.</p>
          <br>
          <p>Best regards,<br>BR Publications Team</p>
        </div>`;

  const template = await templateService.getTemplate('WELCOME_EMAIL', CommunicationType.EMAIL, {
    name, role, frontendUrl: FRONTEND_URL
  });
  if (template) { subject = template.subject; html = template.content; }

  await sendEmail(email, subject, html, undefined, EmailCategory.GENERAL);
};
