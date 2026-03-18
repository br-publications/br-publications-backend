/**
 * ============================================================
 * BOOK CHAPTER SUBMISSION EMAILS
 * ============================================================
 * Covers the full book chapter lifecycle:
 *   - Submission received (author + admin notifications)
 *   - Editor assigned
 *   - Reviewer assigned
 *   - Revision requested (with optional editor message)
 *   - Revision submitted (author notifies editor/admin)
 *   - Final decision (approved / rejected)
 *   - Deadline reminder
 *   - Discussion / comment notification
 *
 * Template Codes:
 *   BOOK_CHAPTER_SUBMISSION_RECEIVED   → sendBookChapterSubmissionReceivedEmail (to Author)
 *   BOOK_CHAPTER_SUBMISSION_ADMIN      → sendBookChapterSubmissionAdminEmail    (to Admin)
 *   BOOK_CHAPTER_EDITOR_ASSIGNED       → sendBookChapterEditorAssignedEmail     (to Editor)
 *   BOOK_CHAPTER_REVIEWER_ASSIGNED     → sendBookChapterReviewerAssignedEmail   (to Reviewer)
 *   BOOK_CHAPTER_REVISION_REQUESTED    → sendBookChapterRevisionRequestedEmail  (to Author)
 *   BOOK_CHAPTER_REVISION_SUBMITTED    → sendBookChapterRevisionSubmittedEmail  (to Editor/Admin)
 *   BOOK_CHAPTER_DECISION              → sendBookChapterDecisionEmail           (to Author)
 *   BOOK_CHAPTER_STATUS_CHANGED        → sendBookChapterStatusChangedEmail      (to Author)
 *   BOOK_CHAPTER_PROOF_EDITING_STARTED → sendBookChapterProofEditingStartedEmail (to Author)
 *   BOOK_CHAPTER_DEADLINE_REMINDER     → sendBookChapterDeadlineReminderEmail   (to Reviewer/Editor)
 *   BOOK_CHAPTER_COMMENT               → sendBookChapterCommentEmail            (to participant)
 */

import templateService from '../../services/templateService';
import { CommunicationType } from '../../models/communicationTemplate';
import { sendEmail, FRONTEND_URL, EmailCategory } from './base';

// ─────────────────────────────────────────────
// SUBMISSION RECEIVED — sent to Author
// ─────────────────────────────────────────────
/**
 * Trigger: Author submits a new Book Chapter
 * Template: BOOK_CHAPTER_SUBMISSION_RECEIVED
 * Variables: {{name}}, {{bookTitle}}, {{submissionDate}}, {{submissionId}}, {{frontendUrl}}
 */
export const sendBookChapterSubmissionReceivedEmail = async (
    email: string,
    name: string,
    data: {
        bookTitle: string;
        chapters: string | number;
        submissionId: number;
        submissionDate: Date;
    }
): Promise<void> => {
    let subject = `Submission Received: ${data.bookTitle}`;
    let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Hello ${name},</h2>
      <p>Your book chapter submission has been successfully received.</p>
      <div style="background: #f9f9f9; border-left: 4px solid #4CAF50; padding: 20px; margin: 20px 0;">
        <h3 style="margin-top: 0;">${data.bookTitle}</h3>
        <p><strong>Chapters:</strong> ${data.chapters}</p>
        <p><strong>Submitted:</strong> ${new Date(data.submissionDate).toLocaleDateString()}</p>
        <p><strong>Status:</strong> Initial Submission</p>
      </div>
      <p>We will review your submission and notify you of the next steps.</p>
      <p><a href="${FRONTEND_URL}dashboard" style="background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Submission</a></p>
      <p style="color: #666; font-size: 14px;">This is an automated notification from BR Publications.</p>
    </div>`;

    const template = await templateService.getTemplate('BOOK_CHAPTER_SUBMISSION_RECEIVED', CommunicationType.EMAIL, {
        name, bookTitle: data.bookTitle,
        chapters: data.chapters || '',
        submissionDate: new Date(data.submissionDate).toLocaleDateString(),
        submissionId: data.submissionId, frontendUrl: FRONTEND_URL
    });
    if (template) { subject = template.subject; html = template.content; }

    await sendEmail(email, subject, html, undefined, EmailCategory.BOOK_CHAPTER);
};

// ─────────────────────────────────────────────
// SUBMISSION NOTIFICATION — sent to Admin
// ─────────────────────────────────────────────
/**
 * Trigger: Author submits a new Book Chapter
 * Template: BOOK_CHAPTER_SUBMISSION_ADMIN
 * Variables: {{adminName}}, {{authorName}}, {{bookTitle}}, {{chapters}}, {{submissionDate}}, {{frontendUrl}}
 */
export const sendBookChapterSubmissionAdminEmail = async (
    email: string,
    adminName: string,
    data: {
        authorName: string;
        bookTitle: string;
        chapters: string | number;
        submissionDate: Date;
        submissionId: number;
    }
): Promise<void> => {
    let subject = `New Book Chapter Submission: ${data.bookTitle}`;
    let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Hello ${adminName},</h2>
      <p>A new book chapter submission has been received.</p>
      <div style="background: #f9f9f9; border-left: 4px solid #2196F3; padding: 20px; margin: 20px 0;">
        <h3 style="margin-top: 0;">${data.bookTitle}</h3>
        <p><strong>Author:</strong> ${data.authorName}</p>
        <p><strong>Chapters:</strong> ${data.chapters}</p>
        <p><strong>Date:</strong> ${new Date(data.submissionDate).toLocaleDateString()}</p>
      </div>
      <p><a href="${FRONTEND_URL}dashboard/admin" style="background: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Submission</a></p>
      <p style="color: #666; font-size: 14px;">This is an automated notification from BR Publications.</p>
    </div>`;

    const template = await templateService.getTemplate('BOOK_CHAPTER_SUBMISSION_ADMIN', CommunicationType.EMAIL, {
        adminName, authorName: data.authorName, bookTitle: data.bookTitle,
        chapters: data.chapters, submissionDate: new Date(data.submissionDate).toLocaleDateString(),
        frontendUrl: FRONTEND_URL, submissionId: data.submissionId
    });
    if (template) { subject = template.subject; html = template.content; }

    await sendEmail(email, subject, html, undefined, EmailCategory.BOOK_CHAPTER);
};

