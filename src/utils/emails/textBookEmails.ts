/**
 * ============================================================
 * TEXT BOOK SUBMISSION EMAILS
 * ============================================================
 * Covers the full textbook submission lifecycle:
 *   - Submission received (author + admin notifications)
 *   - Proposal decision (accept / reject)
 *   - Revision requested (with optional admin message)
 *   - Revision submitted (author notifies admin)
 *   - Final submission decision (approved / rejected)
 *   - Status changed (generic update)
 *   - Bulk upload report (admin only)
 *   - Discussion / comment notification
 *
 * Template Codes:
 *   TEXTBOOK_SUBMISSION_RECEIVED    → sendTextBookSubmissionReceivedEmail    (to Author)
 *   TEXTBOOK_SUBMISSION_ADMIN       → sendTextBookSubmissionAdminEmail       (to Admin)
 *   TEXTBOOK_PROPOSAL_DECISION      → sendTextBookProposalDecisionEmail      (to Author)
 *   TEXTBOOK_REVISION_REQUESTED     → sendTextBookRevisionRequestedEmail     (to Author)
 *   TEXTBOOK_REVISION_SUBMITTED     → sendTextBookRevisionSubmittedEmail     (to Admin)
 *   TEXTBOOK_DECISION               → sendTextBookDecisionEmail              (to Author)
 *   TEXTBOOK_STATUS_CHANGED         → sendTextBookStatusChangedEmail         (to Author)
 *   TEXTBOOK_BULK_UPLOAD_REPORT     → sendTextBookBulkUploadReportEmail      (to Admin)
 *   TEXTBOOK_COMMENT                → sendTextBookCommentEmail               (to participant)
 */

import templateService from '../../services/templateService';
import { CommunicationType } from '../../models/communicationTemplate';
import { sendEmail, FRONTEND_URL, EmailCategory } from './base';

// ─────────────────────────────────────────────
// SUBMISSION RECEIVED — sent to Author
// ─────────────────────────────────────────────
/**
 * Trigger: Author submits a new Textbook
 * Template: TEXTBOOK_SUBMISSION_RECEIVED
 * Variables: {{name}}, {{bookTitle}}, {{submissionDate}}, {{submissionId}}, {{frontendUrl}}
 */
export const sendTextBookSubmissionReceivedEmail = async (
  email: string,
  name: string,
  data: {
    bookTitle: string;
    submissionId: number;
    submissionDate: Date;
  }
): Promise<void> => {
  let subject = `Submission Received: ${data.bookTitle}`;
  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;">
                    <tr>
                        <td style="background:linear-gradient(135deg,#1e3a6e,#2563eb);padding:36px 40px;text-align:center;">
                            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">BR Publications</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="background:#ecfdf5;border-bottom:3px solid #10b981;padding:16px 40px;text-align:center;">
                            <p style="margin:0;color:#047857;font-size:15px;font-weight:600;">✅ Submission Received</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:36px 40px;">
                            <p style="margin:0 0 18px;color:#374151;font-size:15px;">Hello <strong>${name}</strong>,</p>
                            <p style="margin:0 0 20px;color:#6b7280;font-size:14px;line-height:1.6;">Your textbook submission has been successfully received.</p>
                            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
                                <tr>
                                    <td style="padding:24px">
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding:10px 0;">
                                                    <span style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Book Title</span><br />
                                                    <span style="color:#111827;font-size:15px;font-weight:600;">${data.bookTitle}</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            <div style="text-align:center;">
                                <a href="${FRONTEND_URL}dashboard" style="background:#2563eb;color:#ffffff;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:600;display:inline-block;">View Submission</a>
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

  const template = await templateService.getTemplate('TEXTBOOK_SUBMISSION_RECEIVED', CommunicationType.EMAIL, {
    name, bookTitle: data.bookTitle,
    submissionDate: new Date(data.submissionDate).toLocaleDateString(),
    submissionId: data.submissionId, frontendUrl: FRONTEND_URL
  });
  if (template) { subject = template.subject; html = template.content; }

  await sendEmail(email, subject, html, undefined, EmailCategory.TEXTBOOK);
};

