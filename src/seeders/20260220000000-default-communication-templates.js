'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const templates = [

      // ============================================================
      // AUTH EMAILS
      // ============================================================
      {
        code: 'EMAIL_VERIFICATION',
        type: 'EMAIL',
        subject: 'Email Verification - BR Publications',
        content: `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email Verification</title>
    <link
        href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap"
        rel="stylesheet" />
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            background: #f0ede8;
            font-family: 'DM Sans', sans-serif;
            padding: 40px 16px;
        }

        .wrapper {
            max-width: 600px;
            margin: 0 auto;
        }

        .card {
            background: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 4px 40px rgba(0, 0, 0, 0.08);
        }

        /* Header */
        .header {
            background: #0f0f0f;
            padding: 44px 48px 40px;
            position: relative;
            overflow: hidden;
        }

        .header::before {
            content: '';
            position: absolute;
            top: -60px;
            right: -60px;
            width: 220px;
            height: 220px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.04);
        }

        .header::after {
            content: '';
            position: absolute;
            bottom: -40px;
            left: 30px;
            width: 140px;
            height: 140px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.03);
        }

        .logo {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 32px;
        }

        .logo-mark {
            width: 36px;
            height: 36px;
            background: #fff;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .logo-mark svg {
            width: 20px;
            height: 20px;
        }

        .logo-name {
            font-family: 'DM Serif Display', serif;
            font-size: 20px;
            color: #ffffff;
            letter-spacing: 0.02em;
        }

        .header h1 {
            font-family: 'DM Serif Display', serif;
            font-size: 36px;
            color: #ffffff;
            line-height: 1.2;
            font-weight: 400;
        }

        .header h1 span {
            color: #c8f261;
        }

        /* Body */
        .body {
            padding: 48px 48px 40px;
        }

        .greeting {
            font-size: 17px;
            color: #4a4a4a;
            line-height: 1.6;
            margin-bottom: 8px;
        }

        .greeting strong {
            color: #0f0f0f;
            font-weight: 600;
        }

        .intro {
            font-size: 15px;
            color: #6b6b6b;
            line-height: 1.7;
            margin-bottom: 36px;
        }

        /* OTP Block */
        .otp-section {
            background: #f7f5f2;
            border-radius: 14px;
            padding: 32px;
            text-align: center;
            margin-bottom: 36px;
            border: 1.5px solid #e8e4de;
        }

        .otp-label {
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: #9b9b9b;
            margin-bottom: 14px;
        }

        .otp-code {
            font-size: 48px;
            font-family: 'DM Serif Display', serif;
            color: #0f0f0f;
            letter-spacing: 0.18em;
            line-height: 1;
            margin-bottom: 16px;
        }

        .otp-timer {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: #fff3cd;
            border: 1px solid #ffe08a;
            border-radius: 20px;
            padding: 5px 14px;
            font-size: 12px;
            font-weight: 500;
            color: #8a6400;
        }

        .otp-timer svg {
            width: 13px;
            height: 13px;
        }

        /* Info blocks */
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 36px;
        }

        .info-item {
            background: #fafaf9;
            border: 1px solid #ebebeb;
            border-radius: 10px;
            padding: 16px 18px;
        }

        .info-item-icon {
            font-size: 18px;
            margin-bottom: 8px;
        }

        .info-item-title {
            font-size: 12px;
            font-weight: 600;
            color: #0f0f0f;
            margin-bottom: 4px;
        }

        .info-item-text {
            font-size: 12px;
            color: #7a7a7a;
            line-height: 1.5;
        }

        .security-note {
            background: #fff5f5;
            border-left: 3px solid #e53e3e;
            border-radius: 0 8px 8px 0;
            padding: 14px 18px;
            margin-bottom: 36px;
        }

        .security-note p {
            font-size: 13px;
            color: #c53030;
            line-height: 1.6;
        }

        .security-note strong {
            font-weight: 600;
        }

        .closing {
            font-size: 15px;
            color: #6b6b6b;
            line-height: 1.7;
            margin-bottom: 28px;
        }

        .sign {
            font-size: 15px;
            color: #4a4a4a;
            line-height: 1.6;
        }

        .sign strong {
            display: block;
            font-family: 'DM Serif Display', serif;
            font-size: 18px;
            color: #0f0f0f;
            font-weight: 400;
            margin-top: 4px;
        }

        /* Footer */
        .footer {
            background: #f7f5f2;
            padding: 28px 48px;
            border-top: 1px solid #ebebeb;
        }

        .footer p {
            font-size: 12px;
            color: #9b9b9b;
            line-height: 1.7;
            text-align: center;
        }

        .footer a {
            color: #6b6b6b;
            text-decoration: underline;
            text-underline-offset: 2px;
        }

        .divider {
            height: 1px;
            background: linear-gradient(to right, transparent, #dedede, transparent);
            margin: 32px 0;
        }

        @media (max-width: 480px) {

            .header,
            .body,
            .footer {
                padding-left: 28px;
                padding-right: 28px;
            }

            .otp-code {
                font-size: 36px;
            }

            .info-grid {
                grid-template-columns: 1fr;
            }

            .header h1 {
                font-size: 28px;
            }
        }
    </style>
</head>

<body>
    <div class="wrapper">
        <div class="card">

            <!-- Body -->
            <div class="body">
                <p class="greeting">Hello, <strong>{{name}}</strong> 👋</p>
                <p class="intro">
                    We received a request to verify your identity on your account. Use the one-time password below to
                    complete your verification. This code is unique to you and should not be shared with anyone.
                </p>

                <!-- OTP -->
                <div class="otp-section">
                    <div class="otp-label">Your One-Time Password</div>
                    <div class="otp-code">{{otp}}</div>
                    <span class="otp-timer">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" stroke="#8a6400" stroke-width="2" />
                            <path d="M12 6v6l4 2" stroke="#8a6400" stroke-width="2" stroke-linecap="round" />
                        </svg>
                        Expires in 10 minutes
                    </span>
                </div>

                <!-- Info Grid -->
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-item-icon">🔒</div>
                        <div class="info-item-title">Single Use Only</div>
                        <div class="info-item-text">This code can only be used once and expires immediately after.</div>
                    </div>
                    <div class="info-item">
                        <div class="info-item-icon">⏱️</div>
                        <div class="info-item-title">Time Sensitive</div>
                        <div class="info-item-text">Enter the code within 10 minutes before it becomes invalid.</div>
                    </div>
                </div>

                <p class="closing">
                    If you're having trouble or didn't request this, feel free to reach out to our support team — we're
                    happy to help.
                </p>

                <p class="sign">
                    Warm regards,
                    <strong>The BR Publications Team</strong>
                </p>
            </div>

            <!-- Footer -->
            <div class="footer">
                <p>
                    This email was sent to you because a verification was requested on your account.<br>
                    © {{currentYear}} BR Publications, Inc. </p>
            </div>
        </div>
    </div>
</body>

</html>`,
        variables: JSON.stringify(['name', 'otp', 'currentYear']),
        description: 'OTP sent for new email verification or email change',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'PASSWORD_RESET',
        type: 'EMAIL',
        subject: 'Password Reset Request - BR Publications',
        content: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <h2>Password Reset Request</h2>
  <p>Hello {{name}},</p>
  <p>You requested to reset your password. Your verification code is:</p>
  <div style="background:#f4f4f4;padding:20px;text-align:center;font-size:32px;font-weight:bold;letter-spacing:5px;">{{otp}}</div>
  <p>This code will expire in 10 minutes.</p>
  <p>If you didn't request this, please ignore this email.</p>
  <p>Best regards,<br>BR Publications Team</p>
</div>`,
        variables: JSON.stringify(['name', 'otp']),
        description: 'OTP sent when a user requests password reset',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'WELCOME_EMAIL',
        type: 'EMAIL',
        subject: 'Welcome to BR Publications',
        content: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <h2>Welcome {{name}}!</h2>
  <p>Thank you for joining BR Publications as a <strong>{{role}}</strong>.</p>
  <p>You can log in at any time using your registered email and password.</p>
  <p><a href="{{frontendUrl}}/login" style="background:#1e5292;color:white;padding:12px 24px;text-decoration:none;border-radius:4px;display:inline-block;">Log In Now</a></p>
  <p>Best regards,<br>BR Publications Team</p>
</div>`,
        variables: JSON.stringify(['name', 'role', 'frontendUrl']),
        description: 'Welcome email sent when an admin creates a new user account',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // ============================================================
      // BOOK CHAPTER SUBMISSION EMAILS
      // ============================================================
      {
        code: 'BOOK_CHAPTER_SUBMISSION_RECEIVED',
        type: 'EMAIL',
        subject: 'Submission Received: {{bookTitle}}',
        content: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <h2>Hello {{name}},</h2>
  <p>Your book chapter submission has been successfully received.</p>
  <div style="background:#f9f9f9;border-left:4px solid #4CAF50;padding:20px;margin:20px 0;">
    <h3 style="margin-top:0;">{{bookTitle}}</h3>
    <p><strong>Submitted:</strong> {{submissionDate}}</p>
    <p><strong>Status:</strong> Initial Submission</p>
  </div>
  <p>We will review your submission and notify you of the next steps.</p>
  <p><a href="{{frontendUrl}}/dashboard" style="background:#4CAF50;color:white;padding:12px 24px;text-decoration:none;border-radius:4px;display:inline-block;">View Submission</a></p>
  <p style="color:#666;font-size:14px;">This is an automated notification from BR Publications.</p>
</div>`,
        variables: JSON.stringify(['name', 'bookTitle', 'submissionDate', 'submissionId', 'frontendUrl']),
        description: 'Sent to Author when a new book chapter is submitted',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'BOOK_CHAPTER_SUBMISSION_ADMIN',
        type: 'EMAIL',
        subject: 'New Book Chapter Submission: {{bookTitle}}',
        content: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <h2>Hello {{adminName}},</h2>
  <p>A new book chapter submission has been received.</p>
  <div style="background:#f9f9f9;border-left:4px solid #2196F3;padding:20px;margin:20px 0;">
    <h3 style="margin-top:0;">{{bookTitle}}</h3>
    <p><strong>Author:</strong> {{authorName}}</p>
    <p><strong>Chapters:</strong> {{chapters}}</p>
    <p><strong>Date:</strong> {{submissionDate}}</p>
  </div>
  <p><a href="{{frontendUrl}}/dashboard/admin" style="background:#2196F3;color:white;padding:12px 24px;text-decoration:none;border-radius:4px;display:inline-block;">View Submission</a></p>
  <p style="color:#666;font-size:14px;">This is an automated notification from BR Publications.</p>
</div>`,
        variables: JSON.stringify(['adminName', 'authorName', 'bookTitle', 'chapters', 'submissionDate', 'frontendUrl']),
        description: 'Sent to Admin when a new book chapter submission arrives',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'BOOK_CHAPTER_EDITOR_ASSIGNED',
        type: 'EMAIL',
        subject: 'New Editor Assignment: {{bookTitle}}',
        content: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <h2>Hello {{editorName}},</h2>
  <p>You have been assigned as editor for a book chapter submission.</p>
  <div style="background:#f9f9f9;border-left:4px solid #2196F3;padding:20px;margin:20px 0;">
    <h3 style="margin-top:0;">{{bookTitle}}</h3>
    <p><strong>Author:</strong> {{authorName}}</p>
    <p><strong>Chapters:</strong> {{chapters}}</p>
    <p><strong>Assigned by:</strong> {{assignedBy}}</p>
  </div>
  <p><a href="{{frontendUrl}}/dashboard/editor" style="background:#2196F3;color:white;padding:12px 24px;text-decoration:none;border-radius:4px;display:inline-block;">View Submission</a></p>
  <p style="color:#666;font-size:14px;">This is an automated notification from BR Publications.</p>
</div>`,
        variables: JSON.stringify(['editorName', 'authorName', 'bookTitle', 'chapters', 'assignedBy', 'frontendUrl']),
        description: 'Sent to Editor when assigned to a book chapter submission',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'BOOK_CHAPTER_REVIEWER_ASSIGNED',
        type: 'EMAIL',
        subject: 'Reviewer Assignment: {{chapterTitle}}',
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

</html>`,
        variables: JSON.stringify(['reviewerName', 'bookTitle', 'chapterTitle', 'assignedBy', 'deadline', 'frontendUrl']),
        description: 'Sent to Reviewer when assigned to a book chapter',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'BOOK_CHAPTER_REVISION_REQUESTED',
        type: 'EMAIL',
        subject: 'Revision {{revisionNumber}} Requested: {{bookTitle}}',
        content: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <h2>Hello {{name}},</h2>
  <p>A revision has been requested for your book chapter submission.</p>
  <div style="background:#fff3cd;border-left:4px solid #ffc107;padding:20px;margin:20px 0;">
    <h3 style="margin-top:0;">{{bookTitle}}</h3>
    <p><strong>Chapters:</strong> {{chapters}}</p>
    <p><strong>Requested by:</strong> {{requestedBy}}</p>
    <p><strong>Revision #:</strong> {{revisionNumber}}</p>
    <div style="margin-top:15px;"><strong>Comments:</strong><p style="white-space:pre-wrap;">{{comments}}</p></div>
    {{#adminMessage}}<div style="background:#fff;border:1px solid #ffc107;padding:15px;margin-top:10px;"><strong>Additional Notes:</strong><p style="white-space:pre-wrap;">{{adminMessage}}</p></div>{{/adminMessage}}
  </div>
  <p><a href="{{frontendUrl}}/dashboard" style="background:#ffc107;color:#000;padding:12px 24px;text-decoration:none;border-radius:4px;display:inline-block;">View Revision Request</a></p>
  <p style="color:#666;font-size:14px;">This is an automated notification from BR Publications.</p>
</div>`,
        variables: JSON.stringify(['name', 'bookTitle', 'chapters', 'requestedBy', 'revisionNumber', 'comments', 'adminMessage', 'deadline', 'frontendUrl']),
        description: 'Sent to Author when a revision is requested on their book chapter',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'BOOK_CHAPTER_REVISION_SUBMITTED',
        type: 'EMAIL',
        subject: 'Revision {{revisionNumber}} Submitted: {{bookTitle}}',
        content: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <h2>Hello {{name}},</h2>
  <p>A revised manuscript has been submitted by the author.</p>
  <div style="background:#f9f9f9;border-left:4px solid #2196F3;padding:20px;margin:20px 0;">
    <h3 style="margin-top:0;">{{bookTitle}}</h3>
    <p><strong>Author:</strong> {{authorName}}</p>
    <p><strong>Chapters:</strong> {{chapters}}</p>
    <p><strong>Revision #:</strong> {{revisionNumber}}</p>
    {{#authorMessage}}<div style="margin-top:15px;background:#fff;border:1px solid #ddd;padding:15px;"><strong>Author Message:</strong><p style="white-space:pre-wrap;">{{authorMessage}}</p></div>{{/authorMessage}}
  </div>
  <p><a href="{{frontendUrl}}/dashboard" style="background:#2196F3;color:white;padding:12px 24px;text-decoration:none;border-radius:4px;display:inline-block;">Review Revision</a></p>
  <p style="color:#666;font-size:14px;">This is an automated notification from BR Publications.</p>
</div>`,
        variables: JSON.stringify(['name', 'authorName', 'bookTitle', 'chapters', 'revisionNumber', 'authorMessage', 'frontendUrl']),
        description: 'Sent to Editor/Admin when an author submits a revised book chapter',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'BOOK_CHAPTER_REVISION_SUBMITTED_REVIEWER',
        type: 'EMAIL',
        subject: 'Chapter Revision Uploaded: {{chapterTitle}}',
        content: `(Template in bookChapterTemplates.ts)`,
        variables: JSON.stringify(['userName', 'authorName', 'bookTitle', 'chapterTitle', 'revisionNumber', 'frontendUrl']),
        description: 'Sent to Reviewer when an author submits a revision for a specific chapter',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'BOOK_CHAPTER_REVISION_SUBMITTED_REVIEWER_V2',
        type: 'EMAIL',
        subject: 'Revision Submitted: {{chapterTitle}}',
        content: `(Template in bookChapterTemplates.ts)`,
        variables: JSON.stringify(['userName', 'authorName', 'bookTitle', 'chapterTitle', 'revisionNumber', 'authorMessage', 'frontendUrl']),
        description: 'Sent to Reviewer when an author submits a revision for a specific chapter (with author message)',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'BOOK_CHAPTER_DECISION_APPROVED',
        type: 'EMAIL',
        subject: '{{stage}} Approved: {{bookTitle}}',
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

                                            {{#editorNotes}}
                                            <tr>
                                                <td style="padding:10px 0;">
                                                    <span
                                                        style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Editor Notes</span><br />
                                                    <span style="color:#111827;font-size:14px;line-height:1.5;white-space:pre-wrap;">{{editorNotes}}</span>
                                                </td>
                                            </tr>
                                            {{/editorNotes}}

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
`,
        variables: JSON.stringify(['name', 'bookTitle', 'chapters', 'editorName', 'editorNotes', 'stage', 'decision', 'frontendUrl']),
        description: 'Sent to Author when their book chapter submission is approved',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'BOOK_CHAPTER_DECISION_REJECTED',
        type: 'EMAIL',
        subject: '{{stage}} Decision: {{bookTitle}}',
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

                                            {{#editorNotes}}
                                            <tr>
                                                <td style="padding:10px 0;">
                                                    <span
                                                        style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Editor Notes</span><br />
                                                    <span style="color:#111827;font-size:14px;line-height:1.5;white-space:pre-wrap;">{{editorNotes}}</span>
                                                </td>
                                            </tr>
                                            {{/editorNotes}}

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
`,
        variables: JSON.stringify(['name', 'bookTitle', 'chapters', 'editorName', 'editorNotes', 'stage', 'decision', 'frontendUrl']),
        description: 'Sent to Author when their book chapter submission is rejected',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'BOOK_CHAPTER_STATUS_CHANGED',
        type: 'EMAIL',
        subject: 'Status Update: {{bookTitle}}',
        content: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <h2>Hello {{name}},</h2>
  <p>The status of your book chapter submission has been updated.</p>
  <div style="background:#f9f9f9;border-left:4px solid #FF9800;padding:20px;margin:20px 0;">
    <h3 style="margin-top:0;">{{bookTitle}}</h3>
    <p><strong>Chapters:</strong> {{chapters}}</p>
    <p><strong>Previous Status:</strong> {{previousStatus}}</p>
    <p><strong>New Status:</strong> {{newStatus}}</p>
    <p><strong>Updated by:</strong> {{changedBy}}</p>
    {{#adminMessage}}<div style="margin-top:15px;background:#fff;padding:15px;border:1px solid #ddd;"><strong>Notes:</strong><p style="white-space:pre-wrap;">{{adminMessage}}</p></div>{{/adminMessage}}
  </div>
  <p><a href="{{frontendUrl}}/dashboard" style="background:#FF9800;color:white;padding:12px 24px;text-decoration:none;border-radius:4px;display:inline-block;">View Details</a></p>
  <p style="color:#666;font-size:14px;">This is an automated notification from BR Publications.</p>
</div>`,
        variables: JSON.stringify(['name', 'bookTitle', 'chapters', 'previousStatus', 'newStatus', 'changedBy', 'adminMessage', 'frontendUrl']),
        description: 'Sent when any status changes on a book chapter submission',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'BOOK_CHAPTER_DEADLINE_REMINDER',
        type: 'EMAIL',
        subject: 'Reminder: {{role}} Assignment Due in {{daysRemaining}} Day(s)',
        content: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <h2>Hello {{name}},</h2>
  <p style="color:#ff9800;font-weight:bold;">⏰ Deadline Reminder</p>
  <div style="background:#f9f9f9;border-left:4px solid #ff9800;padding:20px;margin:20px 0;">
    <h3 style="margin-top:0;">{{bookTitle}}</h3>
    <p><strong>Role:</strong> {{role}}</p>
    <p><strong>Days Remaining:</strong> {{daysRemaining}}</p>
    <p><strong>Deadline:</strong> {{deadline}}</p>
  </div>
  <p><a href="{{frontendUrl}}/dashboard" style="background:#ff9800;color:white;padding:12px 24px;text-decoration:none;border-radius:4px;display:inline-block;">View Assignment</a></p>
  <p style="color:#666;font-size:14px;">This is an automated reminder from BR Publications.</p>
</div>`,
        variables: JSON.stringify(['name', 'role', 'bookTitle', 'daysRemaining', 'deadline', 'frontendUrl']),
        description: 'Automated deadline reminder sent to Reviewer or Editor',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'BOOK_CHAPTER_COMMENT',
        type: 'EMAIL',
        subject: 'New Comment on: {{bookTitle}}',
        content: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <h2>Hello {{name}},</h2>
  <p><strong>{{commenterName}}</strong> added a comment on your submission.</p>
  <div style="background:#f9f9f9;border-left:4px solid #9C27B0;padding:20px;margin:20px 0;">
    <h3 style="margin-top:0;">{{bookTitle}}</h3>
    <p><strong>Chapters:</strong> {{chapters}}</p>
    <p><strong>{{commenterName}}:</strong></p>
    <p style="white-space:pre-wrap;background:#fff;padding:15px;margin-top:10px;">{{message}}</p>
  </div>
  <p><a href="{{frontendUrl}}/dashboard" style="background:#9C27B0;color:white;padding:12px 24px;text-decoration:none;border-radius:4px;display:inline-block;">View &amp; Reply</a></p>
  <p style="color:#666;font-size:14px;">This is an automated notification from BR Publications.</p>
</div>`,
        variables: JSON.stringify(['name', 'bookTitle', 'chapters', 'commenterName', 'message', 'isReply', 'frontendUrl']),
        description: 'Sent to submission participant when a new comment is posted',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // ============================================================
      // TEXT BOOK SUBMISSION EMAILS
      // ============================================================
      {
        code: 'TEXTBOOK_SUBMISSION_RECEIVED',
        type: 'EMAIL',
        subject: 'Submission Received: {{bookTitle}}',
        content: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <h2>Hello {{name}},</h2>
  <p>Your textbook submission has been successfully received.</p>
  <div style="background:#f9f9f9;border-left:4px solid #4CAF50;padding:20px;margin:20px 0;">
    <h3 style="margin-top:0;">{{bookTitle}}</h3>
    <p><strong>Submitted:</strong> {{submissionDate}}</p>
    <p><strong>Status:</strong> Initial Submission</p>
  </div>
  <p>We will review your proposal and notify you of the next steps.</p>
  <p><a href="{{frontendUrl}}/dashboard" style="background:#4CAF50;color:white;padding:12px 24px;text-decoration:none;border-radius:4px;display:inline-block;">View Submission</a></p>
  <p style="color:#666;font-size:14px;">This is an automated notification from BR Publications.</p>
</div>`,
        variables: JSON.stringify(['name', 'bookTitle', 'submissionDate', 'submissionId', 'frontendUrl']),
        description: 'Sent to Author when a textbook is submitted',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'TEXTBOOK_SUBMISSION_ADMIN',
        type: 'EMAIL',
        subject: 'New Textbook Submission: {{bookTitle}}',
        content: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <h2>Hello {{adminName}},</h2>
  <p>A new textbook submission has been received.</p>
  <div style="background:#f9f9f9;border-left:4px solid #2196F3;padding:20px;margin:20px 0;">
    <h3 style="margin-top:0;">{{bookTitle}}</h3>
    <p><strong>Author:</strong> {{authorName}}</p>
    <p><strong>Date:</strong> {{submissionDate}}</p>
  </div>
  <p><a href="{{frontendUrl}}/dashboard/admin" style="background:#2196F3;color:white;padding:12px 24px;text-decoration:none;border-radius:4px;display:inline-block;">View Submission</a></p>
  <p style="color:#666;font-size:14px;">This is an automated notification from BR Publications.</p>
</div>`,
        variables: JSON.stringify(['adminName', 'authorName', 'bookTitle', 'submissionDate', 'frontendUrl']),
        description: 'Sent to Admin when a new textbook submission arrives',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'TEXTBOOK_PROPOSAL_ACCEPTED',
        type: 'EMAIL',
        subject: 'Proposal Accepted: {{bookTitle}}',
        content: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <h2>Hello {{name}},</h2>
  <p style="font-size:18px;">🎉 Your textbook proposal has been accepted!</p>
  <div style="background:#f9f9f9;border-left:4px solid #4CAF50;padding:20px;margin:20px 0;">
    <h3 style="margin-top:0;">{{bookTitle}}</h3>
    <p><strong>Decision:</strong> ACCEPTED</p>
    <p><strong>By:</strong> {{adminName}}</p>
    {{#adminNotes}}<div style="background:#fff;padding:15px;margin-top:15px;border:1px solid #ddd;"><strong>Notes:</strong><p style="white-space:pre-wrap;">{{adminNotes}}</p></div>{{/adminNotes}}
  </div>
  <p>You may now proceed to submit the full manuscript.</p>
  <p><a href="{{frontendUrl}}/dashboard" style="background:#4CAF50;color:white;padding:12px 24px;text-decoration:none;border-radius:4px;display:inline-block;">View Submission</a></p>
  <p style="color:#666;font-size:14px;">This is an automated notification from BR Publications.</p>
</div>`,
        variables: JSON.stringify(['name', 'bookTitle', 'adminName', 'adminNotes', 'frontendUrl']),
        description: 'Sent to Author when their textbook proposal is accepted',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'TEXTBOOK_PROPOSAL_REJECTED',
        type: 'EMAIL',
        subject: 'Proposal Decision: {{bookTitle}}',
        content: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <h2>Hello {{name}},</h2>
  <p>Thank you for your textbook proposal submission.</p>
  <div style="background:#f9f9f9;border-left:4px solid #f44336;padding:20px;margin:20px 0;">
    <h3 style="margin-top:0;">{{bookTitle}}</h3>
    <p><strong>Decision:</strong> REJECTED</p>
    <p><strong>By:</strong> {{adminName}}</p>
    {{#adminNotes}}<div style="background:#fff;padding:15px;margin-top:15px;border:1px solid #ddd;"><strong>Notes:</strong><p style="white-space:pre-wrap;">{{adminNotes}}</p></div>{{/adminNotes}}
  </div>
  <p>We appreciate your submission and encourage you to apply again.</p>
  <p><a href="{{frontendUrl}}/dashboard" style="background:#f44336;color:white;padding:12px 24px;text-decoration:none;border-radius:4px;display:inline-block;">View Submission</a></p>
  <p style="color:#666;font-size:14px;">This is an automated notification from BR Publications.</p>
</div>`,
        variables: JSON.stringify(['name', 'bookTitle', 'adminName', 'adminNotes', 'frontendUrl']),
        description: 'Sent to Author when their textbook proposal is rejected',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'TEXTBOOK_REVISION_REQUESTED',
        type: 'EMAIL',
        subject: 'Revision {{revisionNumber}} Requested: {{bookTitle}}',
        content: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <h2>Hello {{name}},</h2>
  <p>A revision has been requested for your textbook submission.</p>
  <div style="background:#fff3cd;border-left:4px solid #ffc107;padding:20px;margin:20px 0;">
    <h3 style="margin-top:0;">{{bookTitle}}</h3>
    <p><strong>Requested by:</strong> {{adminName}}</p>
    <p><strong>Revision #:</strong> {{revisionNumber}}</p>
    <div style="margin-top:15px;"><strong>Comments:</strong><p style="white-space:pre-wrap;">{{comments}}</p></div>
    {{#adminMessage}}<div style="background:#fff;border:1px solid #ffc107;padding:15px;margin-top:10px;"><strong>Additional Notes:</strong><p style="white-space:pre-wrap;">{{adminMessage}}</p></div>{{/adminMessage}}
  </div>
  <p><a href="{{frontendUrl}}/dashboard" style="background:#ffc107;color:#000;padding:12px 24px;text-decoration:none;border-radius:4px;display:inline-block;">Submit Revision</a></p>
  <p style="color:#666;font-size:14px;">This is an automated notification from BR Publications.</p>
</div>`,
        variables: JSON.stringify(['name', 'bookTitle', 'adminName', 'comments', 'adminMessage', 'revisionNumber', 'frontendUrl']),
        description: 'Sent to Author when admin requests a revision on their textbook',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'TEXTBOOK_REVISION_SUBMITTED',
        type: 'EMAIL',
        subject: 'Revision {{revisionNumber}} Submitted: {{bookTitle}}',
        content: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <h2>Hello {{name}},</h2>
  <p>A revised textbook manuscript has been submitted.</p>
  <div style="background:#f9f9f9;border-left:4px solid #2196F3;padding:20px;margin:20px 0;">
    <h3 style="margin-top:0;">{{bookTitle}}</h3>
    <p><strong>Author:</strong> {{authorName}}</p>
    <p><strong>Revision #:</strong> {{revisionNumber}}</p>
    {{#authorMessage}}<div style="margin-top:15px;background:#fff;border:1px solid #ddd;padding:15px;"><strong>Author Message:</strong><p style="white-space:pre-wrap;">{{authorMessage}}</p></div>{{/authorMessage}}
  </div>
  <p><a href="{{frontendUrl}}/dashboard/admin" style="background:#2196F3;color:white;padding:12px 24px;text-decoration:none;border-radius:4px;display:inline-block;">Review Revision</a></p>
  <p style="color:#666;font-size:14px;">This is an automated notification from BR Publications.</p>
</div>`,
        variables: JSON.stringify(['name', 'authorName', 'bookTitle', 'revisionNumber', 'authorMessage', 'frontendUrl']),
        description: 'Sent to Admin when an author submits a revised textbook manuscript',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'TEXTBOOK_DECISION_APPROVED',
        type: 'EMAIL',
        subject: 'Textbook Approved: {{bookTitle}}',
        content: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <h2>Hello {{name}},</h2>
  <p style="font-size:18px;">🎉 Your textbook has been approved for publication!</p>
  <div style="background:#f9f9f9;border-left:4px solid #4CAF50;padding:20px;margin:20px 0;">
    <h3 style="margin-top:0;">{{bookTitle}}</h3>
    <p><strong>Decision:</strong> APPROVED</p>
    <p><strong>By:</strong> {{adminName}}</p>
    {{#adminNotes}}<div style="background:#fff;padding:15px;margin-top:15px;border:1px solid #ddd;"><strong>Notes:</strong><p style="white-space:pre-wrap;">{{adminNotes}}</p></div>{{/adminNotes}}
  </div>
  <p><a href="{{frontendUrl}}/dashboard" style="background:#4CAF50;color:white;padding:12px 24px;text-decoration:none;border-radius:4px;display:inline-block;">View Details</a></p>
  <p style="color:#666;font-size:14px;">This is an automated notification from BR Publications.</p>
</div>`,
        variables: JSON.stringify(['name', 'bookTitle', 'adminName', 'adminNotes', 'frontendUrl']),
        description: 'Sent to Author when their textbook is approved',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'TEXTBOOK_DECISION_REJECTED',
        type: 'EMAIL',
        subject: 'Submission Decision: {{bookTitle}}',
        content: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <h2>Hello {{name}},</h2>
  <p>Thank you for your textbook submission. After careful review, we are unable to proceed at this time.</p>
  <div style="background:#f9f9f9;border-left:4px solid #f44336;padding:20px;margin:20px 0;">
    <h3 style="margin-top:0;">{{bookTitle}}</h3>
    <p><strong>Decision:</strong> REJECTED</p>
    <p><strong>By:</strong> {{adminName}}</p>
    {{#adminNotes}}<div style="background:#fff;padding:15px;margin-top:15px;border:1px solid #ddd;"><strong>Notes:</strong><p style="white-space:pre-wrap;">{{adminNotes}}</p></div>{{/adminNotes}}
  </div>
  <p>We appreciate your effort and encourage you to resubmit in the future.</p>
  <p><a href="{{frontendUrl}}/dashboard" style="background:#f44336;color:white;padding:12px 24px;text-decoration:none;border-radius:4px;display:inline-block;">View Details</a></p>
  <p style="color:#666;font-size:14px;">This is an automated notification from BR Publications.</p>
</div>`,
        variables: JSON.stringify(['name', 'bookTitle', 'adminName', 'adminNotes', 'frontendUrl']),
        description: 'Sent to Author when their textbook is rejected',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'TEXTBOOK_STATUS_CHANGED',
        type: 'EMAIL',
        subject: 'Status Update: {{bookTitle}}',
        content: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <h2>Hello {{name}},</h2>
  <p>The status of your textbook submission has been updated.</p>
  <div style="background:#f9f9f9;border-left:4px solid #FF9800;padding:20px;margin:20px 0;">
    <h3 style="margin-top:0;">{{bookTitle}}</h3>
    <p><strong>Previous:</strong> {{previousStatus}}</p>
    <p><strong>New:</strong> {{newStatus}}</p>
    <p><strong>By:</strong> {{changedBy}}</p>
    {{#adminMessage}}<div style="margin-top:15px;background:#fff;padding:15px;border:1px solid #ddd;"><strong>Notes:</strong><p style="white-space:pre-wrap;">{{adminMessage}}</p></div>{{/adminMessage}}
  </div>
  <p><a href="{{frontendUrl}}/dashboard" style="background:#FF9800;color:white;padding:12px 24px;text-decoration:none;border-radius:4px;display:inline-block;">View Details</a></p>
  <p style="color:#666;font-size:14px;">This is an automated notification from BR Publications.</p>
</div>`,
        variables: JSON.stringify(['name', 'bookTitle', 'previousStatus', 'newStatus', 'changedBy', 'adminMessage', 'frontendUrl']),
        description: 'Sent when any status changes on a textbook submission',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'TEXTBOOK_BULK_UPLOAD_REPORT',
        type: 'EMAIL',
        subject: 'Bulk Upload Report - {{date}}',
        content: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <h2>Hello {{name}},</h2>
  <p>The bulk upload process has completed.</p>
  <div style="background:#f9f9f9;border-left:4px solid #2196F3;padding:20px;margin:20px 0;">
    <h3 style="margin-top:0;">Summary</h3>
    <p><strong>Total Processed:</strong> {{total}}</p>
    <p><strong>Successful:</strong> {{successCount}}</p>
    <p><strong>Failed:</strong> {{failureCount}}</p>
    <p><strong>Total Time:</strong> {{duration}}</p>
  </div>
  <p><a href="{{frontendUrl}}/dashboard/admin" style="background:#2196F3;color:white;padding:12px 24px;text-decoration:none;border-radius:4px;display:inline-block;">View Textbooks</a></p>
  <p style="color:#666;font-size:14px;">This is an automated notification from BR Publications.</p>
</div>`,
        variables: JSON.stringify(['name', 'total', 'successCount', 'failureCount', 'duration', 'date', 'frontendUrl']),
        description: 'Sent to Admin after a bulk textbook CSV upload completes',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'TEXTBOOK_COMMENT',
        type: 'EMAIL',
        subject: 'New Comment on: {{bookTitle}}',
        content: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <h2>Hello {{name}},</h2>
  <p><strong>{{commenterName}}</strong> added a comment on your textbook submission.</p>
  <div style="background:#f9f9f9;border-left:4px solid #9C27B0;padding:20px;margin:20px 0;">
    <h3 style="margin-top:0;">{{bookTitle}}</h3>
    <p><strong>{{commenterName}}:</strong></p>
    <p style="white-space:pre-wrap;background:#fff;padding:15px;margin-top:10px;">{{message}}</p>
  </div>
  <p><a href="{{frontendUrl}}/dashboard" style="background:#9C27B0;color:white;padding:12px 24px;text-decoration:none;border-radius:4px;display:inline-block;">View &amp; Reply</a></p>
  <p style="color:#666;font-size:14px;">This is an automated notification from BR Publications.</p>
</div>`,
        variables: JSON.stringify(['name', 'bookTitle', 'commenterName', 'message', 'isReply', 'frontendUrl']),
        description: 'Sent to submission participant when a new comment is posted on a textbook',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // ============================================================
      // RECRUITMENT EMAILS
      // ============================================================
      {
        code: 'RECRUITMENT_APPLICATION_ADMIN',
        type: 'EMAIL',
        subject: 'New Recruitment Application: {{applicantName}}',
        content: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <h2>Hello {{adminName}},</h2>
  <p>A new recruitment application has been received.</p>
  <div style="background:#f9f9f9;border-left:4px solid #1e5292;padding:20px;margin:20px 0;">
    <h3 style="margin-top:0;">Application ID: {{applicationId}}</h3>
    <p><strong>Applicant:</strong> {{applicantName}}</p>
    <p><strong>Applied Role:</strong> {{appliedRole}}</p>
    <p><strong>Submitted:</strong> {{submissionDate}}</p>
  </div>
  <p><a href="{{frontendUrl}}/dashboard/admin/recruitment" style="background:#1e5292;color:white;padding:12px 24px;text-decoration:none;border-radius:4px;display:inline-block;">View Application</a></p>
  <p style="color:#666;font-size:14px;">This is an automated notification from BR Publications.</p>
</div>`,
        variables: JSON.stringify(['adminName', 'applicantName', 'appliedRole', 'applicationId', 'submissionDate', 'frontendUrl']),
        description: 'Sent to Admin when a new recruitment application is submitted',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'RECRUITMENT_SUBMISSION_RECEIVED',
        type: 'EMAIL',
        subject: 'Recruitment Application Received - BR Publications',
        content: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <h2>Hello {{name}},</h2>
  <p>We have received your application for the position of <strong>{{appliedRole}}</strong>.</p>
  <div style="background:#f9f9f9;border-left:4px solid #4CAF50;padding:20px;margin:20px 0;">
    <h3 style="margin-top:0;">Application ID: {{applicationId}}</h3>
    <p><strong>Submitted:</strong> {{submissionDate}}</p>
    <p><strong>Status:</strong> PENDING REVIEW</p>
  </div>
  <p>Our team will review your application and get back to you shortly.</p>
  <p><a href="{{frontendUrl}}/dashboard/user/recruitment" style="background:#4CAF50;color:white;padding:12px 24px;text-decoration:none;border-radius:4px;display:inline-block;">View Application</a></p>
  <p style="color:#666;font-size:14px;">Best regards,<br>BR Publications Team</p>
</div>`,
        variables: JSON.stringify(['name', 'appliedRole', 'applicationId', 'submissionDate', 'frontendUrl']),
        description: 'Confirmation sent to Applicant when recruitment application is received',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'RECRUITMENT_DECISION_ACCEPTED',
        type: 'EMAIL',
        subject: 'Application Accepted - BR Publications',
        content: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <h2>Hello {{name}},</h2>
  <p>🎉 Congratulations! Your application has been accepted.</p>
  <div style="background:#f9f9f9;border-left:4px solid #4CAF50;padding:20px;margin:20px 0;">
    <h3 style="margin-top:0;">Application #{{applicationId}}</h3>
    <p><strong>Status:</strong> ACCEPTED</p>
    <p><strong>Assigned Role:</strong> {{assignedRole}}</p>
    {{#adminNotes}}<div style="background:#fff;padding:15px;margin-top:15px;border:1px solid #ddd;"><strong>Notes:</strong><p>{{adminNotes}}</p></div>{{/adminNotes}}
  </div>
  <p>You can now access your dashboard with your new role.</p>
  <p><a href="{{frontendUrl}}/dashboard" style="background:#4CAF50;color:white;padding:12px 24px;text-decoration:none;border-radius:4px;display:inline-block;">Go to Dashboard</a></p>
  <p style="color:#666;font-size:14px;">Best regards,<br>BR Publications Team</p>
</div>`,
        variables: JSON.stringify(['name', 'applicationId', 'assignedRole', 'adminNotes', 'frontendUrl']),
        description: 'Sent to Applicant when their recruitment application is accepted',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'RECRUITMENT_DECISION_REJECTED',
        type: 'EMAIL',
        subject: 'Application Status Update - BR Publications',
        content: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <h2>Hello {{name}},</h2>
  <p>Thank you for your interest in joining BR Publications.</p>
  <div style="background:#f9f9f9;border-left:4px solid #f44336;padding:20px;margin:20px 0;">
    <h3 style="margin-top:0;">Application #{{applicationId}}</h3>
    <p><strong>Status:</strong> REJECTED</p>
    {{#adminNotes}}<div style="background:#fff;padding:15px;margin-top:15px;border:1px solid #ddd;"><strong>Notes:</strong><p>{{adminNotes}}</p></div>{{/adminNotes}}
  </div>
  <p>We regret to inform you that we cannot proceed with your application at this time. We appreciate your effort and encourage you to apply again in the future.</p>
  <p style="color:#666;font-size:14px;">Best regards,<br>BR Publications Team</p>
</div>`,
        variables: JSON.stringify(['name', 'applicationId', 'adminNotes', 'frontendUrl']),
        description: 'Sent to Applicant when their recruitment application is rejected',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // ============================================================
      // PROJECTS & INTERNSHIPS EMAILS
      // ============================================================
      {
        code: 'PROJECT_APPLICATION_ADMIN',
        type: 'EMAIL',
        subject: 'New {{submissionType}} Application: {{applicantName}}',
        content: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <h2>Hello {{adminName}},</h2>
  <p>A new {{submissionType}} application has been received.</p>
  <div style="background:#f9f9f9;border-left:4px solid #1e5292;padding:20px;margin:20px 0;">
    <h3 style="margin-top:0;">Application ID: {{applicationId}}</h3>
    <p><strong>Applicant:</strong> {{applicantName}}</p>
    <p><strong>Type:</strong> {{submissionType}}</p>
    <p><strong>Submitted:</strong> {{submissionDate}}</p>
  </div>
  <p><a href="{{frontendUrl}}/dashboard/admin/projects-internships" style="background:#1e5292;color:white;padding:12px 24px;text-decoration:none;border-radius:4px;display:inline-block;">View Application</a></p>
  <p style="color:#666;font-size:14px;">This is an automated notification from BR Publications.</p>
</div>`,
        variables: JSON.stringify(['adminName', 'applicantName', 'submissionType', 'applicationId', 'submissionDate', 'frontendUrl']),
        description: 'Sent to Admin when a new project or internship application is submitted',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'PROJECT_SUBMISSION_RECEIVED',
        type: 'EMAIL',
        subject: '{{submissionType}} Application Received - BR Publications',
        content: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <h2>Hello {{name}},</h2>
  <p>We have received your <strong>{{submissionType}}</strong> application.</p>
  <div style="background:#f9f9f9;border-left:4px solid #4CAF50;padding:20px;margin:20px 0;">
    <h3 style="margin-top:0;">Application ID: {{applicationId}}</h3>
    <p><strong>Type:</strong> {{submissionType}}</p>
    <p><strong>Submitted:</strong> {{submissionDate}}</p>
    <p><strong>Status:</strong> PENDING</p>
  </div>
  <p>Our team will review your application and get back to you shortly.</p>
  <p><a href="{{frontendUrl}}/dashboard/user/projects-internships" style="background:#4CAF50;color:white;padding:12px 24px;text-decoration:none;border-radius:4px;display:inline-block;">View Application</a></p>
  <p style="color:#666;font-size:14px;">Best regards,<br>BR Publications Team</p>
</div>`,
        variables: JSON.stringify(['name', 'submissionType', 'applicationId', 'submissionDate', 'frontendUrl']),
        description: 'Confirmation sent to Applicant when project/internship application is received',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'PROJECT_DECISION_ACCEPTED',
        type: 'EMAIL',
        subject: 'Application Accepted - BR Publications',
        content: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <h2>Hello {{name}},</h2>
  <p>🎉 Congratulations! Your {{submissionType}} application has been accepted.</p>
  <div style="background:#f9f9f9;border-left:4px solid #4CAF50;padding:20px;margin:20px 0;">
    <h3 style="margin-top:0;">Application #{{applicationId}}</h3>
    <p><strong>Status:</strong> ACCEPTED</p>
    {{#adminNotes}}<div style="background:#fff;padding:15px;margin-top:15px;border:1px solid #ddd;"><strong>Notes:</strong><p>{{adminNotes}}</p></div>{{/adminNotes}}
  </div>
  <p><a href="{{frontendUrl}}/dashboard/user/projects-internships" style="background:#4CAF50;color:white;padding:12px 24px;text-decoration:none;border-radius:4px;display:inline-block;">View Status</a></p>
  <p style="color:#666;font-size:14px;">Best regards,<br>BR Publications Team</p>
</div>`,
        variables: JSON.stringify(['name', 'submissionType', 'applicationId', 'adminNotes', 'frontendUrl']),
        description: 'Sent to Applicant when their project/internship application is accepted',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'PROJECT_DECISION_REJECTED',
        type: 'EMAIL',
        subject: 'Application Status Update - BR Publications',
        content: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <h2>Hello {{name}},</h2>
  <p>Thank you for your interest in our {{submissionType}} program.</p>
  <div style="background:#f9f9f9;border-left:4px solid #f44336;padding:20px;margin:20px 0;">
    <h3 style="margin-top:0;">Application #{{applicationId}}</h3>
    <p><strong>Status:</strong> REJECTED</p>
    {{#adminNotes}}<div style="background:#fff;padding:15px;margin-top:15px;border:1px solid #ddd;"><strong>Notes:</strong><p>{{adminNotes}}</p></div>{{/adminNotes}}
  </div>
  <p>We regret that we cannot proceed at this time. We encourage you to apply again in the future.</p>
  <p style="color:#666;font-size:14px;">Best regards,<br>BR Publications Team</p>
</div>`,
        variables: JSON.stringify(['name', 'submissionType', 'applicationId', 'adminNotes', 'frontendUrl']),
        description: 'Sent to Applicant when their project/internship application is rejected',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },

      // ============================================================
      // CONTACT INQUIRY EMAILS
      // ============================================================
      {
        code: 'CONTACT_INQUIRY_ADMIN',
        type: 'EMAIL',
        subject: 'New Contact Inquiry from {{name}}',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Contact Inquiry</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e3a6e 0%,#2563eb 100%);padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;">BR Publications</h1>
              <p style="margin:8px 0 0;color:#bfdbfe;font-size:14px;">Admin Notification System</p>
            </td>
          </tr>

          <!-- Alert Banner -->
          <tr>
            <td style="background:#eff6ff;border-bottom:3px solid #2563eb;padding:16px 40px;text-align:center;">
              <p style="margin:0;color:#1d4ed8;font-size:15px;font-weight:600;">📬 New Contact Inquiry Received</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 20px;color:#374151;font-size:15px;">Hello <strong>{{adminName}}</strong>,</p>
              <p style="margin:0 0 28px;color:#6b7280;font-size:14px;line-height:1.6;">
                A new contact inquiry has been submitted via the website. Here are the details:
              </p>

              <!-- Contact Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:28px;">
                <tr>
                  <td style="padding:24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">
                          <span style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Full Name</span><br/>
                          <span style="color:#111827;font-size:15px;font-weight:600;">{{name}}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">
                          <span style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Email Address</span><br/>
                          <a href="mailto:{{email}}" style="color:#2563eb;font-size:15px;text-decoration:none;">{{email}}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">
                          <span style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Phone Number</span><br/>
                          <span style="color:#111827;font-size:15px;">{{phone}}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;">
                          <span style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Received On</span><br/>
                          <span style="color:#111827;font-size:15px;">{{receivedDate}}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Message Block -->
              <p style="margin:0 0 10px;color:#374151;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Message</p>
              <div style="background:#1e3a6e;border-radius:8px;padding:20px 24px;">
                <p style="margin:0;color:#e0ecff;font-size:14px;line-height:1.8;white-space:pre-wrap;">{{message}}</p>
              </div>

              <!-- CTA Button -->
              <div style="text-align:center;margin-top:32px;">
                <a href="{{frontendUrl}}/dashboard/admin/contactinquiries"
                   style="display:inline-block;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:600;letter-spacing:0.3px;">
                  Review Inquiry in Dashboard
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6;">
                This is an automated notification from <strong>BR Publications</strong>.<br/>
                Please do not reply to this email. Log in to the admin dashboard to manage this inquiry.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
        variables: JSON.stringify(['adminName', 'name', 'email', 'phone', 'message', 'receivedDate', 'frontendUrl']),
        description: 'Sent to Admin when a new contact inquiry is submitted',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        code: 'CONTACT_INQUIRY_ACKNOWLEDGED',
        type: 'EMAIL',
        subject: "We've Responded to Your Inquiry — BR Publications",
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Your Inquiry — BR Publications</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#065f46 0%,#059669 100%);padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;">BR Publications</h1>
              <p style="margin:8px 0 0;color:#a7f3d0;font-size:14px;">Thank You for Contacting Us</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px;color:#111827;font-size:20px;font-weight:700;">Hello, {{name}}!</h2>
              <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.8;">
                Thank you for reaching out to us. Our team has carefully reviewed your inquiry and we're happy to share the following response with you.
              </p>

              <!-- Response Block -->
              <div style="background:#f0fdf4;border-left:4px solid #059669;border-radius:0 8px 8px 0;padding:24px;margin-bottom:28px;">
                <p style="margin:0 0 8px;color:#065f46;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Our Response</p>
                <p style="margin:0;color:#1f2937;font-size:15px;line-height:1.8;white-space:pre-wrap;">{{adminMessage}}</p>
              </div>

              {{#originalMessage}}
              <!-- Original Message Reference -->
              <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin-bottom:28px;">
                <p style="margin:0 0 8px;color:#9ca3af;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Your Original Message</p>
                <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6;font-style:italic;white-space:pre-wrap;">{{originalMessage}}</p>
              </div>
              {{/originalMessage}}

              <p style="margin:0 0 8px;color:#374151;font-size:14px;line-height:1.6;">
                If you have any further questions, please feel free to reach out to us again. We're always here to help.
              </p>

              <!-- CTA -->
              <div style="text-align:center;margin-top:32px;">
                <a href="{{frontendUrl}}/contact"
                   style="display:inline-block;background:linear-gradient(135deg,#059669,#047857);color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:600;letter-spacing:0.3px;">
                  Contact Us Again
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 6px;color:#374151;font-size:13px;font-weight:600;">BR Publications</p>
              <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6;">
                This email was sent in response to your inquiry submitted via our website.<br/>
                &copy; {{year}} BR Publications. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
        variables: JSON.stringify(['name', 'adminMessage', 'originalMessage', 'frontendUrl', 'year']),
        description: 'Sent to Submitter when an admin acknowledges their inquiry',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }

    ];

    for (const template of templates) {
      const exists = await queryInterface.rawSelect('communication_templates', {
        where: { code: template.code },
      }, ['id']);

      if (!exists) {
        await queryInterface.bulkInsert('communication_templates', [template]);
      } else {
        await queryInterface.bulkUpdate('communication_templates', {
          subject: template.subject,
          content: template.content,
          variables: template.variables,
          updated_at: new Date()
        }, { code: template.code });
        console.log(`Template updated: ${template.code}`);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('communication_templates', null, {});
  }
};