// ─────────────────────────────────────────────
// EDITOR ASSIGNED — sent to Editor
// ─────────────────────────────────────────────
/**
 * Trigger: Admin assigns an Editor to a Book Chapter submission
 * Template: BOOK_CHAPTER_EDITOR_ASSIGNED
 * Variables: {{editorName}}, {{authorName}}, {{bookTitle}}, {{chapters}}, {{assignedBy}}, {{frontendUrl}}
 */
export const sendBookChapterEditorAssignedEmail = async (
    email: string,
    editorName: string,
    data: {
        authorName: string;
        bookTitle: string;
        chapters: string | number;
        assignedBy: string;
        submissionId: number;
    }
): Promise<void> => {
    let subject = `New Editor Assignment: ${data.bookTitle}`;
    let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Hello ${editorName},</h2>
      <p>You have been assigned as editor for a book chapter submission.</p>
      <div style="background: #f9f9f9; border-left: 4px solid #2196F3; padding: 20px; margin: 20px 0;">
        <h3 style="margin-top: 0;">${data.bookTitle}</h3>
        <p><strong>Author:</strong> ${data.authorName}</p>
        <p><strong>Chapters:</strong> ${data.chapters}</p>
        <p><strong>Assigned by:</strong> ${data.assignedBy}</p>
      </div>
      <p><a href="${FRONTEND_URL}dashboard/editor" style="background: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Submission</a></p>
      <p style="color: #666; font-size: 14px;">This is an automated notification from BR Publications.</p>
    </div>`;

    const template = await templateService.getTemplate('BOOK_CHAPTER_EDITOR_ASSIGNED', CommunicationType.EMAIL, {
        editorName, authorName: data.authorName, bookTitle: data.bookTitle,
        chapters: data.chapters, assignedBy: data.assignedBy, frontendUrl: FRONTEND_URL
    });
    if (template) { subject = template.subject; html = template.content; }

    await sendEmail(email, subject, html, undefined, EmailCategory.BOOK_CHAPTER);
};

// ─────────────────────────────────────────────
// REVIEWER ASSIGNED — sent to Reviewer
// ─────────────────────────────────────────────
/**
 * Trigger: Editor assigns a Reviewer to a Book Chapter
 * Template: BOOK_CHAPTER_REVIEWER_ASSIGNED
 * Variables: {{reviewerName}}, {{bookTitle}}, {{assignedBy}}, {{deadline}}, {{frontendUrl}}
 */
export const sendBookChapterReviewerAssignedEmail = async (
    email: string,
    reviewerName: string,
    data: {
        bookTitle: string;
        chapterTitle: string;
        assignedBy: string;
        deadline: Date | null;
        submissionId: number;
    }
): Promise<void> => {
    let subject = `Reviewer Assignment: ${data.chapterTitle}`;
    let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Hello ${reviewerName},</h2>
      <p>You have been assigned as a reviewer for a book chapter submission.</p>
      <div style="background: #f9f9f9; border-left: 4px solid #9C27B0; padding: 20px; margin: 20px 0;">
        <h3 style="margin-top: 0;">${data.bookTitle}</h3>
        <p><strong>Chapter:</strong> ${data.chapterTitle}</p>
        <p><strong>Assigned by:</strong> ${data.assignedBy}</p>
        ${data.deadline ? `<p><strong>Deadline:</strong> ${new Date(data.deadline).toLocaleDateString()}</p>` : ''}
      </div>
      <p><a href="${FRONTEND_URL}dashboard/reviewer" style="background: #9C27B0; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Assignment</a></p>
      <p style="color: #666; font-size: 14px;">This is an automated notification from BR Publications.</p>
    </div>`;

    const template = await templateService.getTemplate('BOOK_CHAPTER_REVIEWER_ASSIGNED', CommunicationType.EMAIL, {
        reviewerName,
        bookTitle: data.bookTitle,
        chapterTitle: data.chapterTitle,
        assignedBy: data.assignedBy,
        deadline: data.deadline ? new Date(data.deadline).toLocaleDateString() : 'Not set',
        frontendUrl: FRONTEND_URL
    });
    if (template) { subject = template.subject; html = template.content; }

    await sendEmail(email, subject, html, undefined, EmailCategory.BOOK_CHAPTER);
};

// ─────────────────────────────────────────────
// REVISION REQUESTED — sent to Author
// ─────────────────────────────────────────────
/**
 * Trigger: Editor/Reviewer requests a revision
 * Template: BOOK_CHAPTER_REVISION_REQUESTED
 * Variables: {{name}}, {{bookTitle}}, {{requestedBy}}, {{comments}}, {{adminMessage}}, {{revisionNumber}}, {{deadline}}, {{frontendUrl}}
 */
