/**
 * ============================================================
 * PROJECTS & INTERNSHIPS SUBMISSION EMAILS
 * ============================================================
 * Covers the full projects/internship application lifecycle:
 *   - New application notification (admin)
 *   - Submission confirmation (applicant)
 *   - Application decision (applicant)
 *
 * Template Codes:
 *   PROJECT_APPLICATION_ADMIN       → sendProjectApplicationAdminEmail       (to Admin)
 *   PROJECT_SUBMISSION_RECEIVED     → sendProjectSubmissionReceivedEmail     (to Applicant)
 *   PROJECT_DECISION_ACCEPTED       → sendProjectDecisionEmail (approved)    (to Applicant)
 *   PROJECT_DECISION_REJECTED       → sendProjectDecisionEmail (rejected)    (to Applicant)
 */

import templateService from '../../services/templateService';
import { CommunicationType } from '../../models/communicationTemplate';
import { sendEmail, FRONTEND_URL, EmailCategory } from './base';

// ─────────────────────────────────────────────
// APPLICATION NOTIFICATION — sent to Admin
// ─────────────────────────────────────────────
/**
 * Trigger: A user submits a project or internship application
 * Template: PROJECT_APPLICATION_ADMIN
 * Variables: {{adminName}}, {{applicantName}}, {{submissionType}}, {{applicationId}}, {{submissionDate}}, {{frontendUrl}}
 */
export const sendProjectApplicationAdminEmail = async (
  email: string,
  adminName: string,
  data: {
    applicantName: string;
    submissionType: string;    // "Project" or "Internship"
    applicationId: string;
    submissionDate: Date;
  }
): Promise<void> => {
  let subject = `New ${data.submissionType} Application: ${data.applicantName}`;
  let html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fff; border: 1px solid #eef2f6; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #1e3a6e 0%, #2563eb 100%); padding: 30px; text-align: center; color: #fff;">
            <h2 style="margin: 0; font-size: 22px; font-weight: 700;">New ${data.submissionType} Request</h2>
            <p style="margin: 8px 0 0; opacity: 0.8; font-size: 14px;">Admin Notification</p>
        </div>
        <div style="padding: 30px; color: #374151; line-height: 1.6;">
            <h3 style="margin-top: 0; color: #111827;">Hello ${adminName},</h3>
            <p>A new <strong>${data.submissionType.toLowerCase()}</strong> application has been received and requires your review.</p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <p style="margin: 0 0 10px; font-size: 13px; color: #64748b; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Submission Details</p>
                <p style="margin: 5px 0;"><strong>Application ID:</strong> <span style="font-family: monospace; color: #2563eb;">${data.applicationId}</span></p>
                <p style="margin: 5px 0;"><strong>Applicant:</strong> ${data.applicantName}</p>
                <p style="margin: 5px 0;"><strong>Type:</strong> ${data.submissionType}</p>
                <p style="margin: 5px 0;"><strong>Submitted:</strong> ${new Date(data.submissionDate).toLocaleDateString()}</p>
            </div>
            <div style="text-align: center; margin-top: 30px;">
                <a href="${FRONTEND_URL}dashboard/admin/projects-internships" style="background: #2563eb; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px;">Review Application</a>
            </div>
        </div>
        <div style="padding: 20px; background-color: #f8fafc; border-top: 1px solid #eef2f6; text-align: center; color: #94a3b8; font-size: 12px;">
            <p style="margin: 0;">This is an automated notification from BR Publications Management System.</p>
        </div>
    </div>`;

  const template = await templateService.getTemplate('PROJECT_APPLICATION_ADMIN', CommunicationType.EMAIL, {
    adminName, applicantName: data.applicantName, submissionType: data.submissionType,
    applicationId: data.applicationId,
    submissionDate: new Date(data.submissionDate).toLocaleDateString(),
    frontendUrl: FRONTEND_URL
  });
  if (template) { subject = template.subject; html = template.content; }

  await sendEmail(email, subject, html, undefined, EmailCategory.PROJECT);
};

// ─────────────────────────────────────────────
// SUBMISSION CONFIRMATION — sent to Applicant
// ─────────────────────────────────────────────
/**
 * Trigger: A user submits a project or internship application
 * Template: PROJECT_SUBMISSION_RECEIVED
 * Variables: {{name}}, {{submissionType}}, {{applicationId}}, {{submissionDate}}, {{frontendUrl}}
 */
export const sendProjectSubmissionReceivedEmail = async (
  email: string,
  name: string,
  data: {
    submissionType: string;   // "Project" or "Internship"
    applicationId: string;
    submissionDate: Date;
  }
): Promise<void> => {
  let subject = `${data.submissionType} Application Received - BR Publications`;
  let html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fff; border: 1px solid #eef2f6; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #1e3a6e 0%, #2563eb 100%); padding: 30px; text-align: center; color: #fff;">
            <h2 style="margin: 0; font-size: 22px; font-weight: 700;">Application Received</h2>
            <p style="margin: 8px 0 0; opacity: 0.8; font-size: 14px;">Confirmation Receipt</p>
        </div>
        <div style="padding: 30px; color: #374151; line-height: 1.6;">
            <h3 style="margin-top: 0; color: #111827;">Hello ${name},</h3>
            <p>Thank you for your interest in BR Publications. We've successfully received your application for <strong>${data.submissionType}</strong>.</p>
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <p style="margin: 0 0 10px; font-size: 13px; color: #166534; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Application Info</p>
                <p style="margin: 5px 0;"><strong>ID:</strong> <span style="font-family: monospace; color: #16a34a;">${data.applicationId}</span></p>
                <p style="margin: 5px 0;"><strong>Type:</strong> ${data.submissionType}</p>
                <p style="margin: 5px 0;"><strong>Received:</strong> ${new Date(data.submissionDate).toLocaleDateString()}</p>
                <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #16a34a; font-weight: 600;">PENDING REVIEW</span></p>
            </div>
            <p>Our specialized team is now reviewing your submission. You'll receive another update once a decision has been made.</p>
            <div style="text-align: center; margin-top: 30px;">
                <a href="${FRONTEND_URL}dashboard/user/projects-internships" style="background: #2563eb; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px;">Track Status</a>
            </div>
        </div>
        <div style="padding: 20px; background-color: #f8fafc; border-top: 1px solid #eef2f6; text-align: center; color: #94a3b8; font-size: 12px;">
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} BR Publications. Professional Development Portal.</p>
        </div>
    </div>`;

  const template = await templateService.getTemplate('PROJECT_SUBMISSION_RECEIVED', CommunicationType.EMAIL, {
    name, submissionType: data.submissionType, applicationId: data.applicationId,
    submissionDate: new Date(data.submissionDate).toLocaleDateString(),
    frontendUrl: FRONTEND_URL
  });
  if (template) { subject = template.subject; html = template.content; }

  await sendEmail(email, subject, html, undefined, EmailCategory.PROJECT);
};