// ─────────────────────────────────────────────
// SUBMISSION NOTIFICATION — sent to Admin
// ─────────────────────────────────────────────
/**
 * Trigger: Author submits a new Textbook
 * Template: TEXTBOOK_SUBMISSION_ADMIN
 * Variables: {{adminName}}, {{authorName}}, {{bookTitle}}, {{submissionDate}}, {{frontendUrl}}
 */
export const sendTextBookSubmissionAdminEmail = async (
  email: string,
  adminName: string,
  data: {
    authorName: string;
    bookTitle: string;
    submissionDate: Date;
    submissionId: number;
  }
): Promise<void> => {
  let subject = `New Textbook Submission: ${data.bookTitle}`;
  let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Hello ${adminName},</h2>
      <p>A new textbook submission has been received.</p>
      <div style="background: #f9f9f9; border-left: 4px solid #2196F3; padding: 20px; margin: 20px 0;">
        <h3 style="margin-top: 0;">${data.bookTitle}</h3>
        <p><strong>Author:</strong> ${data.authorName}</p>
        <p><strong>Date:</strong> ${new Date(data.submissionDate).toLocaleDateString()}</p>
      </div>
      <p><a href="${FRONTEND_URL}dashboard/admin" style="background: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Submission</a></p>
      <p style="color: #666; font-size: 14px;">This is an automated notification from BR Publications.</p>
    </div>`;

  const template = await templateService.getTemplate('TEXTBOOK_SUBMISSION_ADMIN', CommunicationType.EMAIL, {
    adminName, authorName: data.authorName, bookTitle: data.bookTitle,
    submissionDate: new Date(data.submissionDate).toLocaleDateString(),
    frontendUrl: FRONTEND_URL, submissionId: data.submissionId
  });
  if (template) { subject = template.subject; html = template.content; }

  await sendEmail(email, subject, html, undefined, EmailCategory.TEXTBOOK);
};

// ─────────────────────────────────────────────
// PROPOSAL DECISION — sent to Author
// ─────────────────────────────────────────────
/**
 * Trigger: Admin accepts or rejects the initial proposal
 * Template: TEXTBOOK_PROPOSAL_DECISION
 * Variables: {{name}}, {{bookTitle}}, {{decision}}, {{adminName}}, {{adminNotes}}, {{frontendUrl}}
 */
export const sendTextBookProposalDecisionEmail = async (
  email: string,
  name: string,
  data: {
    bookTitle: string;
    decision: 'ACCEPTED' | 'REJECTED';
    adminName: string;
    adminNotes?: string;     // Optional note from admin during proposal decision
    submissionId: number;
  }
): Promise<void> => {
  const approved = data.decision === 'ACCEPTED';
  const color = approved ? '#4CAF50' : '#f44336';
  const code = approved ? 'TEXTBOOK_PROPOSAL_ACCEPTED' : 'TEXTBOOK_PROPOSAL_REJECTED';

  let subject = `Proposal ${approved ? 'Accepted' : 'Rejected'}: ${data.bookTitle}`;
  let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Hello ${name},</h2>
      <p style="font-size: 18px;">${approved ? '🎉 Your proposal has been accepted!' : '❌ Update on your proposal'}</p>
      <div style="background: #f9f9f9; border-left: 4px solid ${color}; padding: 20px; margin: 20px 0;">
        <h3 style="margin-top: 0;">${data.bookTitle}</h3>
        <p><strong>Decision:</strong> ${data.decision}</p>
        <p><strong>By:</strong> ${data.adminName}</p>
        ${data.adminNotes ? `<div style="background: #fff; padding: 15px; margin-top: 15px; border: 1px solid #ddd;"><strong>Notes:</strong><p style="white-space: pre-wrap;">${data.adminNotes}</p></div>` : ''}
      </div>
      <p>${approved ? 'You may now proceed to submit the full manuscript.' : 'We appreciate your submission and encourage you to apply again.'}</p>
      <p><a href="${FRONTEND_URL}dashboard" style="background: ${color}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Submission</a></p>
      <p style="color: #666; font-size: 14px;">This is an automated notification from BR Publications.</p>
    </div>`;

  const template = await templateService.getTemplate(code, CommunicationType.EMAIL, {
    name, bookTitle: data.bookTitle, decision: data.decision,
    adminName: data.adminName, adminNotes: data.adminNotes || '',
    frontendUrl: FRONTEND_URL
  });
  if (template) { subject = template.subject; html = template.content; }

  await sendEmail(email, subject, html, undefined, EmailCategory.TEXTBOOK);
};