export const sendBookChapterRevisionRequestedEmail = async (
    email: string,
    name: string,
    data: {
        bookTitle: string;
        chapterTitle: string;
        revisionNumber: number;
        reviewerComments: string;
    }
): Promise<void> => {
    let subject = `Revision Requested: ${data.chapterTitle}`;
    let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Hello ${name},</h2>
      <p>A revision has been requested for your chapter submission: <strong>${data.chapterTitle}</strong>.</p>
      <div style="background: #f9f9f9; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0;">
        <p><strong>Book:</strong> ${data.bookTitle}</p>
        <p><strong>Revision:</strong> ${data.revisionNumber}</p>
        <p><strong>Comments:</strong></p>
        <p style="white-space: pre-wrap; background: #fff; padding: 15px; border: 1px solid #ddd;">${data.reviewerComments}</p>
      </div>
      <p>Please log in to your dashboard to submit the revised manuscript.</p>
      <p style="color: #666; font-size: 14px;">This is an automated notification from BR Publications.</p>
    </div>`;

    const template = await templateService.getTemplate('BOOK_CHAPTER_REVISION_REQUESTED', CommunicationType.EMAIL, {
        name,
        bookTitle: data.bookTitle,
        chapterTitle: data.chapterTitle,
        revisionNumber: data.revisionNumber,
        reviewerComments: data.reviewerComments,
        currentYear: new Date().getFullYear()
    });

    if (template) {
        subject = template.subject;
        html = template.content;
    }

    await sendEmail(email, subject, html, undefined, EmailCategory.BOOK_CHAPTER);
};

// ─────────────────────────────────────────────
// REVISION SUBMITTED — sent to Editor/Admin
// ─────────────────────────────────────────────
/**
 * Trigger: Author submits back a revised manuscript
 * Template: BOOK_CHAPTER_REVISION_SUBMITTED
 * Variables: {{name}}, {{authorName}}, {{bookTitle}}, {{revisionNumber}}, {{authorMessage}}, {{frontendUrl}}
 */
export const sendBookChapterRevisionSubmittedEmail = async (
    email: string,
    userName: string,
    data: {
        authorName: string,
        bookTitle: string;
        chapterTitle: string;
        revisionNumber: number;
    }
): Promise<void> => {
    let subject = `Revision Submitted: ${data.chapterTitle}`;
    let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Hello ${userName},</h2>
      <p>Author <strong>${data.authorName}</strong> has submitted a revised manuscript for a chapter.</p>
      <div style="background: #f9f9f9; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0;">
        <p><strong>Book:</strong> ${data.bookTitle}</p>
        <p><strong>Chapter:</strong> ${data.chapterTitle}</p>
        <p><strong>Revision:</strong> ${data.revisionNumber}</p>
      </div>
      <p>Please log in to the admin dashboard to review the submission.</p>
      <p style="color: #666; font-size: 14px;">This is an automated notification from BR Publications.</p>
    </div>`;

    const template = await templateService.getTemplate('BOOK_CHAPTER_REVISION_SUBMITTED', CommunicationType.EMAIL, {
        userName,
        authorName: data.authorName,
        bookTitle: data.bookTitle,
        chapterTitle: data.chapterTitle,
        revisionNumber: data.revisionNumber,
        currentYear: new Date().getFullYear()
    });

    if (template) {
        subject = template.subject;
        html = template.content;
    }

    await sendEmail(email, subject, html, undefined, EmailCategory.BOOK_CHAPTER);
};

// ─────────────────────────────────────────────
// REVISION SUBMITTED — sent to Reviewer
// ─────────────────────────────────────────────
/**
 * Trigger: Author submits back a revised manuscript (notifies specifically for a chapter)
 * Template: BOOK_CHAPTER_REVISION_SUBMITTED_REVIEWER
 * Variables: {{userName}}, {{authorName}}, {{bookTitle}}, {{chapterTitle}}, {{revisionNumber}}, {{frontendUrl}}, {{currentYear}}
 */
export const sendBookChapterChapterRevisionUploadedReviewerEmail = async (
    email: string,
    reviewerName: string,
    data: {
        authorName: string;
        bookTitle: string;
        chapterTitle: string;
        revisionNumber: number;
        submissionId: number;
    }
): Promise<void> => {
    let subject = `Chapter Revision Uploaded: ${data.chapterTitle}`;
    let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Hello ${reviewerName},</h2>
      <p>A revised manuscript has been uploaded for the chapter you are reviewing.</p>
      <div style="background: #f9f9f9; border-left: 4px solid #9C27B0; padding: 20px; margin: 20px 0;">
        <h3 style="margin-top: 0;">${data.bookTitle}</h3>
        <p><strong>Chapter:</strong> ${data.chapterTitle}</p>
        <p><strong>Status:</strong> Revision Submitted</p>
      </div>
      <p><a href="${FRONTEND_URL}dashboard/reviewer" style="background: #9C27B0; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Assignment</a></p>
      <p style="color: #666; font-size: 14px;">This is an automated notification from BR Publications.</p>
    </div>`;

    const template = await templateService.getTemplate('BOOK_CHAPTER_REVISION_SUBMITTED_REVIEWER', CommunicationType.EMAIL, {
        userName: reviewerName,
        authorName: data.authorName,
        bookTitle: data.bookTitle,
        chapterTitle: data.chapterTitle,
        revisionNumber: data.revisionNumber,
        frontendUrl: FRONTEND_URL
    });
    if (template) { subject = template.subject; html = template.content; }

    await sendEmail(email, subject, html, undefined, EmailCategory.BOOK_CHAPTER);
};

/**
 * Trigger: Author submits back a revised manuscript (notifies specifically for a chapter with author details)
 * Template: BOOK_CHAPTER_REVISION_SUBMITTED_REVIEWER_V2
 * Variables: {{userName}}, {{authorName}}, {{bookTitle}}, {{chapterTitle}}, {{revisionNumber}}, {{authorMessage}}, {{frontendUrl}}, {{currentYear}}
 */
export const sendBookChapterRevisionSubmittedToReviewerEmail = async (
    email: string,
    reviewerName: string,
    data: {
        authorName: string;
        bookTitle: string;
        chapterTitle: string;
        revisionNumber: number;
        authorMessage?: string;
        submissionId: number;
    }
): Promise<void> => {
    const authorMessageHtml = data.authorMessage
        ? `<div style="margin-top: 15px; padding: 15px; background: #fff; border: 1px solid #ddd;">
            <strong>Author Message:</strong>
            <p style="white-space: pre-wrap; margin-top: 5px;">${data.authorMessage}</p>
           </div>`
        : '';

    let subject = `Revision Submitted: ${data.chapterTitle}`;
    let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Hello ${reviewerName},</h2>
      <p>A revised manuscript has been uploaded for the chapter you are reviewing.</p>
      <div style="background: #f9f9f9; border-left: 4px solid #9C27B0; padding: 20px; margin: 20px 0;">
        <h3 style="margin-top: 0;">${data.bookTitle}</h3>
        <p><strong>Chapter:</strong> ${data.chapterTitle}</p>
        <p><strong>Author:</strong> ${data.authorName}</p>
        <p><strong>Revision #:</strong> ${data.revisionNumber}</p>
        <p><strong>Status:</strong> Revision Submitted</p>
        ${authorMessageHtml}
      </div>
      <p><a href="${FRONTEND_URL}dashboard/reviewer" style="background: #9C27B0; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Assignment</a></p>
      <p style="color: #666; font-size: 14px;">This is an automated notification from BR Publications.</p>
    </div>`;

    const template = await templateService.getTemplate('BOOK_CHAPTER_REVISION_SUBMITTED_REVIEWER_V2', CommunicationType.EMAIL, {
        userName: reviewerName,
        authorName: data.authorName,
        bookTitle: data.bookTitle,
        chapterTitle: data.chapterTitle,
        revisionNumber: data.revisionNumber,
        authorMessage: data.authorMessage || '',
        frontendUrl: FRONTEND_URL
    });
    if (template) { subject = template.subject; html = template.content; }

    await sendEmail(email, subject, html, undefined, EmailCategory.BOOK_CHAPTER);
};

