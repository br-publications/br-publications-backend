/**
 * ============================================================
 * RECRUITMENT SUBMISSION EMAILS
 * ============================================================
 * Covers: New application notification, submission confirmation, decision
 *
 * Template Codes:
 *   RECRUITMENT_APPLICATION_ADMIN    → sendRecruitmentApplicationAdminEmail   (to Admin)
 *   RECRUITMENT_SUBMISSION_RECEIVED  → sendRecruitmentSubmissionReceivedEmail (to Applicant)
 *   RECRUITMENT_DECISION             → sendRecruitmentDecisionEmail           (to Applicant)
 */

import templateService from '../../services/templateService';
import { CommunicationType } from '../../models/communicationTemplate';
import { sendEmail, FRONTEND_URL, EmailCategory } from './base';

// ─────────────────────────────────────────────
// APPLICATION NOTIFICATION — sent to Admin
// ─────────────────────────────────────────────
/**
 * Trigger: A user submits a recruitment application
 * Template: RECRUITMENT_APPLICATION_ADMIN
 * Variables: {{adminName}}, {{applicantName}}, {{appliedRole}}, {{applicationId}}, {{submissionDate}}, {{frontendUrl}}
 */
export const sendRecruitmentApplicationAdminEmail = async (
    email: string,
    adminName: string,
    data: {
        applicantName: string;
        appliedRole: string;
        applicationId: string;
        submissionDate: Date;
    }
): Promise<void> => {
    let subject = `New Recruitment Application: ${data.applicantName}`;
    let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Hello ${adminName},</h2>
      <p>A new recruitment application has been received.</p>
      <div style="background: #f9f9f9; border-left: 4px solid #1e5292; padding: 20px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Application ID: ${data.applicationId}</h3>
        <p><strong>Applicant:</strong> ${data.applicantName}</p>
        <p><strong>Applied Role:</strong> ${data.appliedRole.toUpperCase()}</p>
        <p><strong>Submitted:</strong> ${new Date(data.submissionDate).toLocaleDateString()}</p>
      </div>
      <p><a href="${FRONTEND_URL}dashboard/admin/recruitment" style="background: #1e5292; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Application</a></p>
      <p style="color: #666; font-size: 14px;">This is an automated notification from BR Publications Recruitment System.</p>
    </div>`;

    const template = await templateService.getTemplate('RECRUITMENT_APPLICATION_ADMIN', CommunicationType.EMAIL, {
        adminName, applicantName: data.applicantName, appliedRole: data.appliedRole,
        applicationId: data.applicationId,
        submissionDate: new Date(data.submissionDate).toLocaleDateString(),
        frontendUrl: FRONTEND_URL
    });
    if (template) { subject = template.subject; html = template.content; }

    await sendEmail(email, subject, html, undefined, EmailCategory.RECRUITMENT);
};

// ─────────────────────────────────────────────
// SUBMISSION CONFIRMATION — sent to Applicant
// ─────────────────────────────────────────────
/**
 * Trigger: A user submits a recruitment application
 * Template: RECRUITMENT_SUBMISSION_RECEIVED
 * Variables: {{name}}, {{appliedRole}}, {{applicationId}}, {{submissionDate}}, {{frontendUrl}}
 */
export const sendRecruitmentSubmissionReceivedEmail = async (
    email: string,
    name: string,
    data: {
        appliedRole: string;
        applicationId: string;
        submissionDate: Date;
    }
): Promise<void> => {
    let subject = 'Recruitment Application Received - BR Publications';
    let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Hello ${name},</h2>
      <p>We have received your application for the position of <strong>${data.appliedRole.toUpperCase()}</strong>.</p>
      <div style="background: #f9f9f9; border-left: 4px solid #4CAF50; padding: 20px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Application ID: ${data.applicationId}</h3>
        <p><strong>Submitted:</strong> ${new Date(data.submissionDate).toLocaleDateString()}</p>
        <p><strong>Status:</strong> PENDING REVIEW</p>
      </div>
      <p>Our team will review your application shortly and get back to you.</p>
      <p><a href="${FRONTEND_URL}dashboard/user/recruitment" style="background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Application</a></p>
      <p style="color: #666; font-size: 14px;">Best regards,<br>BR Publications Team</p>
    </div>`;

    const template = await templateService.getTemplate('RECRUITMENT_SUBMISSION_RECEIVED', CommunicationType.EMAIL, {
        name, appliedRole: data.appliedRole, applicationId: data.applicationId,
        submissionDate: new Date(data.submissionDate).toLocaleDateString(),
        frontendUrl: FRONTEND_URL
    });
    if (template) { subject = template.subject; html = template.content; }

    await sendEmail(email, subject, html, undefined, EmailCategory.RECRUITMENT);
};

// ─────────────────────────────────────────────
// DECISION — sent to Applicant
// ─────────────────────────────────────────────
/**
 * Trigger: Admin accepts or rejects a recruitment application
 * Template: RECRUITMENT_DECISION_ACCEPTED or RECRUITMENT_DECISION_REJECTED
 * Variables: {{name}}, {{decision}}, {{assignedRole}}, {{adminNotes}}, {{applicationId}}, {{frontendUrl}}
 */
export const sendRecruitmentDecisionEmail = async (
    email: string,
    name: string,
    data: {
        decision: 'ACCEPTED' | 'REJECTED';
        assignedRole?: string;
        adminNotes?: string;
        applicationId: string;
    }
): Promise<void> => {
    const approved = data.decision === 'ACCEPTED';
    const color = approved ? '#4CAF50' : '#f44336';
    const code = approved ? 'RECRUITMENT_DECISION_ACCEPTED' : 'RECRUITMENT_DECISION_REJECTED';

    let subject = `Application ${approved ? 'Accepted' : 'Rejected'} - BR Publications`;
    let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Hello ${name},</h2>
      <p>Thank you for your interest in joining BR Publications.</p>
      <div style="background: #f9f9f9; border-left: 4px solid ${color}; padding: 20px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Application #${data.applicationId}</h3>
        <p><strong>Status:</strong> ${data.decision}</p>
        ${approved && data.assignedRole ? `<p><strong>Assigned Role:</strong> ${data.assignedRole.toUpperCase()}</p>` : ''}
        ${data.adminNotes ? `<div style="margin-top: 15px; padding: 10px; background: #fff; border: 1px solid #ddd;"><strong>Notes:</strong><br>${data.adminNotes}</div>` : ''}
      </div>
      <p>${approved
            ? 'Congratulations! Your application has been accepted. You can now access your dashboard.'
            : 'We regret to inform you that we cannot proceed with your application at this time.'}</p>
      <p><a href="${FRONTEND_URL}dashboard/user/recruitment" style="background: ${color}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Status</a></p>
      <p style="color: #666; font-size: 14px;">Best regards,<br>BR Publications Team</p>
    </div>`;

    const template = await templateService.getTemplate(code, CommunicationType.EMAIL, {
        name, decision: data.decision, assignedRole: data.assignedRole || '',
        adminNotes: data.adminNotes || '', applicationId: data.applicationId,
        frontendUrl: FRONTEND_URL
    });
    if (template) { subject = template.subject; html = template.content; }

    await sendEmail(email, subject, html, undefined, EmailCategory.RECRUITMENT);
};