// ─────────────────────────────────────────────
// REVISION REQUESTED — sent to Author
// ─────────────────────────────────────────────
/**
 * Trigger: Admin requests a revision from the author
 * Template: TEXTBOOK_REVISION_REQUESTED
 * Variables: {{name}}, {{bookTitle}}, {{adminName}}, {{comments}}, {{adminMessage}}, {{revisionNumber}}, {{frontendUrl}}
 */
export const sendTextBookRevisionRequestedEmail = async (
  email: string,
  name: string,
  data: {
    bookTitle: string;
    adminName: string;
    comments: string;
    adminMessage?: string | null;   // Optional extra note from admin
    revisionNumber: number;
    submissionId: number;
  }
): Promise<void> => {
  const adminMessageHtml = data.adminMessage
    ? `<div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; margin-top: 10px;">
            <strong>Additional Notes:</strong>
            <p style="white-space: pre-wrap; margin-top: 5px;">${data.adminMessage}</p>
           </div>`
    : '';

  let subject = `Revision ${data.revisionNumber} Requested: ${data.bookTitle}`;
  let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Hello ${name},</h2>
      <p>A revision has been requested for your textbook submission.</p>
      <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0;">
        <h3 style="margin-top: 0;">${data.bookTitle}</h3>
        <p><strong>Requested by:</strong> ${data.adminName}</p>
        <p><strong>Revision #:</strong> ${data.revisionNumber}</p>
        <div style="margin-top: 15px;"><strong>Comments:</strong><p style="white-space: pre-wrap;">${data.comments}</p></div>
        ${adminMessageHtml}
      </div>
      <p><a href="${FRONTEND_URL}dashboard" style="background: #ffc107; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Submit Revision</a></p>
      <p style="color: #666; font-size: 14px;">This is an automated notification from BR Publications.</p>
    </div>`;

  const template = await templateService.getTemplate('TEXTBOOK_REVISION_REQUESTED', CommunicationType.EMAIL, {
    name, bookTitle: data.bookTitle, adminName: data.adminName,
    comments: data.comments, adminMessage: data.adminMessage || '',
    revisionNumber: data.revisionNumber, frontendUrl: FRONTEND_URL
  });
  if (template) { subject = template.subject; html = template.content; }

  await sendEmail(email, subject, html, undefined, EmailCategory.TEXTBOOK);
};

// ─────────────────────────────────────────────
// REVISION SUBMITTED — sent to Admin
// ─────────────────────────────────────────────
/**
 * Trigger: Author submits back a revised textbook manuscript
 * Template: TEXTBOOK_REVISION_SUBMITTED
 * Variables: {{name}}, {{authorName}}, {{bookTitle}}, {{revisionNumber}}, {{authorMessage}}, {{frontendUrl}}
 */
export const sendTextBookRevisionSubmittedEmail = async (
  email: string,
  name: string,
  data: {
    authorName: string;
    bookTitle: string;
    revisionNumber: number;
    authorMessage?: string;     // Optional note submitted with revision
    submissionId: number;
  }
): Promise<void> => {
  const authorMessageHtml = data.authorMessage
    ? `<div style="margin-top: 15px; padding: 15px; background: #fff; border: 1px solid #ddd;">
            <strong>Author Message:</strong>
            <p style="white-space: pre-wrap; margin-top: 5px;">${data.authorMessage}</p>
           </div>`
    : '';

  let subject = `Revision ${data.revisionNumber} Submitted: ${data.bookTitle}`;
  let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Hello ${name},</h2>
      <p>A revision has been submitted by the author.</p>
      <div style="background: #f9f9f9; border-left: 4px solid #2196F3; padding: 20px; margin: 20px 0;">
        <h3 style="margin-top: 0;">${data.bookTitle}</h3>
        <p><strong>Author:</strong> ${data.authorName}</p>
        <p><strong>Revision #:</strong> ${data.revisionNumber}</p>
        <p><strong>Submitted:</strong> ${new Date().toLocaleDateString()}</p>
        ${authorMessageHtml}
      </div>
      <p><a href="${FRONTEND_URL}dashboard/admin" style="background: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Review Revision</a></p>
      <p style="color: #666; font-size: 14px;">This is an automated notification from BR Publications.</p>
    </div>`;

  const template = await templateService.getTemplate('TEXTBOOK_REVISION_SUBMITTED', CommunicationType.EMAIL, {
    name, authorName: data.authorName, bookTitle: data.bookTitle,
    revisionNumber: data.revisionNumber, authorMessage: data.authorMessage || '',
    frontendUrl: FRONTEND_URL
  });
  if (template) { subject = template.subject; html = template.content; }

  await sendEmail(email, subject, html, undefined, EmailCategory.TEXTBOOK);
};