// ─────────────────────────────────────────────
// FINAL DECISION — sent to Author
// ─────────────────────────────────────────────
/**
 * Trigger: Editor makes a final Accept or Reject decision
 * Template: BOOK_CHAPTER_DECISION_APPROVED or BOOK_CHAPTER_DECISION_REJECTED
 * Variables: {{name}}, {{bookTitle}}, {{decision}}, {{editorName}}, {{editorNotes}}, {{stage}}, {{frontendUrl}}
 */
export const sendBookChapterDecisionEmail = async (
    email: string,
    name: string,
    data: {
        bookTitle: string;
        chapterTitle?: string;       // If provided, email is chapter-specific
        chapters?: string | number;
        decision: 'APPROVED' | 'REJECTED';
        editorName: string;
        editorNotes?: string;
        stage?: string;
        submissionId: number;
    }
): Promise<void> => {
    const approved = data.decision === 'APPROVED';
    const stage = data.stage || 'Submission';
    const color = approved ? '#4CAF50' : '#f44336';
    const code = approved ? 'BOOK_CHAPTER_DECISION_APPROVED' : 'BOOK_CHAPTER_DECISION_REJECTED';

    // Subject: chapter-specific if chapterTitle provided, else book-level
    const subjectTarget = data.chapterTitle ? `"${data.chapterTitle}"` : `"${data.bookTitle}"`;
    let subject = `[${stage}] ${approved ? 'Approved ✅' : 'Rejected ❌'}: ${subjectTarget}`;

    let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Hello ${name},</h2>
      <p style="font-size: 18px;">${approved ? '🎉 Congratulations!' : '❌ Update on your submission'}</p>
      <div style="background: #f9f9f9; border-left: 4px solid ${color}; padding: 20px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #333;">${data.bookTitle}</h3>
        ${data.chapterTitle ? `<p><strong>Chapter:</strong> ${data.chapterTitle}</p>` : ''}
        ${data.chapters && !data.chapterTitle ? `<p><strong>Chapters:</strong> ${data.chapters}</p>` : ''}
        <p><strong>Stage:</strong> ${stage}</p>
        <p><strong>Decision:</strong> <span style="color: ${color}; font-weight: bold;">${data.decision}</span></p>
        <p><strong>By:</strong> ${data.editorName}</p>
        ${data.editorNotes ? `<div style="background: #fff; padding: 15px; margin-top: 15px; border: 1px solid #ddd; border-radius: 4px;"><strong>Editor Notes:</strong><p style="white-space: pre-wrap; margin: 8px 0 0;">${data.editorNotes}</p></div>` : ''}
      </div>
      <p><a href="${FRONTEND_URL}dashboard" style="background: ${color}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Details</a></p>
      <p style="color: #666; font-size: 14px;">This is an automated notification from BR Publications.</p>
    </div>`;

    const template = await templateService.getTemplate(code, CommunicationType.EMAIL, {
        name,
        bookTitle: data.bookTitle,
        chapterTitle: data.chapterTitle || '',
        decision: data.decision,
        stage,
        editorName: data.editorName,
        editorNotes: data.editorNotes || '',
        chapters: data.chapters || '',
        frontendUrl: FRONTEND_URL
    });
    if (template) { subject = template.subject; html = template.content; }

    await sendEmail(email, subject, html, undefined, EmailCategory.BOOK_CHAPTER);
};

/**
 * Helper: Sends a decision email to both the submitting author (User record)
 * and the corresponding author (from submission's author JSON). Deduplicates by email.
 */
export const sendDecisionEmailToAuthors = async (
    submission: import('../../models/bookChapterSubmission').default,
    submitter: import('../../models/user').default | null,
    emailData: {
        bookTitle: string;
        chapterTitle?: string;
        chapters?: string;
        decision: 'APPROVED' | 'REJECTED';
        editorName: string;
        editorNotes: string;
        stage: string;
    }
) => {
    const sent = new Set<string>();

    const sendIfNew = async (email: string, name: string) => {
        const key = email.toLowerCase().trim();
        if (sent.has(key)) return;
        sent.add(key);
        await sendBookChapterDecisionEmail(email, name, {
            ...emailData,
            submissionId: submission.id,
        }).catch(err => console.error(`[DecisionEmail] Failed to send to ${email}:`, err));
    };

    // 1. Submitting author (registered user)
    if (submitter) {
        await sendIfNew(submitter.email, submitter.fullName);
    }

    // 2. Corresponding author from submission JSON
    const correspondingAuthor = submission.getCorrespondingAuthor();
    if (correspondingAuthor?.email) {
        const name = `${correspondingAuthor.firstName} ${correspondingAuthor.lastName}`;
        await sendIfNew(correspondingAuthor.email, name);
    }
};


// ─────────────────────────────────────────────
// STATUS CHANGED — sent to Author
// ─────────────────────────────────────────────
/**
 * Trigger: Any general status change on a Book Chapter submission
 * Template: BOOK_CHAPTER_STATUS_CHANGED
 * Variables: {{name}}, {{bookTitle}}, {{previousStatus}}, {{newStatus}}, {{changedBy}}, {{adminMessage}}, {{frontendUrl}}
 */
export const sendBookChapterStatusChangedEmail = async (
    email: string,
    name: string,
    data: {
        bookTitle: string;
        chapters?: string | number;
        previousStatus: string;
        newStatus: string;
        changedBy: string;
        adminMessage?: string;      // Optional note from admin/editor
        submissionId: number;
    }
): Promise<void> => {
    const adminNoteHtml = data.adminMessage
        ? `<div style="margin-top: 15px; padding: 15px; background: #fff; border: 1px solid #ddd;">
            <strong>Notes:</strong><p style="white-space: pre-wrap;">${data.adminMessage}</p>
           </div>`
        : '';

    let subject = `Status Update: ${data.bookTitle}`;
    let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Hello ${name},</h2>
      <p>The status of your submission has been updated.</p>
      <div style="background: #f9f9f9; border-left: 4px solid #FF9800; padding: 20px; margin: 20px 0;">
        <h3 style="margin-top: 0;">${data.bookTitle}</h3>
        <p><strong>Previous Status:</strong> ${data.previousStatus.replace(/_/g, ' ')}</p>
        <p><strong>New Status:</strong> ${data.newStatus.replace(/_/g, ' ')}</p>
        <p><strong>Updated by:</strong> ${data.changedBy}</p>
        ${adminNoteHtml}
      </div>
      <p><a href="${FRONTEND_URL}dashboard" style="background: #FF9800; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Details</a></p>
      <p style="color: #666; font-size: 14px;">This is an automated notification from BR Publications.</p>
    </div>`;

    const template = await templateService.getTemplate('BOOK_CHAPTER_STATUS_CHANGED', CommunicationType.EMAIL, {
        name, bookTitle: data.bookTitle,
        previousStatus: data.previousStatus.replace(/_/g, ' '),
        newStatus: data.newStatus.replace(/_/g, ' '),
        changedBy: data.changedBy, adminMessage: data.adminMessage || '',
        chapters: data.chapters || '',
        frontendUrl: FRONTEND_URL
    });
    if (template) { subject = template.subject; html = template.content; }

    await sendEmail(email, subject, html, undefined, EmailCategory.BOOK_CHAPTER);
};

