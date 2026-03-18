/**
 * ============================================================
 * USER / MANUAL COMMUNICATION EMAILS
 * ============================================================
 * Covers: Direct manual emails sent by Admin or Editor to any user
 *
 * Template Codes:
 *   MANUAL_EMAIL_TO_USER   → sendManualEmailToUser  (Admin → Any User / Reviewer)
 */

import { sendEmail, EmailCategory } from './base';

// ─────────────────────────────────────────────
// MANUAL EMAIL — Admin or Editor → Any User
// ─────────────────────────────────────────────
/**
 * Trigger: Admin clicks "Email User" or Editor clicks "Email Reviewer" in the dashboard
 * Template: No DB template (user freely enters subject + message body)
 * Note: The sender's name and email are shown in the email body so the recipient can reply.
 */
export const sendManualEmailToUser = async (
    recipientEmail: string,
    recipientName: string,
    data: {
        senderName: string;
        senderEmail: string;
        subject: string;
        message: string;
    }
): Promise<void> => {
    const subject = `Message from BR Publications: ${data.subject}`;
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Hello ${recipientName},</h2>
      <p>You have received a message from <strong>${data.senderName}</strong> (<a href="mailto:${data.senderEmail}">${data.senderEmail}</a>):</p>
      <div style="background: #f9f9f9; border-left: 4px solid #2196F3; padding: 20px; margin: 20px 0;">
        <h3 style="margin-top: 0;">${data.subject}</h3>
        <p style="white-space: pre-wrap;">${data.message}</p>
      </div>
      <p style="color: #666; font-size: 14px;">You can reply directly to this email or contact <a href="mailto:${data.senderEmail}">${data.senderEmail}</a>.</p>
      <p style="color: #666; font-size: 14px;">BR Publications Team</p>
    </div>`;

    await sendEmail(recipientEmail, subject, html, undefined, EmailCategory.GENERAL);
};
