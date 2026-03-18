/**
 * ============================================================
 * emailService.ts — BACKWARD COMPATIBILITY SHIM
 * ============================================================
 * This file re-exports all email functions from the new
 * domain-specific modules in src/utils/emails/.
 *
 * Existing controllers that import from '../utils/emailService'
 * will continue to work without any changes.
 *
 * For new features: import directly from '../utils/emails'
 * or from the specific domain file you need.
 *
 * ⚠️ NEW CODE should NOT add functions here.
 *    Add them to the relevant domain file in:
 *    src/utils/emails/
 * ============================================================
 */

// ─── Imports for the default export object ───────────────────
import { sendEmail, transporter, FRONTEND_URL } from './emails/base';
import { sendOTPEmail, sendPasswordResetEmail, sendWelcomeEmail, sendProfileEmailUpdateOTP } from './emails/authEmails';
import { sendManualEmailToUser } from './emails/userEmails';
import {
  sendBookChapterSubmissionReceivedEmail,
  sendBookChapterSubmissionAdminEmail,
  sendBookChapterEditorAssignedEmail,
  sendBookChapterReviewerAssignedEmail,
  sendBookChapterRevisionRequestedEmail,
  sendBookChapterRevisionSubmittedEmail,
  sendBookChapterDecisionEmail,
  sendBookChapterStatusChangedEmail,
  sendBookChapterDeadlineReminderEmail,
  sendBookChapterCommentEmail,
  sendBookChapterPublishedEmail,
  sendBookChapterPeerReviewCompletedEditorEmail,
} from './emails/bookChapterEmails';
import {
  sendTextBookSubmissionReceivedEmail,
  sendTextBookSubmissionAdminEmail,
  sendTextBookProposalDecisionEmail,
  sendTextBookRevisionRequestedEmail,
  sendTextBookRevisionSubmittedEmail,
  sendTextBookDecisionEmail,
  sendTextBookStatusChangedEmail,
  sendTextBookBulkUploadReportEmail,
  sendTextBookCommentEmail,
  sendDeliveryDetailsRequestEmail,
  sendTextBookPublishedEmail,
} from './emails/textBookEmails';
import {
  sendRecruitmentApplicationAdminEmail,
  sendRecruitmentSubmissionReceivedEmail,
  sendRecruitmentDecisionEmail,
} from './emails/recruitmentEmails';
import {
  sendProjectApplicationAdminEmail,
  sendProjectSubmissionReceivedEmail,
  sendProjectDecisionEmail,
} from './emails/projectEmails';

// ─── Named re-exports (for import { ... } from '../utils/emailService') ──
export { sendEmail, transporter, FRONTEND_URL } from './emails/base';
export { sendOTPEmail, sendPasswordResetEmail, sendWelcomeEmail, sendProfileEmailUpdateOTP } from './emails/authEmails';
export { sendManualEmailToUser } from './emails/userEmails';
export {
  sendBookChapterSubmissionReceivedEmail,
  sendBookChapterSubmissionAdminEmail,
  sendBookChapterEditorAssignedEmail,
  sendBookChapterReviewerAssignedEmail,
  sendBookChapterRevisionRequestedEmail,
  sendBookChapterRevisionSubmittedEmail,
  sendBookChapterDecisionEmail,
  sendBookChapterStatusChangedEmail,
  sendBookChapterDeadlineReminderEmail,
  sendBookChapterCommentEmail,
  sendBookChapterPublishedEmail,
  sendBookChapterPeerReviewCompletedEditorEmail,
} from './emails/bookChapterEmails';
export {
  sendTextBookSubmissionReceivedEmail,
  sendTextBookSubmissionAdminEmail,
  sendTextBookProposalDecisionEmail,
  sendTextBookRevisionRequestedEmail,
  sendTextBookRevisionSubmittedEmail,
  sendTextBookDecisionEmail,
  sendTextBookStatusChangedEmail,
  sendTextBookBulkUploadReportEmail,
  sendTextBookCommentEmail,
  sendDeliveryDetailsRequestEmail,
  sendTextBookPublishedEmail,
} from './emails/textBookEmails';
export {
  sendRecruitmentApplicationAdminEmail,
  sendRecruitmentSubmissionReceivedEmail,
  sendRecruitmentDecisionEmail,
} from './emails/recruitmentEmails';
export {
  sendProjectApplicationAdminEmail,
  sendProjectSubmissionReceivedEmail,
  sendProjectDecisionEmail,
} from './emails/projectEmails';