// ─────────────────────────────────────────────
// DEADLINE REMINDER — sent to Reviewer or Editor
// ─────────────────────────────────────────────
/**
 * Trigger: Scheduled job (cron) sends reminders for upcoming deadlines
 * Template: BOOK_CHAPTER_DEADLINE_REMINDER
 * Variables: {{name}}, {{role}}, {{bookTitle}}, {{daysRemaining}}, {{deadline}}, {{frontendUrl}}
 */
export const sendBookChapterDeadlineReminderEmail = async (
    email: string,
    name: string,
    data: {
        role: string;
        bookTitle: string;
        daysRemaining: number;
        deadline: Date;
        submissionId: number;
    }
): Promise<void> => {
    const urgencyColor = data.daysRemaining <= 2 ? '#f44336' : '#ff9800';
    let subject = `Reminder: ${data.role} Assignment Due in ${data.daysRemaining} Day${data.daysRemaining > 1 ? 's' : ''}`;
    let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Hello ${name},</h2>
      <p style="color: ${urgencyColor}; font-weight: bold;">⏰ Deadline Reminder</p>
      <div style="background: #f9f9f9; border-left: 4px solid ${urgencyColor}; padding: 20px; margin: 20px 0;">
        <h3 style="margin-top: 0;">${data.bookTitle}</h3>
        <p><strong>Role:</strong> ${data.role}</p>
        <p><strong>Days Remaining:</strong> ${data.daysRemaining}</p>
        <p><strong>Deadline:</strong> ${new Date(data.deadline).toLocaleString()}</p>
      </div>
      <p><a href="${FRONTEND_URL}dashboard" style="background: ${urgencyColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Assignment</a></p>
      <p style="color: #666; font-size: 14px;">This is an automated reminder from BR Publications.</p>
    </div>`;

    const template = await templateService.getTemplate('BOOK_CHAPTER_DEADLINE_REMINDER', CommunicationType.EMAIL, {
        name, role: data.role, bookTitle: data.bookTitle,
        daysRemaining: data.daysRemaining,
        deadline: new Date(data.deadline).toLocaleDateString(),
        frontendUrl: FRONTEND_URL
    });
    if (template) { subject = template.subject; html = template.content; }

    await sendEmail(email, subject, html, undefined, EmailCategory.BOOK_CHAPTER);
};

// ─────────────────────────────────────────────
// COMMENT / DISCUSSION — sent to participant
// ─────────────────────────────────────────────
/**
 * Trigger: A user posts a comment or reply in the discussion thread
 * Template: BOOK_CHAPTER_COMMENT
 * Variables: {{name}}, {{commenterName}}, {{bookTitle}}, {{message}}, {{isReply}}, {{frontendUrl}}
 */
export const sendBookChapterCommentEmail = async (
    email: string,
    name: string,
    data: {
        bookTitle: string;
        chapters?: string | number;
        commenterName: string;
        message: string;
        submissionId: number;
        discussionId: number;
        isReply: boolean;
    }
): Promise<void> => {
    let subject = `New ${data.isReply ? 'Reply' : 'Comment'}: ${data.bookTitle}`;
    let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Hello ${name},</h2>
      <p>${data.commenterName} ${data.isReply ? 'replied to a comment' : 'added a comment'} on your submission.</p>
      <div style="background: #f9f9f9; border-left: 4px solid #9C27B0; padding: 20px; margin: 20px 0;">
        <h3 style="margin-top: 0;">${data.bookTitle}</h3>
        <p><strong>${data.commenterName}:</strong></p>
        <p style="white-space: pre-wrap; background: #fff; padding: 15px; margin-top: 10px;">${data.message}</p>
      </div>
      <p><a href="${FRONTEND_URL}dashboard#comment-${data.discussionId}" style="background: #9C27B0; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View & Reply</a></p>
      <p style="color: #666; font-size: 14px;">This is an automated notification from BR Publications.</p>
    </div>`;

    const template = await templateService.getTemplate('BOOK_CHAPTER_COMMENT', CommunicationType.EMAIL, {
        name, commenterName: data.commenterName, bookTitle: data.bookTitle,
        message: data.message, isReply: data.isReply ? 'reply' : 'comment',
        chapters: data.chapters || '',
        frontendUrl: FRONTEND_URL
    });
    if (template) { subject = template.subject; html = template.content; }

    await sendEmail(email, subject, html, undefined, EmailCategory.BOOK_CHAPTER);
};

// ─────────────────────────────────────────────
// BOOK CHAPTER PUBLISHED — sent to Author
// ─────────────────────────────────────────────
/**
 * Trigger: Book Chapter is successfully published
 * Template: BOOK_CHAPTER_PUBLISHED
 * Variables: {{authorName}}, {{bookTitle}}, {{isbn}}, {{doi}}, {{publicationDate}}, {{link}}
 */
