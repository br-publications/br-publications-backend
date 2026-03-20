export const BOOK_CHAPTER_TEMPLATES = {
    BOOK_CHAPTER_SUBMISSION_RECEIVED: {
        subject: 'Chapter Submission Received: {{bookTitle}}',
        variables: ['name', 'bookTitle', 'submissionDate', 'currentYear'],
        content: `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Chapter Submission Received</title>
</head>

<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 20px;">
        <tr>
            <td align="center">

                <table width="600" cellpadding="0" cellspacing="0"
                    style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;">

                    <!-- Header -->
                    <tr>
                        <td
                            style="background:linear-gradient(135deg,#1e3a6e,#2563eb);padding:36px 40px;text-align:center;">
                            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">BR Publications</h1>
                            <p style="margin:8px 0 0;color:#bfdbfe;font-size:14px;">Submission Confirmation</p>
                        </td>
                    </tr>

                    <!-- Banner -->
                    <tr>
                        <td
                            style="background:#ecfdf5;border-bottom:3px solid #10b981;padding:16px 40px;text-align:center;">
                            <p style="margin:0;color:#047857;font-size:15px;font-weight:600;">
                                ✅ Your Book Chapter Submission Has Been Received
                            </p>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding:36px 40px;">

                            <p style="margin:0 0 18px;color:#374151;font-size:15px;">
                                Hello <strong>{{name}}</strong>,
                            </p>

                            <p style="margin:0 0 20px;color:#6b7280;font-size:14px;line-height:1.6;">
                                Thank you for submitting your chapter for the book titled
                                <strong>{{bookTitle}}</strong>. We have successfully received your submission.
                            </p>

                            <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6;">
                                Our editorial team will review your chapter according to our publication and editorial
                                guidelines.
                                If your submission progresses to the next stage of the review process or if additional
                                information is required,
                                our team will contact you.
                            </p>

                            <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6;">
                                We appreciate the effort and research that goes into preparing academic content and
                                thank you for considering
                                <strong>BR Publications</strong> as your publishing partner.
                            </p>

                            <!-- Details -->
                            <table width="100%" cellpadding="0" cellspacing="0"
                                style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
                                <tr>
                                    <td style="padding:24px">

                                        <table width="100%" cellpadding="0" cellspacing="0">

                                            <tr>
                                                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
                                                    <span
                                                        style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">
                                                        Book Title
                                                    </span><br />
                                                    <span style="color:#111827;font-size:15px;">{{bookTitle}}</span>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td style="padding:10px 0;">
                                                    <span
                                                        style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">
                                                        Submission Date
                                                    </span><br />
                                                    <span
                                                        style="color:#111827;font-size:15px;">{{submissionDate}}</span>
                                                </td>
                                            </tr>

                                        </table>

                                    </td>
                                </tr>
                            </table>

                            <p style="margin:0;color:#6b7280;font-size:14px;">
                                We appreciate your contribution and look forward to reviewing your work.
                            </p>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td
                            style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">

                            <p style="margin:0;color:#9ca3af;font-size:12px;">
                                This is an automated confirmation from <strong>BR Publications</strong>.
                            </p>

                            <p style="margin-top:12px;color:#9ca3af;font-size:12px;">
                                © {{currentYear}} BR Publications. All rights reserved.
                            </p>

                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>

</html>
`
    },
    BOOK_CHAPTER_SUBMISSION_ADMIN: {
        subject: 'New Chapter Submission: {{bookTitle}}',
        variables: ['adminName', 'authorName', 'bookTitle', 'chapters', 'submissionDate', 'currentYear'],
        content: `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>New Chapter Submission</title>
</head>

<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 20px;">
        <tr>
            <td align="center">

                <table width="600" cellpadding="0" cellspacing="0"
                    style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;">

                    <!-- Header -->
                    <tr>
                        <td
                            style="background:linear-gradient(135deg,#1e3a6e,#2563eb);padding:36px 40px;text-align:center;">
                            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">BR Publications</h1>
                            <p style="margin:8px 0 0;color:#bfdbfe;font-size:14px;">Admin Notification System</p>
                        </td>
                    </tr>

                    <!-- Banner -->
                    <tr>
                        <td
                            style="background:#eff6ff;border-bottom:3px solid #2563eb;padding:16px 40px;text-align:center;">
                            <p style="margin:0;color:#1d4ed8;font-size:15px;font-weight:600;">
                                📑 New Book Chapter Submission Received
                            </p>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding:36px 40px;">

                            <p style="margin:0 0 18px;color:#374151;font-size:15px;">
                                Hello <strong>{{adminName}}</strong>,
                            </p>

                            <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6;">
                                A new chapter submission has been received from <strong>{{authorName}}</strong> for the
                                book
                                <strong>{{bookTitle}}</strong>. Please review the submission details below.
                            </p>

                            <!-- Details Card -->
                            <table width="100%" cellpadding="0" cellspacing="0"
                                style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
                                <tr>
                                    <td style="padding:24px">

                                        <table width="100%" cellpadding="0" cellspacing="0">

                                            <tr>
                                                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
                                                    <span
                                                        style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Author
                                                        Name</span><br />
                                                    <span
                                                        style="color:#111827;font-size:15px;font-weight:600;">{{authorName}}</span>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
                                                    <span
                                                        style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Book
                                                        Title</span><br />
                                                    <span style="color:#111827;font-size:15px;">{{bookTitle}}</span>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
                                                    <span
                                                        style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Submitted
                                                        Chapters</span><br />
                                                    <span style="color:#111827;font-size:15px;">{{chapters}}</span>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td style="padding:10px 0;">
                                                    <span
                                                        style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Submission
                                                        Date</span><br />
                                                    <span
                                                        style="color:#111827;font-size:15px;">{{submissionDate}}</span>
                                                </td>
                                            </tr>

                                        </table>

                                    </td>
                                </tr>
                            </table>

                            <p style="margin:0;color:#6b7280;font-size:14px;">
                                Please log in to the admin dashboard to review and process this chapter submission.
                            </p>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td
                            style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">

                            <p style="margin:0;color:#9ca3af;font-size:12px;">
                                This is an automated notification from <strong>BR Publications</strong>.
                            </p>

                            <p style="margin-top:12px;color:#9ca3af;font-size:12px;">
                                © {{currentYear}} BR Publications. All rights reserved.
                            </p>

                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>

</html>
`
    },
    BOOk_CHAPTER_EDITOR_ASSIGNED: {
        subject: 'Editor Assignment: {{bookTitle}}',
        variables: ['editorName', 'bookTitle', 'assignedBy', 'chapters', 'currentYear'],
        content: `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Editor Assignment</title>
</head>

<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 20px;">
        <tr>
            <td align="center">

                <table width="600" cellpadding="0" cellspacing="0"
                    style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;">

                    <!-- Header -->
                    <tr>
                        <td
                            style="background:linear-gradient(135deg,#1e3a6e,#2563eb);padding:36px 40px;text-align:center;">
                            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">BR Publications</h1>
                            <p style="margin:8px 0 0;color:#bfdbfe;font-size:14px;">Editorial Assignment</p>
                        </td>
                    </tr>

                    <!-- Banner -->
                    <tr>
                        <td
                            style="background:#eff6ff;border-bottom:3px solid #2563eb;padding:16px 40px;text-align:center;">
                            <p style="margin:0;color:#1d4ed8;font-size:15px;font-weight:600;">
                                📝 You Have Been Assigned as Editor
                            </p>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding:36px 40px;">

                            <p style="margin:0 0 18px;color:#374151;font-size:15px;">
                                Hello <strong>{{editorName}}</strong>,
                            </p>

                            <p style="margin:0 0 20px;color:#6b7280;font-size:14px;line-height:1.6;">
                                You have been assigned as the editor for chapter submissions under the book titled
                                <strong>{{bookTitle}}</strong>. This assignment was made by
                                <strong>{{assignedBy}}</strong>.
                            </p>

                            <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6;">
                                As the assigned editor, you will be responsible for reviewing the submitted chapters,
                                providing editorial feedback, and coordinating revisions with the contributing authors
                                when necessary.
                            </p>

                            <!-- Details Card -->
                            <table width="100%" cellpadding="0" cellspacing="0"
                                style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
                                <tr>
                                    <td style="padding:24px">

                                        <table width="100%" cellpadding="0" cellspacing="0">

                                            <tr>
                                                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
                                                    <span
                                                        style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Book
                                                        Title</span><br />
                                                    <span style="color:#111827;font-size:15px;">{{bookTitle}}</span>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
                                                    <span
                                                        style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Assigned
                                                        By</span><br />
                                                    <span style="color:#111827;font-size:15px;">{{assignedBy}}</span>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td style="padding:10px 0;">
                                                    <span
                                                        style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Assigned
                                                        Chapters</span><br />
                                                    <span style="color:#111827;font-size:15px;">{{chapters}}</span>
                                                </td>
                                            </tr>

                                        </table>

                                    </td>
                                </tr>
                            </table>

                            <p style="margin:0;color:#6b7280;font-size:14px;">
                                Please log in to the editorial dashboard to review the assigned chapters and begin the
                                editorial process.
                            </p>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td
                            style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">

                            <p style="margin:0;color:#9ca3af;font-size:12px;">
                                This is an automated notification from <strong>BR Publications</strong>.
                            </p>

                            <p style="margin-top:12px;color:#9ca3af;font-size:12px;">
                                © {{currentYear}} BR Publications. All rights reserved.
                            </p>

                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>

</html>
`
    },
    BOOK_CHAPTER_REVIEWER_ASSIGNED: {
        subject: 'Reviewer Assignment: {{chapterTitle}}',
        variables: ['reviewerName', 'bookTitle', 'chapterTitle', 'assignedBy', 'deadline', 'frontendUrl', 'currentYear'],
        content: `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reviewer Assignment</title>
</head>

<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 20px;">
        <tr>
            <td align="center">

                <table width="600" cellpadding="0" cellspacing="0"
                    style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;">

                    <!-- Header -->
                    <tr>
                        <td
                            style="background:linear-gradient(135deg,#1e3a6e,#2563eb);padding:36px 40px;text-align:center;">
                            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">BR Publications</h1>
                            <p style="margin:8px 0 0;color:#bfdbfe;font-size:14px;">Reviewer Assignment Notification</p>
                        </td>
                    </tr>

                    <!-- Banner -->
                    <tr>
                        <td
                            style="background:#eff6ff;border-bottom:3px solid #2563eb;padding:16px 40px;text-align:center;">
                            <p style="margin:0;color:#1d4ed8;font-size:15px;font-weight:600;">
                                🔎 You Have Been Assigned as a Reviewer
                            </p>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding:36px 40px;">

                            <p style="margin:0 0 18px;color:#374151;font-size:15px;">
                                Hello <strong>{{reviewerName}}</strong>,
                            </p>

                            <p style="margin:0 0 20px;color:#6b7280;font-size:14px;line-height:1.6;">
                                You have been assigned as a reviewer for the book chapter titled <strong>{{chapterTitle}}</strong> 
                                under the book <strong>{{bookTitle}}</strong>.
                            </p>

                            <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6;">
                                This assignment was made by <strong>{{assignedBy}}</strong>. Your expertise and feedback
                                will help ensure the quality and academic integrity of the publication.
                            </p>

                            <!-- Details Card -->
                            <table width="100%" cellpadding="0" cellspacing="0"
                                style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
                                <tr>
                                    <td style="padding:24px">

                                        <table width="100%" cellpadding="0" cellspacing="0">

                                            <tr>
                                                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
                                                    <span
                                                        style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Chapter
                                                        Title</span><br />
                                                    <span style="color:#111827;font-size:15px;font-weight:600;">{{chapterTitle}}</span>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
                                                    <span
                                                        style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Book
                                                        Title</span><br />
                                                    <span style="color:#111827;font-size:15px;">{{bookTitle}}</span>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
                                                    <span
                                                        style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Assigned
                                                        By</span><br />
                                                    <span style="color:#111827;font-size:15px;">{{assignedBy}}</span>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td style="padding:10px 0;">
                                                    <span
                                                        style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Review
                                                        Deadline</span><br />
                                                    <span
                                                        style="color:#111827;font-size:15px;font-weight:600;">{{deadline}}</span>
                                                </td>
                                            </tr>

                                        </table>

                                    </td>
                                </tr>
                            </table>

                            <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">
                                Please log in to the reviewer dashboard to access the assigned manuscript and submit
                                your review before the deadline.
                            </p>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td
                            style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">

                            <p style="margin:0;color:#9ca3af;font-size:12px;">
                                This is an automated notification from <strong>BR Publications</strong>.
                            </p>

                            <p style="margin-top:12px;color:#9ca3af;font-size:12px;">
                                © {{currentYear}} BR Publications. All rights reserved.
                            </p>

                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>

</html>
`
    },
    BOOK_CHAPTER_DECISION_APPROVED: {
        subject: '{{stage}} Approved: {{bookTitle}}',
        variables: ['stage', 'name', 'bookTitle', 'editorNotes', 'frontendUrl', 'currentYear'],
        content: `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{stage}} Approved</title>
</head>

<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 20px;">
        <tr>
            <td align="center">

                <table width="600" cellpadding="0" cellspacing="0"
                    style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;">

                    <!-- Header -->
                    <tr>
                        <td
                            style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:36px 40px;text-align:center;">
                            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">BR Publications</h1>
                            <p style="margin:8px 0 0;color:#d1d5db;font-size:14px;">Approval Notification</p>
                        </td>
                    </tr>

                    <!-- Banner -->
                    <tr>
                        <td
                            style="background:#f0fdf4;border-bottom:3px solid #22c55e;padding:16px 40px;text-align:center;">
                            <p style="margin:0;color:#15803d;font-size:15px;font-weight:600;">
                                🎉 Congratulations! Your {{stage}} has been approved.
                            </p>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding:36px 40px;">

                            <p style="margin:0 0 18px;color:#374151;font-size:15px;">
                                Hello <strong>{{name}}</strong>,
                            </p>

                            <p style="margin:0 0 20px;color:#6b7280;font-size:14px;line-height:1.6;">
                                We are pleased to inform you that your <strong>{{stage}}</strong> for the book titled
                                <strong>{{bookTitle}}</strong> has been <strong>APPROVED</strong>.
                            </p>

                            <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6;">
                                Our editorial team has completed the review process, and we are excited to move forward with
                                your submission.
                            </p>

                            <!-- Details Card -->
                            <table width="100%" cellpadding="0" cellspacing="0"
                                style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
                                <tr>
                                    <td style="padding:24px">

                                        <table width="100%" cellpadding="0" cellspacing="0">

                                            <tr>
                                                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
                                                    <span
                                                        style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Book
                                                        Title</span><br />
                                                    <span style="color:#111827;font-size:15px;">{{bookTitle}}</span>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
                                                    <span
                                                        style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Decision</span><br />
                                                    <span style="color:#22c55e;font-size:15px;font-weight:600;">APPROVED</span>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td style="padding:10px 0;">
                                                    <span
                                                        style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Editor Notes</span><br />
                                                    <span style="color:#111827;font-size:14px;line-height:1.5;white-space:pre-wrap;">{{editorNotes}}</span>
                                                </td>
                                            </tr>

                                        </table>

                                    </td>
                                </tr>
                            </table>

                            <p style="margin:0 0 20px;color:#6b7280;font-size:14px;line-height:1.6;">
                                You can view more details and the next steps by logging into your dashboard.
                            </p>

                            <!-- CTA -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="{{frontendUrl}}/dashboard"
                                            style="background:#2563eb;color:#ffffff;padding:14px 28px;text-decoration:none;border-radius:6px;font-size:14px;font-weight:600;display:inline-block;">
                                            Go to Dashboard
                                        </a>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td
                            style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">

                            <p style="margin:0;color:#9ca3af;font-size:12px;">
                                This is an automated notification from <strong>BR Publications</strong>.
                            </p>

                            <p style="margin-top:12px;color:#9ca3af;font-size:12px;">
                                © {{currentYear}} BR Publications. All rights reserved.
                            </p>

                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>

</html>
`
    },
    BOOK_CHAPTER_DECISION_REJECTED: {
        subject: '{{stage}} Decision: {{bookTitle}}',
        variables: ['stage', 'name', 'bookTitle', 'editorNotes', 'currentYear'],
        content: `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{stage}} Decision</title>
</head>

<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 20px;">
        <tr>
            <td align="center">

                <table width="600" cellpadding="0" cellspacing="0"
                    style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;">

                    <!-- Header -->
                    <tr>
                        <td
                            style="background:linear-gradient(135deg,#6b7280,#374151);padding:36px 40px;text-align:center;">
                            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">BR Publications</h1>
                            <p style="margin:8px 0 0;color:#d1d5db;font-size:14px;">Decision Notification</p>
                        </td>
                    </tr>

                    <!-- Banner -->
                    <tr>
                        <td
                            style="background:#fef2f2;border-bottom:3px solid #ef4444;padding:16px 40px;text-align:center;">
                            <p style="margin:0;color:#b91c1c;font-size:15px;font-weight:600;">
                                Decision update on your {{stage}}
                            </p>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding:36px 40px;">

                            <p style="margin:0 0 18px;color:#374151;font-size:15px;">
                                Hello <strong>{{name}}</strong>,
                            </p>

                            <p style="margin:0 0 20px;color:#6b7280;font-size:14px;line-height:1.6;">
                                Thank you for your interest in publishing with <strong>BR Publications</strong>. We have
                                completed the review of your <strong>{{stage}}</strong> for the book titled
                                <strong>{{bookTitle}}</strong>.
                            </p>

                            <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6;">
                                After careful consideration, we regret to inform you that your submission has been
                                <strong>REJECTED</strong> at this stage.
                            </p>

                            <!-- Details Card -->
                            <table width="100%" cellpadding="0" cellspacing="0"
                                style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
                                <tr>
                                    <td style="padding:24px">

                                        <table width="100%" cellpadding="0" cellspacing="0">

                                            <tr>
                                                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
                                                    <span
                                                        style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Book
                                                        Title</span><br />
                                                    <span style="color:#111827;font-size:15px;">{{bookTitle}}</span>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
                                                    <span
                                                        style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Decision</span><br />
                                                    <span style="color:#ef4444;font-size:15px;font-weight:600;">REJECTED</span>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td style="padding:10px 0;">
                                                    <span
                                                        style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Editor Notes</span><br />
                                                    <span style="color:#111827;font-size:14px;line-height:1.5;white-space:pre-wrap;">{{editorNotes}}</span>
                                                </td>
                                            </tr>

                                        </table>

                                    </td>
                                </tr>
                            </table>

                            <p style="margin:0;color:#6b7280;font-size:14px;">
                                We appreciate the time and effort you put into your submission.
                            </p>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td
                            style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">

                            <p style="margin:0;color:#9ca3af;font-size:12px;">
                                This is an automated notification from <strong>BR Publications</strong>.
                            </p>

                            <p style="margin-top:12px;color:#9ca3af;font-size:12px;">
                                © {{currentYear}} BR Publications. All rights reserved.
                            </p>

                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>

</html>
`
    },
    BOOK_CHAPTER_REVIEWER_ASSIGNMENT_RESPONSE: {
        subject: 'Reviewer Assignment {{action}}: {{bookTitle}}',
        variables: ['action', 'bookTitle', 'userName', 'reviewerName', 'chapterTitle', 'reasonSection', 'currentYear'],
        content: `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reviewer Assignment {{action}}</title>
</head>

<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 20px;">
        <tr>
            <td align="center">

                <table width="600" cellpadding="0" cellspacing="0"
                    style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;">

                    <!-- Header -->
                    <tr>
                        <td
                            style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:36px 40px;text-align:center;">
                            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">BR Publications</h1>
                            <p style="margin:8px 0 0;color:#d1d5db;font-size:14px;">Review Assignment Update</p>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding:40px;">
                            <h2 style="margin:0 0 16px;color:#111827;font-size:18px;font-weight:700;">Hello {{userName}},</h2>
                            <p style="margin:0 0 20px;color:#4b5563;font-size:15px;line-height:1.6;">
                                Reviewer <strong>{{reviewerName}}</strong> has <strong>{{action}}</strong> the assignment for a chapter.
                            </p>

                            <table width="100%" cellpadding="0" cellspacing="0"
                                style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
                                <tr>
                                    <td style="padding:20px;">
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding-bottom:12px;border-bottom:1px solid #e2e8f0;">
                                                    <span style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Book</span><br />
                                                    <span style="color:#111827;font-size:15px;font-weight:600;">{{bookTitle}}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding:12px 0;border-bottom:1px solid #e2e8f0;">
                                                    <span style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Chapter</span><br />
                                                    <span style="color:#111827;font-size:15px;">{{chapterTitle}}</span>
                                                </td>
                                            </tr>
                                            {{reasonSection}}
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
                            <p style="margin:0;color:#9ca3af;font-size:12px;">
                                This is an automated notification from <strong>BR Publications</strong>.
                            </p>
                            <p style="margin-top:12px;color:#9ca3af;font-size:12px;">
                                © {{currentYear}} BR Publications. All rights reserved.
                            </p>
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>

</html>
`
    },
    BOOK_CHAPTER_REVISION_REQUESTED: {
        subject: 'Revision Requested: {{chapterTitle}}',
        variables: ['chapterTitle', 'name', 'bookTitle', 'revisionNumber', 'reviewerComments', 'currentYear'],
        content: `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Revision Requested</title>
</head>

<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 20px;">
        <tr>
            <td align="center">

                <table width="600" cellpadding="0" cellspacing="0"
                    style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;">

                    <!-- Header -->
                    <tr>
                        <td
                            style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:36px 40px;text-align:center;">
                            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">BR Publications</h1>
                            <p style="margin:8px 0 0;color:#fef3c7;font-size:14px;">Revision Requested</p>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding:40px;">
                            <h2 style="margin:0 0 16px;color:#111827;font-size:18px;font-weight:700;">Hello {{name}},</h2>
                            <p style="margin:0 0 20px;color:#4b5563;font-size:15px;line-height:1.6;">
                                A revision has been requested for your chapter submission. Please review the comments below and submit a revised manuscript through your dashboard.
                            </p>

                            <table width="100%" cellpadding="0" cellspacing="0"
                                style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;margin-bottom:24px;">
                                <tr>
                                    <td style="padding:20px;">
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding-bottom:12px;border-bottom:1px solid #fed7aa;">
                                                    <span style="color:#9a3412;font-size:12px;font-weight:600;text-transform:uppercase;">Book Title</span><br />
                                                    <span style="color:#111827;font-size:15px;font-weight:600;">{{bookTitle}}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding:12px 0;border-bottom:1px solid #fed7aa;">
                                                    <span style="color:#9a3412;font-size:12px;font-weight:600;text-transform:uppercase;">Chapter Title</span><br />
                                                    <span style="color:#111827;font-size:15px;">{{chapterTitle}}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding:12px 0;border-bottom:1px solid #fed7aa;">
                                                    <span style="color:#9a3412;font-size:12px;font-weight:600;text-transform:uppercase;">Revision Number</span><br />
                                                    <span style="color:#111827;font-size:15px;">Revision {{revisionNumber}}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding-top:12px;">
                                                    <span style="color:#9a3412;font-size:12px;font-weight:600;text-transform:uppercase;">Reviewer Comments</span><br />
                                                    <p style="margin:8px 0 0;color:#111827;font-size:14px;line-height:1.5;white-space:pre-wrap;">{{reviewerComments}}</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">
                                You can access your submission and upload the revised manuscript by logging into the <strong>BR Publications Dashboard</strong>.
                            </p>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
                            <p style="margin:0;color:#9ca3af;font-size:12px;">
                                This is an automated notification from <strong>BR Publications</strong>.
                            </p>
                            <p style="margin-top:12px;color:#9ca3af;font-size:12px;">
                                © {{currentYear}} BR Publications. All rights reserved.
                            </p>
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>

</html>
`
    },
    BOOK_CHAPTER_REVISION_SUBMITTED: {
        subject: 'Revision Submitted: {{chapterTitle}}',
        variables: ['chapterTitle', 'userName', 'authorName', 'bookTitle', 'revisionNumber', 'currentYear'],
        content: `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Revision Submitted</title>
</head>

<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 20px;">
        <tr>
            <td align="center">

                <table width="600" cellpadding="0" cellspacing="0"
                    style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;">

                    <!-- Header -->
                    <tr>
                        <td
                            style="background:linear-gradient(135deg,#10b981,#059669);padding:36px 40px;text-align:center;">
                            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">BR Publications</h1>
                            <p style="margin:8px 0 0;color:#d1fae5;font-size:14px;">Revision Submitted</p>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding:40px;">
                            <h2 style="margin:0 0 16px;color:#111827;font-size:18px;font-weight:700;">Hello {{userName}},</h2>
                            <p style="margin:0 0 20px;color:#4b5563;font-size:15px;line-height:1.6;">
                                Author <strong>{{authorName}}</strong> has submitted a revised manuscript for a chapter.
                            </p>

                            <table width="100%" cellpadding="0" cellspacing="0"
                                style="background:#f0fdf4;border:1px solid #d1fae5;border-radius:8px;margin-bottom:24px;">
                                <tr>
                                    <td style="padding:20px;">
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding-bottom:12px;border-bottom:1px solid #d1fae5;">
                                                    <span style="color:#065f46;font-size:12px;font-weight:600;text-transform:uppercase;">Book Title</span><br />
                                                    <span style="color:#111827;font-size:15px;font-weight:600;">{{bookTitle}}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding:12px 0;border-bottom:1px solid #d1fae5;">
                                                    <span style="color:#065f46;font-size:12px;font-weight:600;text-transform:uppercase;">Chapter Title</span><br />
                                                    <span style="color:#111827;font-size:15px;">{{chapterTitle}}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding-top:12px;">
                                                    <span style="color:#065f46;font-size:12px;font-weight:600;text-transform:uppercase;">Revision Number</span><br />
                                                    <span style="color:#111827;font-size:15px;">Revision {{revisionNumber}}</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">
                                Please log in to the <strong>BR Publications Admin Dashboard</strong> to review the submitted revision and coordinate next steps.
                            </p>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
                            <p style="margin:0;color:#9ca3af;font-size:12px;">
                                This is an automated notification from <strong>BR Publications</strong>.
                            </p>
                            <p style="margin-top:12px;color:#9ca3af;font-size:12px;">
                                © {{currentYear}} BR Publications. All rights reserved.
                            </p>
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>

</html>
`
    },
    BOOK_CHAPTER_REVISION_SUBMITTED_REVIEWER: {
        subject: 'Revision Submitted: {{chapterTitle}}',
        variables: ['userName', 'authorName', 'bookTitle', 'chapterTitle', 'revisionNumber', 'frontendUrl', 'currentYear'],
        content: `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Revision Submitted</title>
</head>

<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 20px;">
        <tr>
            <td align="center">

                <table width="600" cellpadding="0" cellspacing="0"
                    style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;">

                    <!-- Header -->
                    <tr>
                        <td
                            style="background:linear-gradient(135deg,#10b981,#059669);padding:36px 40px;text-align:center;">
                            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">BR Publications</h1>
                            <p style="margin:8px 0 0;color:#d1fae5;font-size:14px;">Revision Submitted</p>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding:40px;">
                            <h2 style="margin:0 0 16px;color:#111827;font-size:18px;font-weight:700;">Hello {{userName}},</h2>
                            <p style="margin:0 0 20px;color:#4b5563;font-size:15px;line-height:1.6;">
                                Author <strong>{{authorName}}</strong> has submitted a revised manuscript for a chapter.
                            </p>

                            <table width="100%" cellpadding="0" cellspacing="0"
                                style="background:#f0fdf4;border:1px solid #d1fae5;border-radius:8px;margin-bottom:24px;">
                                <tr>
                                    <td style="padding:20px;">
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding-bottom:12px;border-bottom:1px solid #d1fae5;">
                                                    <span style="color:#065f46;font-size:12px;font-weight:600;text-transform:uppercase;">Book Title</span><br />
                                                    <span style="color:#111827;font-size:15px;font-weight:600;">{{bookTitle}}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding:12px 0;border-bottom:1px solid #d1fae5;">
                                                    <span style="color:#065f46;font-size:12px;font-weight:600;text-transform:uppercase;">Chapter Title</span><br />
                                                    <span style="color:#111827;font-size:15px;">{{chapterTitle}}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding-top:12px;">
                                                    <span style="color:#065f46;font-size:12px;font-weight:600;text-transform:uppercase;">Revision Number</span><br />
                                                    <span style="color:#111827;font-size:15px;">Revision {{revisionNumber}}</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">
                                Please log in to the <strong>BR Publications Reviewer Dashboard</strong> to review the submitted revision and coordinate next steps.
                            </p>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
                            <p style="margin:0;color:#9ca3af;font-size:12px;">
                                This is an automated notification from <strong>BR Publications</strong>.
                            </p>
                            <p style="margin-top:12px;color:#9ca3af;font-size:12px;">
                                © {{currentYear}} BR Publications. All rights reserved.
                            </p>
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>

</html>
`
    },
    BOOK_CHAPTER_REVISION_SUBMITTED_REVIEWER_V2: {
        subject: 'Revision Submitted: {{chapterTitle}}',
        variables: ['userName', 'authorName', 'bookTitle', 'chapterTitle', 'revisionNumber', 'authorMessage', 'frontendUrl', 'currentYear'],
        content: `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Revision Submitted</title>
</head>

<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 20px;">
        <tr>
            <td align="center">

                <table width="600" cellpadding="0" cellspacing="0"
                    style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;">

                    <!-- Header -->
                    <tr>
                        <td
                            style="background:linear-gradient(135deg,#10b981,#059669);padding:36px 40px;text-align:center;">
                            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">BR Publications</h1>
                            <p style="margin:8px 0 0;color:#d1fae5;font-size:14px;">Revision Submitted</p>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding:40px;">
                            <h2 style="margin:0 0 16px;color:#111827;font-size:18px;font-weight:700;">Hello {{userName}},</h2>
                            <p style="margin:0 0 20px;color:#4b5563;font-size:15px;line-height:1.6;">
                                Author <strong>{{authorName}}</strong> has submitted a revised manuscript for a chapter.
                            </p>

                            <table width="100%" cellpadding="0" cellspacing="0"
                                style="background:#f0fdf4;border:1px solid #d1fae5;border-radius:8px;margin-bottom:24px;">
                                <tr>
                                    <td style="padding:20px;">
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding-bottom:12px;border-bottom:1px solid #d1fae5;">
                                                    <span style="color:#065f46;font-size:12px;font-weight:600;text-transform:uppercase;">Book Title</span><br />
                                                    <span style="color:#111827;font-size:15px;font-weight:600;">{{bookTitle}}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding:12px 0;border-bottom:1px solid #d1fae5;">
                                                    <span style="color:#065f46;font-size:12px;font-weight:600;text-transform:uppercase;">Chapter Title</span><br />
                                                    <span style="color:#111827;font-size:15px;">{{chapterTitle}}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding-top:12px;">
                                                    <span style="color:#065f46;font-size:12px;font-weight:600;text-transform:uppercase;">Revision Number</span><br />
                                                    <span style="color:#111827;font-size:15px;">Revision {{revisionNumber}}</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            <div style="margin:0 0 24px;padding:16px;background:#f9fafb;border-left:4px solid #10b981;border-radius:4px;">
                                <p style="margin:0 0 8px;color:#374151;font-size:14px;font-weight:600;">Author Message:</p>
                                <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.6;white-space:pre-wrap;">{{authorMessage}}</p>
                            </div>

                            <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">
                                Please log in to the <strong>BR Publications Reviewer Dashboard</strong> to review the submitted revision and coordinate next steps.
                            </p>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
                            <p style="margin:0;color:#9ca3af;font-size:12px;">
                                This is an automated notification from <strong>BR Publications</strong>.
                            </p>
                            <p style="margin-top:12px;color:#9ca3af;font-size:12px;">
                                © {{currentYear}} BR Publications. All rights reserved.
                            </p>
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>

</html>
`
    },
    BOOK_CHAPTER_REVIEW_SUBMITTED: {
        subject: 'Review Submitted: {{chapterTitle}}',
        variables: ['editorName', 'reviewerName', 'bookTitle', 'chapterTitle', 'recommendation', 'frontendUrl', 'currentYear'],
        content: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Review Submitted</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;">
                    <tr>
                        <td style="background:linear-gradient(135deg,#6366f1,#4f46e5);padding:36px 40px;text-align:center;">
                            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">BR Publications</h1>
                            <p style="margin:8px 0 0;color:#e0e7ff;font-size:14px;">Review Submitted</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:40px;">
                            <h2 style="margin:0 0 16px;color:#111827;font-size:18px;font-weight:700;">Hello {{editorName}},</h2>
                            <p style="margin:0 0 20px;color:#4b5563;font-size:15px;line-height:1.6;">
                                Reviewer <strong>{{reviewerName}}</strong> has completed their review for a chapter.
                            </p>
                            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;margin-bottom:24px;">
                                <tr>
                                    <td style="padding:20px;">
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding-bottom:12px;border-bottom:1px solid #ddd6fe;">
                                                    <span style="color:#4338ca;font-size:12px;font-weight:600;text-transform:uppercase;">Book Title</span><br />
                                                    <span style="color:#111827;font-size:15px;font-weight:600;">{{bookTitle}}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding:12px 0;border-bottom:1px solid #ddd6fe;">
                                                    <span style="color:#4338ca;font-size:12px;font-weight:600;text-transform:uppercase;">Chapter Title</span><br />
                                                    <span style="color:#111827;font-size:15px;">{{chapterTitle}}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding-top:12px;">
                                                    <span style="color:#4338ca;font-size:12px;font-weight:600;text-transform:uppercase;">Recommendation</span><br />
                                                    <span style="color:#111827;font-size:15px;font-weight:600;">{{recommendation}}</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">
                                Please log in to the <strong>BR Publications Editor Dashboard</strong> to view the full review and comments.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
                            <p style="margin:0;color:#9ca3af;font-size:12px;">This is an automated notification from <strong>BR Publications</strong>.</p>
                            <p style="margin-top:12px;color:#9ca3af;font-size:12px;">© {{currentYear}} BR Publications. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`
    },
    BOOK_CHAPTER_ALL_REVIEWS_COMPLETED: {
        subject: 'All Reviews Completed: {{bookTitle}}',
        variables: ['editorName', 'bookTitle', 'chapters', 'authorName', 'reviewSummary', 'frontendUrl', 'currentYear'],
        content: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>All Reviews Completed</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;">
                    <tr>
                        <td style="background:linear-gradient(135deg,#6366f1,#4f46e5);padding:36px 40px;text-align:center;">
                            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">BR Publications</h1>
                            <p style="margin:8px 0 0;color:#e0e7ff;font-size:14px;">Peer Review Completed</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:40px;">
                            <h2 style="margin:0 0 16px;color:#111827;font-size:18px;font-weight:700;">Hello {{editorName}},</h2>
                            <p style="margin:0 0 20px;color:#4b5563;font-size:15px;line-height:1.6;">
                                All assigned reviews for the book <strong>{{bookTitle}}</strong> have been completed.
                            </p>
                            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;margin-bottom:24px;">
                                <tr>
                                    <td style="padding:20px;">
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding-bottom:12px;border-bottom:1px solid #ddd6fe;">
                                                    <span style="color:#4338ca;font-size:12px;font-weight:600;text-transform:uppercase;">Book Title</span><br />
                                                    <span style="color:#111827;font-size:15px;font-weight:600;">{{bookTitle}}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding:12px 0;border-bottom:1px solid #ddd6fe;">
                                                    <span style="color:#4338ca;font-size:12px;font-weight:600;text-transform:uppercase;">Chapters</span><br />
                                                    <span style="color:#111827;font-size:15px;">{{chapters}}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding-top:12px;">
                                                    <span style="color:#4338ca;font-size:12px;font-weight:600;text-transform:uppercase;">Author</span><br />
                                                    <span style="color:#111827;font-size:15px;">{{authorName}}</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">
                                Please log in to the <strong>BR Publications Editor Dashboard</strong> to make your final editorial decision.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
                            <p style="margin:0;color:#9ca3af;font-size:12px;">This is an automated notification from <strong>BR Publications</strong>.</p>
                            <p style="margin-top:12px;color:#9ca3af;font-size:12px;">© {{currentYear}} BR Publications. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`
    },
    BOOK_CHAPTER_PEER_REVIEW_COMPLETED_EDITOR: {
        subject: 'Action Required: Peer Review Completed for All Chapters - {{bookTitle}}',
        variables: ['editorName', 'bookTitle', 'chaptersHtmlList', 'frontendUrl', 'submissionId', 'currentYear'],
        content: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Peer Review Completed For All Chapters</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;">
                    <tr>
                        <td style="background:linear-gradient(135deg,#6366f1,#4f46e5);padding:36px 40px;text-align:center;">
                            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">BR Publications</h1>
                            <p style="margin:8px 0 0;color:#e0e7ff;font-size:14px;">Peer Review Completed</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:40px;">
                            <h2 style="color: #6366f1; margin-top: 0;">Hello {{editorName}},</h2>
                            <p style="color: #333; line-height: 1.6;">The peer review process has been successfully completed for all submitted chapters of the following book:</p>
                            
                            <div style="background: #f8fafc; border-left: 4px solid #6366f1; padding: 20px; margin: 20px 0; border-radius: 4px;">
                              <h3 style="margin-top: 0; color: #1e293b;">{{bookTitle}}</h3>
                              <p style="margin-bottom: 5px; color: #333;"><strong>Completed Chapters:</strong></p>
                              <ul style="margin-top: 0; line-height: 1.5; padding-left: 20px; color: #475569;">
                                {{chaptersHtmlList}}
                              </ul>
                            </div>
                            
                            <p style="color: #333; line-height: 1.6;">As the assigned editor, please log in to your dashboard to review the feedback and make your editorial decisions for the chapters.</p>
                            
                        </td>
                    </tr>
                    <tr>
                        <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
                            <p style="margin:0;color:#9ca3af;font-size:12px;">This is an automated notification from <strong>BR Publications</strong>.</p>
                            <p style="margin-top:12px;color:#9ca3af;font-size:12px;">© {{currentYear}} BR Publications. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`
    },
    BOOK_CHAPTER_PROOF_EDITING_STARTED: {
        subject: 'Proof Editing Started: {{bookTitle}}',
        description: 'Sent to authors when an editor starts the proof editing process.',
        variables: ['name', 'bookTitle', 'editorName', 'notes', 'frontendUrl', 'currentYear'],
        content: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Proof Editing Started</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;">
                    <tr>
                        <td style="background:linear-gradient(135deg,#6366f1,#4f46e5);padding:36px 40px;text-align:center;">
                            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">BR Publications</h1>
                            <p style="margin:8px 0 0;color:#e0e7ff;font-size:14px;">Proof Editing Phase</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:40px;">
                            <h2 style="color: #6366f1; margin-top: 0;">Hello {{name}},</h2>
                            <p style="color: #333; line-height: 1.6;">We are pleased to inform you that the <strong>proof editing</strong> process has officially started for your submission:</p>
                            
                            <div style="background: #f8fafc; border-left: 4px solid #6366f1; padding: 20px; margin: 20px 0; border-radius: 4px;">
                              <h3 style="margin-top: 0; color: #1e293b;">{{bookTitle}}</h3>
                              <p style="margin-bottom: 0; color: #475569;"><strong>Editor In Charge:</strong> {{editorName}}</p>
                            </div>
                            
                            <div style="background: #fff; padding: 15px; margin: 20px 0; border: 1px solid #e2e8f0; border-radius: 4px;">
                                <strong style="color: #6366f1;">Editor's Message:</strong>
                                <p style="white-space: pre-wrap; margin: 10px 0 0; color: #334155;">{{notes}}</p>
                            </div>

                            <p style="color: #333; line-height: 1.6;">During this phase, our editorial team will be refining the manuscript for final publication. You can track the progress through your author dashboard.</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
                            <p style="margin:0;color:#9ca3af;font-size:12px;">This is an automated notification from <strong>BR Publications</strong>.</p>
                            <p style="margin-top:12px;color:#9ca3af;font-size:12px;">© {{currentYear}} BR Publications. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`
    },
    BOOK_CHAPTER_DELIVERY_DETAILS_REQUESTED: {
        subject: 'Delivery Details Required: {{bookTitle}}',
        description: 'Sent to authors when their publication is initiated and delivery address is required.',
        variables: ['name', 'bookTitle', 'chapters', 'notes', 'frontendUrl', 'currentYear'],
        content: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Delivery Details Required</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;">
                    <!-- Header -->
                    <tr>
                        <td style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:36px 40px;text-align:center;">
                            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">BR Publications</h1>
                            <p style="margin:8px 0 0;color:#fef3c7;font-size:14px;">Action Required: Delivery Details</p>
                        </td>
                    </tr>
                    
                    <!-- Banner -->
                    <tr>
                        <td style="background:#fff7ed;border-bottom:3px solid #f59e0b;padding:16px 40px;text-align:center;">
                            <p style="margin:0;color:#9a3412;font-size:15px;font-weight:600;">
                                📦 Please Provide Your Delivery Address
                            </p>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding:40px;">
                            <h2 style="margin:0 0 16px;color:#111827;font-size:18px;font-weight:700;">Hello {{name}},</h2>
                            <p style="margin:0 0 20px;color:#4b5563;font-size:15px;line-height:1.6;">
                                We are excited to inform you that the publication process has been initiated for your submission. To ensure your copies are delivered correctly, we require your current delivery address.
                            </p>
                            
                            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
                                <tr>
                                    <td style="padding:20px;">
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding-bottom:12px;border-bottom:1px solid #e2e8f0;">
                                                    <span style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Book Title</span><br />
                                                    <span style="color:#111827;font-size:15px;font-weight:600;">{{bookTitle}}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding:12px 0;">
                                                    <span style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Chapters</span><br />
                                                    <span style="color:#111827;font-size:15px;">{{chapters}}</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <div style="background: #fff; padding: 15px; margin: 20px 0; border: 1px solid #e2e8f0; border-radius: 4px;">
                                <strong style="color: #d97706;">Note from Editorial Team:</strong>
                                <p style="white-space: pre-wrap; margin: 10px 0 0; color: #334155;">{{notes}}</p>
                            </div>

                            <p style="margin:0 0 24px;color:#4b5563;font-size:15px;line-height:1.6;">
                                Please log in to your dashboard and navigate to the <strong>Author Actions</strong> tab to submit your delivery details.
                            </p>


                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
                            <p style="margin:0;color:#9ca3af;font-size:12px;">This is an automated notification from <strong>BR Publications</strong>.</p>
                            <p style="margin-top:12px;color:#9ca3af;font-size:12px;">© {{currentYear}} BR Publications. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`
    },
    BOOK_CHAPTER_DELIVERY_DETAILS_SUBMITTED: {
        subject: 'Delivery Details Submitted: {{bookTitle}}',
        description: 'Sent to Admin and Editor when an author submits their delivery details.',
        variables: ['name', 'authorName', 'bookTitle', 'frontendUrl', 'currentYear'],
        content: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Delivery Details Submitted</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;">
                    <!-- Header -->
                    <tr>
                        <td style="background:linear-gradient(135deg,#10b981,#059669);padding:36px 40px;text-align:center;">
                            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">BR Publications</h1>
                            <p style="margin:8px 0 0;color:#d1fae5;font-size:14px;">Submission Update: Delivery Details</p>
                        </td>
                    </tr>
                    
                    <!-- Banner -->
                    <tr>
                        <td style="background:#f0fdf4;border-bottom:3px solid #10b981;padding:16px 40px;text-align:center;">
                            <p style="margin:0;color:#065f46;font-size:15px;font-weight:600;">
                                ✅ Delivery Details Have Been Submitted
                            </p>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding:40px;">
                            <h2 style="margin:0 0 16px;color:#111827;font-size:18px;font-weight:700;">Hello {{name}},</h2>
                            <p style="margin:0 0 20px;color:#4b5563;font-size:15px;line-height:1.6;">
                                The author <strong>{{authorName}}</strong> has submitted the delivery details for the book <strong>{{bookTitle}}</strong>.
                            </p>
                            
                            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
                                <tr>
                                    <td style="padding:20px;">
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding-bottom:12px;border-bottom:1px solid #e2e8f0;">
                                                    <span style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Book Title</span><br />
                                                    <span style="color:#111827;font-size:15px;font-weight:600;">{{bookTitle}}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding:12px 0;">
                                                    <span style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Author</span><br />
                                                    <span style="color:#111827;font-size:15px;">{{authorName}}</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin:0 0 24px;color:#4b5563;font-size:15px;line-height:1.6;">
                                You can now proceed to publish the book chapter as all required details have been provided.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
                            <p style="margin:0;color:#9ca3af;font-size:12px;">This is an automated notification from <strong>BR Publications</strong>.</p>
                            <p style="margin-top:12px;color:#9ca3af;font-size:12px;">© {{currentYear}} BR Publications. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`
    },
    BOOK_CHAPTER_DELIVERY_DETAILS_SUBMITTED_NOTIFICATION: {
        subject: 'Delivery Details Submitted',
        description: 'App notification for Admin/Editor when delivery details are submitted.',
        variables: ['authorName', 'bookTitle'],
        content: 'Author {{authorName}} has submitted the delivery details for the book "{{bookTitle}}".'
    }
};