// ─────────────────────────────────────────────
// FINAL DECISION — sent to Author
// ─────────────────────────────────────────────
/**
 * Trigger: Admin makes a final Accept or Reject decision on full submission
 * Template: TEXTBOOK_DECISION_APPROVED or TEXTBOOK_DECISION_REJECTED
 * Variables: {{name}}, {{bookTitle}}, {{decision}}, {{adminName}}, {{adminNotes}}, {{frontendUrl}}
 */
export const sendTextBookDecisionEmail = async (
  email: string,
  name: string,
  data: {
    bookTitle: string;
    decision: 'APPROVED' | 'REJECTED';
    adminName: string;
    adminNotes?: string;         // Optional note from admin during final decision
    submissionId: number;
  }
): Promise<void> => {
  const approved = data.decision === 'APPROVED';
  const color = approved ? '#4CAF50' : '#f44336';
  const code = approved ? 'TEXTBOOK_DECISION_APPROVED' : 'TEXTBOOK_DECISION_REJECTED';

  let subject = `Submission ${approved ? 'Approved' : 'Rejected'}: ${data.bookTitle}`;
  let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Hello ${name},</h2>
      <p style="font-size: 18px;">${approved ? '🎉 Your textbook has been approved!' : '❌ Submission decision'}</p>
      <div style="background: #f9f9f9; border-left: 4px solid ${color}; padding: 20px; margin: 20px 0;">
        <h3 style="margin-top: 0;">${data.bookTitle}</h3>
        <p><strong>Decision:</strong> ${data.decision}</p>
        <p><strong>By:</strong> ${data.adminName}</p>
        ${data.adminNotes ? `<div style="background: #fff; padding: 15px; margin-top: 15px; border: 1px solid #ddd;"><strong>Notes:</strong><p style="white-space: pre-wrap;">${data.adminNotes}</p></div>` : ''}
      </div>
      <p><a href="${FRONTEND_URL}dashboard" style="background: ${color}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Details</a></p>
      <p style="color: #666; font-size: 14px;">This is an automated notification from BR Publications.</p>
    </div>`;

  const template = await templateService.getTemplate(code, CommunicationType.EMAIL, {
    name, bookTitle: data.bookTitle, decision: data.decision,
    adminName: data.adminName, adminNotes: data.adminNotes || '',
    frontendUrl: FRONTEND_URL
  });
  if (template) { subject = template.subject; html = template.content; }

  await sendEmail(email, subject, html, undefined, EmailCategory.TEXTBOOK);
};

// ─────────────────────────────────────────────
// STATUS CHANGED — general update to Author
// ─────────────────────────────────────────────
/**
 * Trigger: Any generic status change on a Textbook submission
 * Template: TEXTBOOK_STATUS_CHANGED
 * Variables: {{name}}, {{bookTitle}}, {{previousStatus}}, {{newStatus}}, {{changedBy}}, {{adminMessage}}, {{frontendUrl}}
 */
export const sendTextBookStatusChangedEmail = async (
  email: string,
  name: string,
  data: {
    bookTitle: string;
    previousStatus: string;
    newStatus: string;
    changedBy: string;
    adminMessage?: string;
    submissionId: number;
  }
): Promise<void> => {
  const noteHtml = data.adminMessage
    ? `<div style="margin-top:24px;">
        <p style="margin:0 0 8px;color:#374151;font-size:13px;font-weight:600;text-transform:uppercase;">Reason / Editorial Notes</p>
        <div style="background:#eff6ff;border:1px solid #2563eb;border-radius:8px;padding:18px;">
            <p style="margin:0;color:#1d4ed8;font-size:14px;line-height:1.6;white-space:pre-wrap;">${data.adminMessage}</p>
        </div>
       </div>`
    : '';

  let subject = `Status Update: ${data.bookTitle}`;
  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Status Update</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0"
                    style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;">
                    <!-- Header -->
                    <tr>
                        <td style="background:linear-gradient(135deg,#1e3a6e,#2563eb);padding:36px 40px;text-align:center;">
                            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">BR Publications</h1>
                            <p style="margin:8px 0 0;color:#bfdbfe;font-size:14px;">Submission Status Update</p>
                        </td>
                    </tr>
                    <!-- Banner -->
                    <tr>
                        <td style="background:#eff6ff;border-bottom:3px solid #2563eb;padding:16px 40px;text-align:center;">
                            <p style="margin:0;color:#1d4ed8;font-size:15px;font-weight:600;">
                                🔔 Status Update for Your Textbook Submission
                            </p>
                        </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                        <td style="padding:36px 40px;">
                            <p style="margin:0 0 18px;color:#374151;font-size:15px;">
                                Hello <strong>${name}</strong>,
                            </p>
                            <p style="margin:0 0 20px;color:#6b7280;font-size:14px;line-height:1.6;">
                                The status of your textbook submission titled <strong>${data.bookTitle}</strong> has been updated.
                            </p>
                            <p style="margin:0 0 28px;color:#6b7280;font-size:14px;line-height:1.6;">
                                This change was made by <strong>${data.changedBy}</strong>. Please review the updated status below.
                            </p>
                            <!-- Status Card -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;">
                                <tr>
                                    <td style="padding:24px">
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
                                                    <span style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Textbook Title</span><br />
                                                    <span style="color:#111827;font-size:15px;">${data.bookTitle}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
                                                    <span style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Previous Status</span><br />
                                                    <span style="color:#ef4444;font-size:15px;font-weight:600;">${data.previousStatus.replace(/_/g, ' ')}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
                                                    <span style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">New Status</span><br />
                                                    <span style="color:#10b981;font-size:15px;font-weight:600;">${data.newStatus.replace(/_/g, ' ')}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding:10px 0;">
                                                    <span style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Updated By</span><br />
                                                    <span style="color:#111827;font-size:15px;">${data.changedBy}</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            ${noteHtml}
                            <p style="margin-top:28px;color:#6b7280;font-size:14px;line-height:1.6;">
                                If you have any questions regarding this update, please wait for further instructions from our editorial team.
                            </p>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
                            <p style="margin:0;color:#9ca3af;font-size:12px;">This is an automated notification from <strong>BR Publications</strong>.</p>
                            <p style="margin-top:12px;color:#9ca3af;font-size:12px;">© ${new Date().getFullYear()} BR Publications. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

  const template = await templateService.getTemplate('TEXTBOOK_STATUS_CHANGED', CommunicationType.EMAIL, {
    name, bookTitle: data.bookTitle,
    previousStatus: data.previousStatus.replace(/_/g, ' '),
    newStatus: data.newStatus.replace(/_/g, ' '),
    changedBy: data.changedBy, adminMessage: noteHtml,
    frontendUrl: FRONTEND_URL
  });
  if (template) { subject = template.subject; html = template.content; }

  await sendEmail(email, subject, html, undefined, EmailCategory.TEXTBOOK);
};

// ─────────────────────────────────────────────
// DELIVERY DETAILS REQUESTED — sent to Author
// ─────────────────────────────────────────────
/**
 * Trigger: Admin records ISBN, requesting delivery address
 * Template: TEXTBOOK_DELIVERY_DETAILS_REQUESTED
 * Variables: {{name}}, {{bookTitle}}, {{isbnNumber}}, {{doiNumber}}, {{frontendUrl}}
 */
export const sendDeliveryDetailsRequestEmail = async (
  email: string,
  name: string,
  data: {
    bookTitle: string;
    isbnNumber: string;
    doiNumber?: string;
    submissionId: number;
  }
): Promise<void> => {
  let subject = `Delivery Details Required: ${data.bookTitle}`;
  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;">
                    <tr>
                        <td style="background:linear-gradient(135deg,#1e3a6e,#2563eb);padding:36px 40px;text-align:center;">
                            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">BR Publications</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="background:#fff7ed;border-bottom:3px solid #f97316;padding:16px 40px;text-align:center;">
                            <p style="margin:0;color:#c2410c;font-size:15px;font-weight:600;">📦 Delivery Details Required</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:36px 40px;">
                            <p style="margin:0 0 18px;color:#374151;font-size:15px;">Hello <strong>${name}</strong>,</p>
                            <p style="margin:0 0 20px;color:#6b7280;font-size:14px;line-height:1.6;">Your textbook <strong>${data.bookTitle}</strong> has had its ISBN recorded. We now require your delivery address.</p>
                            <div style="text-align:center;">
                                <a href="${FRONTEND_URL}product/find/${data.isbnNumber}" style="background:#2563eb;color:#ffffff;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:600;display:inline-block;">Submit Address</a>
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

  const template = await templateService.getTemplate('TEXTBOOK_DELIVERY_DETAILS_REQUESTED', CommunicationType.EMAIL, {
    name,
    bookTitle: data.bookTitle,
    isbnNumber: data.isbnNumber,
    doiNumber: data.doiNumber || 'N/A',
    frontendUrl: FRONTEND_URL,
    currentYear: new Date().getFullYear()
  });
  if (template) { subject = template.subject; html = template.content; }

  await sendEmail(email, subject, html, undefined, EmailCategory.TEXTBOOK);
};

// ─────────────────────────────────────────────
// PUBLICATION SUCCESS — sent to Author
// ─────────────────────────────────────────────
/**
 * Trigger: Admin publishes the textbook
 * Template: TEXTBOOK_PUBLISHED_AUTHOR
 * Variables: {{name}}, {{bookTitle}}, {{publishDate}}, {{isbn}}, {{doi}}, {{frontendUrl}}
 */
export const sendTextBookPublishedEmail = async (
  email: string,
  name: string,
  data: {
    bookTitle: string;
    publishDate: string;
    isbn: string;
    doi?: string;
    submissionId: number;
  }
): Promise<void> => {
  let subject = `Congratulations! Your Textbook is Published: ${data.bookTitle}`;
  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Textbook Published</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;">
                    <!-- Header -->
                    <tr>
                        <td style="background:linear-gradient(135deg,#1e3a6e,#2563eb);padding:36px 40px;text-align:center;">
                            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">BR Publications</h1>
                            <p style="margin:8px 0 0;color:#bfdbfe;font-size:14px;">Publication Process Update</p>
                        </td>
                    </tr>
                    <!-- Banner -->
                    <tr>
                        <td style="background:#ecfdf5;border-bottom:3px solid #10b981;padding:16px 40px;text-align:center;">
                            <p style="margin:0;color:#047857;font-size:15px;font-weight:600;">🎉 Congratulations! Your Textbook is Published</p>
                        </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                        <td style="padding:36px 40px;">
                            <p style="margin:0 0 18px;color:#374151;font-size:15px;">Hello <strong>${name}</strong>,</p>
                            <p style="margin:0 0 20px;color:#6b7280;font-size:14px;line-height:1.6;">We are thrilled to inform you that your textbook titled <strong>${data.bookTitle}</strong> has officially been published and is now available.</p>
                            <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6;">This is a major milestone in your publishing journey. Below are the official identifiers for your work.</p>
                            <!-- Details Card -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
                                <tr>
                                    <td style="padding:24px">
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
                                                    <span style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Textbook Title</span><br />
                                                    <span style="color:#111827;font-size:15px;">${data.bookTitle}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
                                                    <span style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Published Date</span><br />
                                                    <span style="color:#111827;font-size:15px;">${data.publishDate}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
                                                    <span style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">ISBN Number</span><br />
                                                    <span style="color:#111827;font-size:15px;font-weight:600;">${data.isbn}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding:10px 0;">
                                                    <span style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">DOI</span><br />
                                                    <span style="color:#111827;font-size:15px;">${data.doi || 'N/A'}</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            <div style="text-align:center;margin-top:32px;margin-bottom:24px;">
                                <a href="${FRONTEND_URL}product/find/${data.isbn}" style="background:#2563eb;color:#ffffff;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:600;display:inline-block;">View Publication</a>
                            </div>
                            <p style="margin-top:24px;color:#6b7280;font-size:14px;line-height:1.6;">If you have any questions, please contact our support team.</p>
                            <p style="margin-top:10px;color:#6b7280;font-size:14px;">Best regards,<br /><strong>BR Publications Team</strong></p>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
                            <p style="margin:0;color:#9ca3af;font-size:12px;">This is an automated notification from <strong>BR Publications</strong>.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

  const template = await templateService.getTemplate('TEXTBOOK_PUBLISHED_AUTHOR', CommunicationType.EMAIL, {
    name,
    bookTitle: data.bookTitle,
    publishDate: data.publishDate,
    isbn: data.isbn,
    doi: data.doi || 'N/A',
    frontendUrl: FRONTEND_URL,
    currentYear: new Date().getFullYear()
  });
  if (template) { subject = template.subject; html = template.content; }

  await sendEmail(email, subject, html, undefined, EmailCategory.TEXTBOOK);
};

// ─────────────────────────────────────────────
// BULK UPLOAD REPORT — sent to Admin
// ─────────────────────────────────────────────
/**
 * Trigger: Admin completes a bulk upload of textbooks via CSV
 * Template: TEXTBOOK_BULK_UPLOAD_REPORT
 * Variables: {{name}}, {{successCount}}, {{failureCount}}, {{total}}, {{duration}}, {{frontendUrl}}
 */
export const sendTextBookBulkUploadReportEmail = async (
  email: string,
  name: string,
  data: {
    successCount: number;
    failureCount: number;
    totalTime: number;
    logs: any[];
  }
): Promise<void> => {
  const total = data.successCount + data.failureCount;
  const minutes = Math.floor(data.totalTime / 60000);
  const seconds = Math.floor((data.totalTime % 60000) / 1000);
  const duration = `${minutes}m ${seconds}s`;
  const statusColor = data.failureCount === 0 ? '#4CAF50' : data.failureCount < total ? '#FF9800' : '#f44336';

  const failedLogs = data.logs.filter(l => l.status === 'failed');
  const logsHtml = failedLogs.length > 0
    ? `<h3>Failed Entries (${failedLogs.length})</h3>
           <table style="width: 100%; border-collapse: collapse;">
             <thead><tr style="background: #f4f4f4;">
               <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Row</th>
               <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Title</th>
               <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Error</th>
             </tr></thead>
             <tbody>${failedLogs.map(log => `
               <tr>
                 <td style="padding: 8px; border: 1px solid #ddd;">${log.rowNumber}</td>
                 <td style="padding: 8px; border: 1px solid #ddd;">${log.bookTitle}</td>
                 <td style="padding: 8px; border: 1px solid #ddd; color: #f44336;">${log.message}</td>
               </tr>`).join('')}
             </tbody>
           </table>`
    : '<p>No failures reported.</p>';

  let subject = `Bulk Upload Report - ${new Date().toLocaleDateString()}`;
  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Bulk Upload Report</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;">
                    <!-- Header -->
                    <tr>
                        <td style="background:linear-gradient(135deg,#1e3a6e,#2563eb);padding:36px 40px;text-align:center;">
                            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">BR Publications</h1>
                            <p style="margin:8px 0 0;color:#bfdbfe;font-size:14px;">Administrative Upload Report</p>
                        </td>
                    </tr>
                    <!-- Banner -->
                    <tr>
                        <td style="background:#eff6ff;border-bottom:3px solid #3b82f6;padding:16px 40px;text-align:center;">
                            <p style="margin:0;color:#1d4ed8;font-size:15px;font-weight:600;">📊 Bulk Upload Process Completed</p>
                        </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                        <td style="padding:36px 40px;">
                            <p style="margin:0 0 18px;color:#374151;font-size:15px;">Hello <strong>${name}</strong>,</p>
                            <p style="margin:0 0 20px;color:#6b7280;font-size:14px;line-height:1.6;">The bulk upload process has finished. Below is the summary of the operations performed.</p>
                            
                            <!-- Summary Card -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
                                <tr>
                                    <td style="padding:24px">
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
                                                    <span style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Total Entries</span><br />
                                                    <span style="color:#111827;font-size:18px;font-weight:700;">${total}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
                                                    <span style="color:#10b981;font-size:12px;font-weight:600;text-transform:uppercase;">Successfully Published</span><br />
                                                    <span style="color:#059669;font-size:18px;font-weight:700;">${data.successCount}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
                                                    <span style="color:#ef4444;font-size:12px;font-weight:600;text-transform:uppercase;">Failed Entries</span><br />
                                                    <span style="color:#dc2626;font-size:18px;font-weight:700;">${data.failureCount}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding:10px 0;">
                                                    <span style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Total Duration</span><br />
                                                    <span style="color:#111827;font-size:15px;">${duration}</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Detailed Logs (Errors) -->
                            <div style="margin-top:24px;">
                                ${logsHtml}
                            </div>

                            <div style="text-align:center;margin-top:32px;margin-bottom:24px;">
                                <a href="${FRONTEND_URL}dashboard/admin/textbooks" style="background:#2563eb;color:#ffffff;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:600;display:inline-block;">View Textbooks</a>
                            </div>
                            
                            <p style="margin-top:24px;color:#6b7280;font-size:14px;line-height:1.6;">This report provides a summary of the batch operation. Individual authors have been notified of their successful publications.</p>
                            <p style="margin-top:10px;color:#6b7280;font-size:14px;">Best regards,<br /><strong>BR Publications Management System</strong></p>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
                            <p style="margin:0;color:#9ca3af;font-size:12px;">This is an automated administrative report from <strong>BR Publications</strong>.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

  const template = await templateService.getTemplate('TEXTBOOK_BULK_UPLOAD_REPORT', CommunicationType.EMAIL, {
    name, successCount: data.successCount, failureCount: data.failureCount,
    total, duration, frontendUrl: FRONTEND_URL,
    logsHtml, currentDate: new Date().toLocaleDateString(),
    currentYear: new Date().getFullYear()
  });
  if (template) { subject = template.subject; html = template.content; }

  await sendEmail(email, subject, html, undefined, EmailCategory.TEXTBOOK);
};

// ─────────────────────────────────────────────
// COMMENT / DISCUSSION — sent to participant
// ─────────────────────────────────────────────
/**
 * Trigger: A user posts a comment or reply in the textbook discussion thread
 * Template: TEXTBOOK_COMMENT
 * Variables: {{name}}, {{commenterName}}, {{bookTitle}}, {{message}}, {{isReply}}, {{frontendUrl}}
 */
export const sendTextBookCommentEmail = async (
  email: string,
  name: string,
  data: {
    bookTitle: string;
    commenterName: string;
    message: string;
    submissionId: number;
    isReply: boolean;
  }
): Promise<void> => {
  let subject = `New ${data.isReply ? 'Reply' : 'Comment'}: ${data.bookTitle}`;
  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;">
                    <tr>
                        <td style="background:linear-gradient(135deg,#581c87,#7c3aed);padding:36px 40px;text-align:center;">
                            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">BR Publications</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="background:#f5f3ff;border-bottom:3px solid #8b5cf6;padding:16px 40px;text-align:center;">
                            <p style="margin:0;color:#6d28d9;font-size:15px;font-weight:600;">💬 New Activity in Discussion</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:36px 40px;">
                            <p style="margin:0 0 18px;color:#374151;font-size:15px;">Hello <strong>${name}</strong>,</p>
                            <p style="margin:0 0 20px;color:#6b7280;font-size:14px;line-height:1.6;"><strong>${data.commenterName}</strong> has posted in the discussion for <strong>${data.bookTitle}</strong>.</p>
                            <div style="text-align:center;">
                                <a href="${FRONTEND_URL}dashboard" style="background:#7c3aed;color:#ffffff;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:600;display:inline-block;">View & Reply</a>
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

  const template = await templateService.getTemplate('TEXTBOOK_COMMENT', CommunicationType.EMAIL, {
    name, commenterName: data.commenterName, bookTitle: data.bookTitle,
    message: data.message, isReplyText: data.isReply ? 'replied to a comment on' : 'added a comment to',
    isReplyUppercase: data.isReply ? 'REPLY' : 'COMMENT',
    frontendUrl: FRONTEND_URL,
    currentYear: new Date().getFullYear()
  });
  if (template) { subject = template.subject; html = template.content; }

  await sendEmail(email, subject, html, undefined, EmailCategory.TEXTBOOK);
};