export const sendBookChapterPublishedEmail = async (
    email: string,
    data: {
        authorName: string;
        bookTitle: string;
        isbn: string;
        doi: string;
        editors?: string | string[];
        keywords?: string | string[];
        publicationDate: string;
        link: string;
    }
): Promise<void> => {
    const keywordsStr = Array.isArray(data.keywords) ? data.keywords.join(', ') : (data.keywords || 'N/A');
    const editorsStr = Array.isArray(data.editors) ? data.editors.join(', ') : (data.editors || 'N/A');
    let subject = `Congratulations! Your Book Chapter Published: ${data.bookTitle}`;
    let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Hello ${data.authorName},</h2>
      <p style="font-size: 18px;">🎉 Congratulations! Your book chapter has been published.</p>
      <div style="background: #f9f9f9; border-left: 4px solid #4CAF50; padding: 20px; margin: 20px 0;">
        <h3 style="margin-top: 0;">${data.bookTitle}</h3>
        <p><strong>ISBN:</strong> ${data.isbn}</p>
        <p><strong>DOI:</strong> ${data.doi}</p>
        <p><strong>Editors:</strong> ${editorsStr}</p>
        <p><strong>Keywords:</strong> ${keywordsStr}</p>
        <p><strong>Publication Date:</strong> ${data.publicationDate}</p>
      </div>
      <p><a href="${FRONTEND_URL}product/find/${data.isbn}" style="background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Publication</a></p>
      <p style="color: #666; font-size: 14px;">This is an automated notification from BR Publications.</p>
    </div>`;

    const template = await templateService.getTemplate('BOOK_CHAPTER_PUBLISHED', CommunicationType.EMAIL, {
        authorName: data.authorName,
        bookTitle: data.bookTitle,
        isbn: data.isbn,
        doi: data.doi,
        editors: editorsStr,
        keywords: keywordsStr,
        publicationDate: data.publicationDate,
        link: data.link
    });

    if (template) {
        subject = template.subject;
        html = template.content;
    }

    await sendEmail(email, subject, html, undefined, EmailCategory.BOOK_CHAPTER);
};

// ─────────────────────────────────────────────
// REVIEWER RESPONSE — sent to Editor/Admin
// ─────────────────────────────────────────────
/**
 * Trigger: Reviewer accepts or declines an assignment
 * Template: BOOK_CHAPTER_REVIEWER_ASSIGNMENT_RESPONSE
 * Variables: {{userName}}, {{reviewerName}}, {{action}}, {{bookTitle}}, {{chapterTitle}}, {{reasonSection}}, {{submissionId}}, {{frontendUrl}}
 */
export const sendBookChapterReviewerResponseEmail = async (
    email: string,
    userName: string,
    data: {
        reviewerName: string;
        action: 'Accepted' | 'Declined';
        bookTitle: string;
        chapterTitle: string;
        reason?: string;
        submissionId: number;
    }
): Promise<void> => {
    let subject = `Reviewer Assignment ${data.action}: ${data.bookTitle}`;

    const reasonSection = data.reason ? `
    <tr>
        <td style="padding:12px 0;">
            <span style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Reason for Declining</span><br />
            <span style="color:#ef4444;font-size:15px;">${data.reason}</span>
        </td>
    </tr>` : '';

    let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Hello ${userName},</h2>
      <p>Reviewer <strong>${data.reviewerName}</strong> has <strong>${data.action.toLowerCase()}</strong> the assignment for a chapter.</p>
      <div style="background: #f9f9f9; border-left: 4px solid #2563eb; padding: 20px; margin: 20px 0;">
        <p><strong>Book:</strong> ${data.bookTitle}</p>
        <p><strong>Chapter:</strong> ${data.chapterTitle}</p>
        ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ''}
      </div>
      <p><a href="${FRONTEND_URL}admin/book-chapter/submissions/${data.submissionId}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Submission</a></p>
      <p style="color: #666; font-size: 14px;">This is an automated notification from BR Publications.</p>
    </div>`;

    const template = await templateService.getTemplate('BOOK_CHAPTER_REVIEWER_ASSIGNMENT_RESPONSE', CommunicationType.EMAIL, {
        userName,
        reviewerName: data.reviewerName,
        action: data.action,
        bookTitle: data.bookTitle,
        chapterTitle: data.chapterTitle,
        reasonSection,
        submissionId: data.submissionId,
        frontendUrl: FRONTEND_URL
    });

    if (template) {
        subject = template.subject;
        html = template.content;
    }

    await sendEmail(email, subject, html, undefined, EmailCategory.BOOK_CHAPTER);
};

// ─────────────────────────────────────────────
// REVIEW SUBMITTED — sent to Editor
// ─────────────────────────────────────────────
/**
 * Trigger: Reviewer completes their review
 * Template: BOOK_CHAPTER_REVIEW_SUBMITTED
 * Variables: {{editorName}}, {{reviewerName}}, {{bookTitle}}, {{chapterTitle}}, {{recommendation}}, {{frontendUrl}}, {{currentYear}}
 */