// ─── LEGACY ALIASES (@deprecated — map old names to new typed functions) ─
/** @deprecated Use sendTextBookSubmissionAdminEmail */
export const sendSubmissionNotificationEmail = sendTextBookSubmissionAdminEmail;
/** @deprecated Use sendTextBookSubmissionReceivedEmail */
export const sendSubmissionConfirmationEmail = sendTextBookSubmissionReceivedEmail;
/** @deprecated Use sendTextBookRevisionRequestedEmail */
export const sendRevisionRequestEmail = sendTextBookRevisionRequestedEmail;
/** @deprecated Use sendTextBookRevisionSubmittedEmail */
export const sendRevisionSubmittedEmail = sendTextBookRevisionSubmittedEmail;
/** @deprecated Use sendTextBookDecisionEmail */
export const sendDecisionNotificationEmail = sendTextBookDecisionEmail;
/** @deprecated Use sendTextBookStatusChangedEmail */
export const sendStatusChangeEmail = sendTextBookStatusChangedEmail;
/** @deprecated Use sendTextBookBulkUploadReportEmail */
export const sendBulkUploadReportEmail = sendTextBookBulkUploadReportEmail;
/** @deprecated Use sendBookChapterCommentEmail */
export const sendCommentNotificationEmail = sendBookChapterCommentEmail;
/** @deprecated Use sendRecruitmentApplicationAdminEmail */
export const sendRecruitmentApplicationEmail = sendRecruitmentApplicationAdminEmail;
/** @deprecated Use sendRecruitmentSubmissionReceivedEmail */
export const sendRecruitmentSubmissionConfirmationEmail = sendRecruitmentSubmissionReceivedEmail;
/** @deprecated Use sendProjectApplicationAdminEmail */
export const sendProjectApplicationEmail = sendProjectApplicationAdminEmail;
/** @deprecated Use sendProjectSubmissionReceivedEmail */
export const sendProjectSubmissionConfirmationEmail = sendProjectSubmissionReceivedEmail;

// ─── DUMMY EMAIL FALLBACK (@deprecated) ──────────────────────────────────
/**
 * @deprecated Replace with a specific typed domain email function.
 * Generic fallback email used in older controllers.
 */
export const sendDummyEmail = async (params: {
  to: string;
  subject: string;
  template: string;
  data: any;
}): Promise<void> => {
  let html = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">`;
  html += `<h2>${params.subject}</h2>`;
  html += `<div style="background: #f9f9f9; padding: 20px; border-left: 4px solid #1e5292;"><ul style="list-style: none; padding: 0;">`;
  for (const [key, value] of Object.entries(params.data)) {
    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    html += `<li style="margin-bottom:10px;"><strong>${label}:</strong> ${value}</li>`;
  }
  html += `</ul></div>`;
  if (params.data.reviewLink) {
    html += `<p><a href="${params.data.reviewLink}" style="background:#1e5292;color:white;padding:12px 24px;text-decoration:none;border-radius:4px;display:inline-block;">View Details</a></p>`;
  }
  html += `<p style="color:#666;font-size:14px;margin-top:20px;">This is an automated notification from BR Publications.</p></div>`;
  try {
    await sendEmail(params.to, params.subject, html);
  } catch (error) {
    console.error(`❌ Failed to send dummy email to ${params.to}:`, error);
  }
};

// ─── DEFAULT EXPORT (for import emailService from '../utils/emailService') ─
export default {
  sendEmail,
  sendOTPEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendProfileEmailUpdateOTP,
  sendManualEmailToUser,
  // New typed names
  sendBookChapterPublishedEmail,
  sendBookChapterPeerReviewCompletedEditorEmail,
  sendBookChapterRevisionRequestedEmail,
  sendTextBookRevisionRequestedEmail,
  sendDeliveryDetailsRequestEmail,
  sendTextBookPublishedEmail,
  sendRecruitmentDecisionEmail,
  sendProjectDecisionEmail,
  // Legacy names
  sendSubmissionNotificationEmail: sendTextBookSubmissionAdminEmail,
  sendSubmissionConfirmationEmail: sendTextBookSubmissionReceivedEmail,
  sendRevisionRequestEmail: sendTextBookRevisionRequestedEmail,
  sendRevisionSubmittedEmail: sendTextBookRevisionSubmittedEmail,
  sendDecisionNotificationEmail: sendTextBookDecisionEmail,
  sendStatusChangeEmail: sendTextBookStatusChangedEmail,
  sendBulkUploadReportEmail: sendTextBookBulkUploadReportEmail,
  sendCommentNotificationEmail: sendBookChapterCommentEmail,
  sendRecruitmentApplicationEmail: sendRecruitmentApplicationAdminEmail,
  sendRecruitmentSubmissionConfirmationEmail: sendRecruitmentSubmissionReceivedEmail,
  sendProjectApplicationEmail: sendProjectApplicationAdminEmail,
  sendProjectSubmissionConfirmationEmail: sendProjectSubmissionReceivedEmail,
  sendDummyEmail,
};