// ─────────────────────────────────────────────
// DECISION — sent to Applicant
// ─────────────────────────────────────────────
/**
 * Trigger: Admin accepts or rejects a project/internship application
 * Template: PROJECT_DECISION_ACCEPTED or PROJECT_DECISION_REJECTED
 * Variables: {{name}}, {{decision}}, {{submissionType}}, {{adminNotes}}, {{applicationId}}, {{frontendUrl}}
 */
export const sendProjectDecisionEmail = async (
  email: string,
  name: string,
  data: {
    decision: 'ACCEPTED' | 'REJECTED';
    submissionType: string;   // "Project" or "Internship"
    adminNotes?: string;
    applicationId: string;
  }
): Promise<void> => {
  const approved = data.decision === 'ACCEPTED';
  const color = approved ? '#4CAF50' : '#f44336';
  const code = approved ? 'PROJECT_DECISION_ACCEPTED' : 'PROJECT_DECISION_REJECTED';

  let subject = `Application ${approved ? 'Accepted' : 'Rejected'} - BR Publications`;
  let html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fff; border: 1px solid #eef2f6; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, ${approved ? '#065f46' : '#991b1b'} 0%, ${color} 100%); padding: 30px; text-align: center; color: #fff;">
            <h2 style="margin: 0; font-size: 22px; font-weight: 700;">Application Update</h2>
            <p style="margin: 8px 0 0; opacity: 0.8; font-size: 14px;">Official Notification</p>
        </div>
        <div style="padding: 30px; color: #374151; line-height: 1.6;">
            <h3 style="margin-top: 0; color: #111827;">Hello ${name},</h3>
            <p>Your application for <strong>${data.submissionType}</strong> has been processed. Here is the final decision:</p>
            <div style="background: #f8fafc; border-left: 5px solid ${color}; border-radius: 4px; padding: 20px; margin: 24px 0;">
                <p style="margin: 0; font-size: 14px; font-weight: 600; color: ${color}; text-transform: uppercase;">Decision: ${data.decision}</p>
                <p style="margin: 5px 0 0; font-size: 14px; color: #4b5563;">Ref: <strong>#${data.applicationId}</strong></p>
                ${data.adminNotes ? `
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 5px; font-size: 12px; color: #6b7280; font-weight: 600;">ADMINISTRATOR NOTES</p>
                    <p style="margin: 0; font-size: 14px; font-style: italic;">"${data.adminNotes}"</p>
                </div>` : ''}
            </div>
            <p>${approved
      ? '<strong>Congratulations!</strong> We are excited to move forward with you. Please click the button below to view further instructions.'
      : 'We appreciate the time and effort you put into your application. However, we are unable to proceed at this time.'}</p>
            <div style="text-align: center; margin-top: 30px;">
                <a href="${FRONTEND_URL}dashboard/user/projects-internships" style="background: ${color}; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px;">View Details</a>
            </div>
        </div>
        <div style="padding: 20px; background-color: #f8fafc; border-top: 1px solid #eef2f6; text-align: center; color: #94a3b8; font-size: 12px;">
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} BR Publications. Professional Development Portal.</p>
        </div>
    </div>`;

  const template = await templateService.getTemplate(code, CommunicationType.EMAIL, {
    name, decision: data.decision, submissionType: data.submissionType,
    adminNotes: data.adminNotes || '', applicationId: data.applicationId,
    frontendUrl: FRONTEND_URL
  });
  if (template) { subject = template.subject; html = template.content; }

  await sendEmail(email, subject, html, undefined, EmailCategory.PROJECT);
};