export const sendBookChapterReviewSubmittedEmail = async (
    email: string,
    editorName: string,
    data: {
        reviewerName: string;
        bookTitle: string;
        chapterTitle: string;
        recommendation: string;
        submissionId: number;
    }
): Promise<void> => {
    let subject = `Review Submitted: ${data.chapterTitle}`;
    let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Hello ${editorName},</h2>
      <p>Reviewer <strong>${data.reviewerName}</strong> has completed their review for a chapter.</p>
      <div style="background: #f9f9f9; border-left: 4px solid #6366f1; padding: 20px; margin: 20px 0;">
        <p><strong>Book:</strong> ${data.bookTitle}</p>
        <p><strong>Chapter:</strong> ${data.chapterTitle}</p>
        <p><strong>Recommendation:</strong> ${data.recommendation}</p>
      </div>
      <p><a href="${FRONTEND_URL}admin/book-chapter/submissions/${data.submissionId}" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Review</a></p>
      <p style="color: #666; font-size: 14px;">This is an automated notification from BR Publications.</p>
    </div>`;

    const template = await templateService.getTemplate('BOOK_CHAPTER_REVIEW_SUBMITTED', CommunicationType.EMAIL, {
        editorName,
        reviewerName: data.reviewerName,
        bookTitle: data.bookTitle,
        chapterTitle: data.chapterTitle,
        recommendation: data.recommendation,
        frontendUrl: FRONTEND_URL,
        currentYear: new Date().getFullYear()
    });

    if (template) {
        subject = template.subject;
        html = template.content;
    }

    await sendEmail(email, subject, html, undefined, EmailCategory.BOOK_CHAPTER);
};

// ─────────────────────────────────────────────
// ALL REVIEWS COMPLETED — sent to Editor
// ─────────────────────────────────────────────
/**
 * Trigger: All reviewers have completed their reviews
 * Template: BOOK_CHAPTER_ALL_REVIEWS_COMPLETED
 * Variables: {{editorName}}, {{bookTitle}}, {{chapters}}, {{authorName}}, {{reviewSummary}}, {{frontendUrl}}, {{currentYear}}
 */
export const sendBookChapterAllReviewsCompletedEmail = async (
    email: string,
    editorName: string,
    data: {
        bookTitle: string;
        chapters: string;
        authorName: string;
        reviewSummaryHtml: string;
        submissionId: number;
    }
): Promise<void> => {
    let subject = `All Reviews Completed: ${data.bookTitle}`;
    let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Hello ${editorName},</h2>
      <p>All assigned reviews for the book <strong>${data.bookTitle}</strong> have been completed.</p>
      <div style="background: #f9f9f9; border-left: 4px solid #6366f1; padding: 20px; margin: 20px 0;">
        <p><strong>Chapters:</strong> ${data.chapters}</p>
        <p><strong>Author:</strong> ${data.authorName}</p>
      </div>
      <p>Please log in to the editor dashboard to make your final decision.</p>
      <p><a href="${FRONTEND_URL}admin/book-chapter/submissions/${data.submissionId}" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">View Submission</a></p>
      <p style="color: #666; font-size: 14px;">This is an automated notification from BR Publications.</p>
    </div>`;

    const template = await templateService.getTemplate('BOOK_CHAPTER_ALL_REVIEWS_COMPLETED', CommunicationType.EMAIL, {
        editorName,
        bookTitle: data.bookTitle,
        chapters: data.chapters,
        authorName: data.authorName,
        reviewSummary: data.reviewSummaryHtml,
        frontendUrl: FRONTEND_URL,
        currentYear: new Date().getFullYear()
    });

    if (template) {
        subject = template.subject;
        html = template.content;
    }

    await sendEmail(email, subject, html, undefined, EmailCategory.BOOK_CHAPTER);
};

// ─────────────────────────────────────────────
// PEER REVIEW COMPLETED CONSOLIDATED — sent to Editor
// ─────────────────────────────────────────────
/**
 * Trigger: All individual chapters for a submission reach EDITORIAL_REVIEW
 * Template: BOOK_CHAPTER_PEER_REVIEW_COMPLETED_EDITOR
 */
export const sendBookChapterPeerReviewCompletedEditorEmail = async (
    email: string,
    editorName: string,
    data: {
        bookTitle: string;
        chapters: string[];  // Array of strings to render as list
        submissionId: number;
    }
): Promise<void> => {
    let subject = `Action Required: Peer Review Completed for All Chapters - ${data.bookTitle}`;

    const chaptersHtmlList = data.chapters.map(ch => `<li>${ch}</li>`).join('');

    let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #6366f1;">Hello ${editorName},</h2>
      <p>The peer review process has been successfully completed for all submitted chapters of the following book:</p>
      
      <div style="background: #f8fafc; border-left: 4px solid #6366f1; padding: 20px; margin: 20px 0; border-radius: 4px;">
        <h3 style="margin-top: 0; color: #1e293b;">${data.bookTitle}</h3>
        <p style="margin-bottom: 5px;"><strong>Completed Chapters:</strong></p>
        <ul style="margin-top: 0; line-height: 1.5; padding-left: 20px; color: #475569;">
          ${chaptersHtmlList}
        </ul>
      </div>
      
      <p>As the assigned editor, please log in to your dashboard to review the feedback and make your editorial decisions for the chapters.</p>
      
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin-top: 30px;" />
      <p style="color: #94a3b8; font-size: 13px; text-align: center;">This is an automated notification from BR Publications.</p>
    </div>`;

    const template = await templateService.getTemplate('BOOK_CHAPTER_PEER_REVIEW_COMPLETED_EDITOR', CommunicationType.EMAIL, {
        editorName,
        bookTitle: data.bookTitle,
        chaptersHtmlList,
        frontendUrl: FRONTEND_URL,
        submissionId: data.submissionId,
        currentYear: new Date().getFullYear()
    });

    if (template) {
        subject = template.subject;
        html = template.content;
    }

    await sendEmail(email, subject, html, undefined, EmailCategory.BOOK_CHAPTER);
};

// ─────────────────────────────────────────────
// PROOF EDITING STARTED — sent to Author
// ─────────────────────────────────────────────
/**
 * Trigger: Editor/Admin starts proof editing (ISBN applied)
 * Template: BOOK_CHAPTER_PROOF_EDITING_STARTED
 * Variables: {{name}}, {{bookTitle}}, {{editorName}}, {{notes}}, {{frontendUrl}}, {{currentYear}}
 */
export const sendBookChapterProofEditingStartedEmail = async (
    email: string,
    name: string,
    data: {
        bookTitle: string;
        editorName: string;
        notes: string;
        submissionId: number;
    }
): Promise<void> => {
    let subject = `Proof Editing Started: ${data.bookTitle}`;
    let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Hello ${name},</h2>
      <p>Proof editing has started for your submission.</p>
      <div style="background: #f9f9f9; border-left: 4px solid #6366f1; padding: 20px; margin: 20px 0;">
        <h3 style="margin-top: 0;">${data.bookTitle}</h3>
        <p><strong>Editor:</strong> ${data.editorName}</p>
        <div style="background: #fff; padding: 15px; margin-top: 15px; border: 1px solid #ddd;">
            <strong>Editor's message:</strong>
            <p style="white-space: pre-wrap;">${data.notes}</p>
        </div>
      </div>
    </div>`;

    const template = await templateService.getTemplate('BOOK_CHAPTER_PROOF_EDITING_STARTED', CommunicationType.EMAIL, {
        name,
        bookTitle: data.bookTitle,
        editorName: data.editorName,
        notes: data.notes,
        frontendUrl: FRONTEND_URL,
        currentYear: new Date().getFullYear().toString()
    });
    if (template) { subject = template.subject; html = template.content; }

    await sendEmail(email, subject, html, undefined, EmailCategory.BOOK_CHAPTER);
};

