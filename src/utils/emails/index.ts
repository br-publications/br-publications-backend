/**
 * ============================================================
 * EMAIL SERVICE — BARREL EXPORT
 * ============================================================
 * Central entry point for all email senders.
 *
 * STRUCTURE:
 *   emails/
 *   ├── base.ts               → Core transporter + sendEmail()
 *   ├── authEmails.ts         → OTP, Password Reset, Welcome
 *   ├── bookChapterEmails.ts  → Full Book Chapter lifecycle
 *   ├── textBookEmails.ts     → Full Text Book lifecycle
 *   ├── recruitmentEmails.ts  → Recruitment application lifecycle
 *   ├── projectEmails.ts      → Projects & Internships lifecycle
 *   ├── userEmails.ts         → Manual Admin/Editor → User emails
 *   └── index.ts              → This file (barrel export)
 *
 * USAGE:
 *   import { sendBookChapterRevisionRequestedEmail } from '../utils/emails';
 *   import { sendRecruitmentDecisionEmail } from '../utils/emails';
 */

// Base
export { sendEmail, transporter, FRONTEND_URL } from './base';

// Auth
export {
    sendOTPEmail,
    sendPasswordResetEmail,
    sendWelcomeEmail,
} from './authEmails';

// Book Chapter Submission
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
} from './bookChapterEmails';

// Text Book Submission
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
} from './textBookEmails';

// Recruitment
export {
    sendRecruitmentApplicationAdminEmail,
    sendRecruitmentSubmissionReceivedEmail,
    sendRecruitmentDecisionEmail,
} from './recruitmentEmails';

// Projects & Internships
export {
    sendProjectApplicationAdminEmail,
    sendProjectSubmissionReceivedEmail,
    sendProjectDecisionEmail,
} from './projectEmails';

// User / Manual Direct Emails
export { sendManualEmailToUser } from './userEmails';