/**
 * Helper: Notifies both the submitter and the corresponding author that proof editing has started.
 */
export const notifyAuthorsProofEditing = async (
    submission: import('../../models/bookChapterSubmission').default,
    submitter: import('../../models/user').default | null,
    data: {
        bookTitle: string;
        editorName: string;
        notes: string;
    }
) => {
    const sent = new Set<string>();

    const sendIfNew = async (email: string, name: string) => {
        const key = email.toLowerCase().trim();
        if (sent.has(key)) return;
        sent.add(key);
        await sendBookChapterProofEditingStartedEmail(email, name, {
            ...data,
            submissionId: submission.id
        });
    };

    // 1. Submitter
    if (submitter?.email) {
        await sendIfNew(submitter.email, submitter.fullName);
    }

    // 2. Corresponding author
    const correspondingAuthor = submission.getCorrespondingAuthor();
    if (correspondingAuthor?.email) {
        const name = `${correspondingAuthor.firstName} ${correspondingAuthor.lastName}`;
        await sendIfNew(correspondingAuthor.email, name);
    }
};

// ─────────────────────────────────────────────
// DELIVERY DETAILS REQUESTED — sent to Author
// ─────────────────────────────────────────────
/**
 * Trigger: Editor/Admin records ISBN (publication initiated)
 * Template: BOOK_CHAPTER_DELIVERY_DETAILS_REQUESTED
 * Variables: {{name}}, {{bookTitle}}, {{chapters}}, {{notes}}, {{frontendUrl}}, {{currentYear}}
 */
export const sendBookChapterDeliveryDetailsRequestEmail = async (
    email: string,
    name: string,
    data: {
        bookTitle: string;
        chapters: string;
        notes: string;
        submissionId: number;
    }
): Promise<void> => {
    let subject = `Delivery Details Required: ${data.bookTitle}`;
    let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Hello ${name},</h2>
      <p>Publication has been initiated for your submission. Please submit your delivery address.</p>
      <div style="background: #f9f9f9; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0;">
        <h3 style="margin-top: 0;">${data.bookTitle}</h3>
        <p><strong>Chapters:</strong> ${data.chapters}</p>
        <div style="background: #fff; padding: 15px; margin-top: 15px; border: 1px solid #ddd;">
            <strong>Editor's message:</strong>
            <p style="white-space: pre-wrap;">${data.notes}</p>
        </div>
      </div>
      <p><a href="${FRONTEND_URL}dashboard" style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Go to Dashboard</a></p>
    </div>`;

    const template = await templateService.getTemplate('BOOK_CHAPTER_DELIVERY_DETAILS_REQUESTED', CommunicationType.EMAIL, {
        name,
        bookTitle: data.bookTitle,
        chapters: data.chapters,
        notes: data.notes,
        frontendUrl: FRONTEND_URL,
        currentYear: new Date().getFullYear().toString()
    });
    if (template) { subject = template.subject; html = template.content; }

    await sendEmail(email, subject, html, undefined, EmailCategory.BOOK_CHAPTER);
};

/**
 * Helper: Notifies both the submitter and the corresponding author that delivery details are requested.
 */
export const notifyAuthorsDeliveryDetailsRequested = async (
    submission: import('../../models/bookChapterSubmission').default,
    submitter: import('../../models/user').default | null,
    data: {
        bookTitle: string;
        chapters: string;
        notes: string;
    }
) => {
    const sent = new Set<string>();

    const sendIfNew = async (email: string, name: string) => {
        const key = email.toLowerCase().trim();
        if (sent.has(key)) return;
        sent.add(key);
        await sendBookChapterDeliveryDetailsRequestEmail(email, name, {
            ...data,
            submissionId: submission.id
        });
    };

    // 1. Submitter
    if (submitter?.email) {
        await sendIfNew(submitter.email, submitter.fullName);
    }

    // 2. Corresponding author
    const correspondingAuthor = submission.getCorrespondingAuthor();
    if (correspondingAuthor?.email) {
        const name = `${correspondingAuthor.firstName} ${correspondingAuthor.lastName}`;
        await sendIfNew(correspondingAuthor.email, name);
    }
};

// ─────────────────────────────────────────────
// DELIVERY DETAILS SUBMITTED — sent to Admin/Editor
// ─────────────────────────────────────────────
/**
 * Trigger: Author submits delivery details
 * Template: BOOK_CHAPTER_DELIVERY_DETAILS_SUBMITTED
 * Variables: {{name}}, {{authorName}}, {{bookTitle}}, {{frontendUrl}}, {{currentYear}}
 */
export const sendBookChapterDeliveryDetailsSubmittedEmail = async (
    email: string,
    name: string,
    data: {
        authorName: string;
        bookTitle: string;
        submissionId: number;
    }
): Promise<void> => {
    let subject = `Delivery Details Submitted: ${data.bookTitle}`;
    let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Hello ${name},</h2>
      <p>The author <strong>${data.authorName}</strong> has submitted the delivery details for the book <strong>${data.bookTitle}</strong>.</p>
      <div style="background: #f9f9f9; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0;">
        <h3 style="margin-top: 0;">${data.bookTitle}</h3>
        <p><strong>Author:</strong> ${data.authorName}</p>
      </div>
      <p>You can now proceed to publish the book chapter.</p>
      <p><a href="${FRONTEND_URL}dashboard" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Review Submission</a></p>
    </div>`;

    const template = await templateService.getTemplate('BOOK_CHAPTER_DELIVERY_DETAILS_SUBMITTED', CommunicationType.EMAIL, {
        name,
        authorName: data.authorName,
        bookTitle: data.bookTitle,
        frontendUrl: FRONTEND_URL,
        currentYear: new Date().getFullYear().toString()
    });
    if (template) { subject = template.subject; html = template.content; }

    await sendEmail(email, subject, html, undefined, EmailCategory.BOOK_CHAPTER);
};
