export const TEXTBOOK_TEMPLATES = {
    TEXTBOOK_SUBMISSION_ADMIN: {
        subject: 'New Textbook Submission Received',
        variables: ['adminName', 'authorName', 'bookTitle', 'submissionDate', 'currentYear'],
        content: `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>New Textbook Submission</title>
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
                                📚 New Textbook Submission Received
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
                                A new textbook submission has been received from <strong>{{authorName}}</strong>.
                                Please review the submission details below.
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
                                Please log in to the admin dashboard to review and process this submission.
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
    TEXTBOOK_SUBMISSION_RECEIVED: {
        subject: 'Submission Received: {{bookTitle}}',
        variables: ['name', 'bookTitle', 'submissionDate', 'currentYear'],
        content: `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Submission Received</title>
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
                                ✅ Your Textbook Submission Has Been Received
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
                                Thank you for submitting your textbook titled <strong>{{bookTitle}}</strong>.
                                We have successfully received your submission.
                            </p>

                            <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6;">
                                Our editorial team will carefully review your manuscript and evaluate it according to
                                our publication guidelines.
                                If additional information is required or if your submission proceeds to the next stage
                                of the review process, our team will contact you.
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
                                                        style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Book
                                                        Title</span><br />
                                                    <span style="color:#111827;font-size:15px;">{{bookTitle}}</span>
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
                                We appreciate your interest in publishing with <strong>BR Publications</strong>.
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
    TEXTBOOK_PROPOSAL_ACCEPTED: {
        subject: 'Proposal Accepted: {{bookTitle}}',
        variables: ['name', 'bookTitle', 'adminName', 'adminNotes', 'currentYear'],
        content: `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Proposal Accepted</title>
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
                            <p style="margin:8px 0 0;color:#bfdbfe;font-size:14px;">Submission Update</p>
                        </td>
                    </tr>

                    <!-- Banner -->
                    <tr>
                        <td
                            style="background:#ecfdf5;border-bottom:3px solid #10b981;padding:16px 40px;text-align:center;">
                            <p style="margin:0;color:#047857;font-size:15px;font-weight:600;">
                                🎉 Your Textbook Proposal Has Been Accepted
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
                                We are pleased to inform you that your textbook proposal titled
                                <strong>{{bookTitle}}</strong> has been <strong>accepted</strong> by our editorial team.
                            </p>

                            <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6;">
                                Your submission was reviewed by <strong>{{adminName}}</strong>.
                                Our team will reach out to you with the next steps in the publication process.
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
                                                        style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Book
                                                        Title</span><br />
                                                    <span style="color:#111827;font-size:15px;">{{bookTitle}}</span>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td style="padding:10px 0;">
                                                    <span
                                                        style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Reviewed
                                                        By</span><br />
                                                    <span style="color:#111827;font-size:15px;">{{adminName}}</span>
                                                </td>
                                            </tr>

                                        </table>

                                    </td>
                                </tr>
                            </table>

                            <!-- Optional Notes -->
                            {{adminNotes}}

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
    TEXTBOOK_PROPOSAL_REJECTED: {
        subject: 'Proposal Update: {{bookTitle}}',
        variables: ['name', 'bookTitle', 'adminName', 'adminNotes', 'currentYear'],
        content: `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Proposal Update</title>
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
                            <p style="margin:8px 0 0;color:#bfdbfe;font-size:14px;">Submission Update</p>
                        </td>
                    </tr>

                    <!-- Banner -->
                    <tr>
                        <td
                            style="background:#fef2f2;border-bottom:3px solid #ef4444;padding:16px 40px;text-align:center;">
                            <p style="margin:0;color:#b91c1c;font-size:15px;font-weight:600;">
                                ⚠️ Your Textbook Proposal Was Not Approved
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
                                Thank you for submitting your textbook proposal titled <strong>{{bookTitle}}</strong>.
                                After careful review, we regret to inform you that it could not be approved at this
                                time.
                            </p>

                            <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6;">
                                The decision was made by <strong>{{adminName}}</strong>. Please see the notes below for
                                additional information.
                            </p>

                            <!-- Notes -->
                            <p
                                style="margin:0 0 8px;color:#374151;font-size:13px;font-weight:600;text-transform:uppercase;">
                                Reason / Notes
                            </p>

                            <div style="background:#fef2f2;border:1px solid #ef4444;border-radius:8px;padding:18px;">
                                <p style="margin:0;color:#7f1d1d;font-size:14px;line-height:1.6;">
                                    {{adminNotes}}
                                </p>
                            </div>

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
    TEXTBOOK_REVISION_REQUESTED: {
        subject: 'Revision Requested: {{bookTitle}}',
        variables: ['name', 'bookTitle', 'revisionNumber', 'adminName', 'comments', 'currentYear'],
        content: `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Revision Requested</title>
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
<p style="margin:8px 0 0;color:#bfdbfe;font-size:14px;">Manuscript Review Update</p>
</td>
</tr>

<!-- Banner -->
<tr>
<td style="background:#fff7ed;border-bottom:3px solid #f97316;padding:16px 40px;text-align:center;">
<p style="margin:0;color:#c2410c;font-size:15px;font-weight:600;">
✏️ Revision Requested for Your Textbook Submission
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
During the review of your manuscript titled <strong>{{bookTitle}}</strong>, our editorial team has requested revisions to improve certain sections of the submission.
</p>

<p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6;">
This is <strong>Revision {{revisionNumber}}</strong>, requested by <strong>{{adminName}}</strong>.  
Please review the comments below and submit an updated version of your manuscript.
</p>

<!-- Details -->
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
<tr>
<td style="padding:24px">

<table width="100%" cellpadding="0" cellspacing="0">

<tr>
<td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
<span style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Book Title</span><br/>
<span style="color:#111827;font-size:15px;">{{bookTitle}}</span>
</td>
</tr>

<tr>
<td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
<span style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Revision Number</span><br/>
<span style="color:#111827;font-size:15px;">{{revisionNumber}}</span>
</td>
</tr>

<tr>
<td style="padding:10px 0;">
<span style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Requested By</span><br/>
<span style="color:#111827;font-size:15px;">{{adminName}}</span>
</td>
</tr>

</table>

</td>
</tr>
</table>

<!-- Comments -->
<p style="margin:0 0 8px;color:#374151;font-size:13px;font-weight:600;text-transform:uppercase;">
Reviewer Comments
</p>

<div style="background:#fff7ed;border:1px solid #f97316;border-radius:8px;padding:18px;">
<p style="margin:0;color:#9a3412;font-size:14px;line-height:1.6;">
{{comments}}
</p>
</div>

<p style="margin-top:24px;color:#6b7280;font-size:14px;">
Please submit your revised manuscript through the submission portal.  
Our editorial team will review the updated version once it is received.
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
    TEXTBOOK_REVISION_SUBMITTED: {
        subject: 'Revision Submitted: {{bookTitle}}',
        variables: ['name', 'authorName', 'revisionNumber', 'bookTitle', 'authorMessage', 'currentYear'],
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
                            style="background:linear-gradient(135deg,#1e3a6e,#2563eb);padding:36px 40px;text-align:center;">
                            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">BR Publications</h1>
                            <p style="margin:8px 0 0;color:#bfdbfe;font-size:14px;">Manuscript Revision Update</p>
                        </td>
                    </tr>

                    <!-- Banner -->
                    <tr>
                        <td
                            style="background:#eff6ff;border-bottom:3px solid #2563eb;padding:16px 40px;text-align:center;">
                            <p style="margin:0;color:#1d4ed8;font-size:15px;font-weight:600;">
                                📄 A Revised Manuscript Has Been Submitted
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
                                <strong>{{authorName}}</strong> has submitted <strong>Revision
                                    {{revisionNumber}}</strong> for the manuscript titled
                                <strong>{{bookTitle}}</strong>.
                            </p>

                            <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">
                                Please review the updated manuscript and continue the editorial evaluation process.
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
                                                        style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Book
                                                        Title</span><br />
                                                    <span style="color:#111827;font-size:15px;">{{bookTitle}}</span>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
                                                    <span
                                                        style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Author</span><br />
                                                    <span style="color:#111827;font-size:15px;">{{authorName}}</span>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td style="padding:10px 0;">
                                                    <span
                                                        style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Revision
                                                        Number</span><br />
                                                    <span
                                                        style="color:#111827;font-size:15px;">{{revisionNumber}}</span>
                                                </td>
                                            </tr>

                                        </table>

                                    </td>
                                </tr>
                            </table>

                            <!-- Author Message -->
                            <p
                                style="margin:0 0 8px;color:#374151;font-size:13px;font-weight:600;text-transform:uppercase;">
                                Author Comments
                            </p>

                            <div style="background:#eff6ff;border:1px solid #2563eb;border-radius:8px;padding:18px;">
                                <p style="margin:0;color:#1e3a8a;font-size:14px;line-height:1.6;white-space:pre-wrap;">
                                    {{authorMessage}}
                                </p>
                            </div>

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
    TEXTBOOK_DECISION_APPROVED: {
        subject: 'Textbook Approved: {{bookTitle}}',
        variables: ['name', 'bookTitle', 'adminName', 'adminNotes', 'currentYear'],
        content: `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Textbook Approved</title>
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
                            <p style="margin:8px 0 0;color:#bfdbfe;font-size:14px;">Official Approval Notification</p>
                        </td>
                    </tr>

                    <!-- Banner -->
                    <tr>
                        <td
                            style="background:#f0fdf4;border-bottom:3px solid #10b981;padding:16px 40px;text-align:center;">
                            <p style="margin:0;color:#15803d;font-size:15px;font-weight:600;">
                                🎉 Congratulations! Your Textbook Has Been Approved
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
                                We are pleased to inform you that your textbook titled
                                <strong>{{bookTitle}}</strong> has been officially <strong>approved</strong> by our
                                editorial team.
                            </p>

                            <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6;">
                                After reviewing the submitted manuscript and revisions,
                                <strong>{{adminName}}</strong> has confirmed that the submission meets our publication
                                standards.
                            </p>

                            <p style="margin:0 0 28px;color:#6b7280;font-size:14px;line-height:1.6;">
                                Our team will update you shortly regarding the next steps in the publication process.
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
                                                        style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Textbook
                                                        Title</span><br />
                                                    <span style="color:#111827;font-size:15px;">{{bookTitle}}</span>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td style="padding:10px 0;">
                                                    <span
                                                        style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Approved
                                                        By</span><br />
                                                    <span style="color:#111827;font-size:15px;">{{adminName}}</span>
                                                </td>
                                            </tr>

                                        </table>

                                    </td>
                                </tr>
                            </table>

                            {{adminNotes}}

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
    TEXTBOOK_DECISION_REJECTED: {
        subject: 'Textbook Decision: {{bookTitle}}',
        variables: ['name', 'bookTitle', 'adminName', 'adminNotes', 'currentYear'],
        content: `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Textbook Decision</title>
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
                            <p style="margin:8px 0 0;color:#bfdbfe;font-size:14px;">Official Decision Notification</p>
                        </td>
                    </tr>

                    <!-- Banner -->
                    <tr>
                        <td
                            style="background:#fef2f2;border-bottom:3px solid #ef4444;padding:16px 40px;text-align:center;">
                            <p style="margin:0;color:#b91c1c;font-size:15px;font-weight:600;">
                                ⚠️ Update Regarding Your Textbook Submission
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
                                Thank you for submitting your textbook titled <strong>{{bookTitle}}</strong>.
                                After reviewing the manuscript and the submitted revisions, we regret to inform you that
                                the proposal could not be approved at this time.
                            </p>

                            <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6;">
                                The decision was made by <strong>{{adminName}}</strong>. Please review the feedback
                                below for additional details.
                            </p>

                            <!-- Notes -->
                            <p
                                style="margin:0 0 8px;color:#374151;font-size:13px;font-weight:600;text-transform:uppercase;">
                                Reason / Editorial Notes
                            </p>

                            <div style="background:#fef2f2;border:1px solid #ef4444;border-radius:8px;padding:18px;">
                                <p style="margin:0;color:#7f1d1d;font-size:14px;line-height:1.6;white-space:pre-wrap;">
                                    {{adminNotes}}
                                </p>
                            </div>

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
    TEXTBOOK_STATUS_CHANGED: {
        subject: 'Status Update: {{bookTitle}}',
        variables: ['name', 'bookTitle', 'changedBy', 'previousStatus', 'newStatus', 'currentYear'],
        content: `
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
                        <td
                            style="background:linear-gradient(135deg,#1e3a6e,#2563eb);padding:36px 40px;text-align:center;">
                            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">BR Publications</h1>
                            <p style="margin:8px 0 0;color:#bfdbfe;font-size:14px;">Submission Status Update</p>
                        </td>
                    </tr>

                    <!-- Banner -->
                    <tr>
                        <td
                            style="background:#eff6ff;border-bottom:3px solid #2563eb;padding:16px 40px;text-align:center;">
                            <p style="margin:0;color:#1d4ed8;font-size:15px;font-weight:600;">
                                🔔 Status Update for Your Textbook Submission
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
                                The status of your textbook submission titled <strong>{{bookTitle}}</strong> has been
                                updated.
                            </p>

                            <p style="margin:0 0 28px;color:#6b7280;font-size:14px;line-height:1.6;">
                                This change was made by <strong>{{changedBy}}</strong>.
                                Please review the updated status below.
                            </p>

                            <!-- Status Card -->
                            <table width="100%" cellpadding="0" cellspacing="0"
                                style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;">
                                <tr>
                                    <td style="padding:24px">

                                        <table width="100%" cellpadding="0" cellspacing="0">

                                            <tr>
                                                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
                                                    <span
                                                        style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Textbook
                                                        Title</span><br />
                                                    <span style="color:#111827;font-size:15px;">{{bookTitle}}</span>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
                                                    <span
                                                        style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Previous
                                                        Status</span><br />
                                                    <span
                                                        style="color:#ef4444;font-size:15px;font-weight:600;">{{previousStatus}}</span>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
                                                    <span
                                                        style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">New
                                                        Status</span><br />
                                                    <span
                                                        style="color:#10b981;font-size:15px;font-weight:600;">{{newStatus}}</span>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td style="padding:10px 0;">
                                                    <span
                                                        style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Updated
                                                        By</span><br />
                                                    <span style="color:#111827;font-size:15px;">{{changedBy}}</span>
                                                </td>
                                            </tr>

                                        </table>

                                    </td>
                                </tr>
                            </table>

                            <p style="margin-top:28px;color:#6b7280;font-size:14px;line-height:1.6;">
                                If you have any questions regarding this update, please wait for further instructions
                                from our editorial team. We will notify you if additional action is required.
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
    TEXTBOOK_DELIVERY_DETAILS_REQUESTED: {
        subject: 'Delivery Details Required: {{bookTitle}}',
        variables: ['name', 'bookTitle', 'isbnNumber', 'currentYear'],
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

                <table width="600" cellpadding="0" cellspacing="0"
                    style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;">

                    <!-- Header -->
                    <tr>
                        <td
                            style="background:linear-gradient(135deg,#1e3a6e,#2563eb);padding:36px 40px;text-align:center;">
                            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">BR Publications</h1>
                            <p style="margin:8px 0 0;color:#bfdbfe;font-size:14px;">Publication Process Update</p>
                        </td>
                    </tr>

                    <!-- Banner -->
                    <tr>
                        <td
                            style="background:#eff6ff;border-bottom:3px solid #2563eb;padding:16px 40px;text-align:center;">
                            <p style="margin:0;color:#1d4ed8;font-size:15px;font-weight:600;">
                                📦 Delivery Address Required for Your Textbook
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
                                We are pleased to inform you that your textbook titled
                                <strong>{{bookTitle}}</strong> has successfully been assigned its official identifiers.
                            </p>

                            <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6;">
                                The <strong>ISBN</strong> for your publication have been
                                recorded in our system.
                                To proceed with the publication process and arrange shipment of author copies, we
                                require your delivery address.
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
                                                        style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Textbook
                                                        Title</span><br />
                                                    <span style="color:#111827;font-size:15px;">{{bookTitle}}</span>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td style="padding:10px 0;">
                                                    <span
                                                        style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">ISBN
                                                        Number</span><br />
                                                    <span
                                                        style="color:#111827;font-size:15px;font-weight:600;">{{isbnNumber}}</span>
                                                </td>
                                            </tr>

                                        </table>

                                    </td>
                                </tr>
                            </table>

                            <p style="margin-top:24px;color:#6b7280;font-size:14px;line-height:1.6;">
                                If you have any questions or require assistance, please feel free to contact our support
                                team.
                            </p>

                            <p style="margin-top:10px;color:#6b7280;font-size:14px;">
                                Best regards,<br />
                                <strong>BR Publications Team</strong>
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
    TEXTBOOK_PUBLISHED_AUTHOR: {
        subject: 'Congratulations! Your Textbook is Published: {{bookTitle}}',
        variables: ['name', 'bookTitle', 'publishDate', 'isbn', 'doi', 'frontendUrl', 'currentYear'],
        content: `
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

                <table width="600" cellpadding="0" cellspacing="0"
                    style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;">

                    <!-- Header -->
                    <tr>
                        <td
                            style="background:linear-gradient(135deg,#1e3a6e,#2563eb);padding:36px 40px;text-align:center;">
                            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">BR Publications</h1>
                            <p style="margin:8px 0 0;color:#bfdbfe;font-size:14px;">Publication Process Update</p>
                        </td>
                    </tr>

                    <!-- Banner -->
                    <tr>
                        <td
                            style="background:#ecfdf5;border-bottom:3px solid #10b981;padding:16px 40px;text-align:center;">
                            <p style="margin:0;color:#047857;font-size:15px;font-weight:600;">
                                🎉 Congratulations! Your Textbook is Published
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
                                We are thrilled to inform you that your textbook titled
                                <strong>{{bookTitle}}</strong> has officially been published and is now available.
                            </p>

                            <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6;">
                                This is a major milestone in your publishing journey. Your hard work and dedication
                                have culminated in the final release of your publication. Below are the official
                                identifiers for your work.
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
                                                        style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Textbook
                                                        Title</span><br />
                                                    <span style="color:#111827;font-size:15px;">{{bookTitle}}</span>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
                                                    <span
                                                        style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Published
                                                        Date</span><br />
                                                    <span style="color:#111827;font-size:15px;">{{publishDate}}</span>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
                                                    <span
                                                        style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">ISBN
                                                        Number</span><br />
                                                    <span
                                                        style="color:#111827;font-size:15px;font-weight:600;">{{isbn}}</span>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td style="padding:10px 0;">
                                                    <span
                                                        style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">DOI</span><br />
                                                    <span
                                                        style="color:#111827;font-size:15px;">{{doi}}</span>
                                                </td>
                                            </tr>

                                        </table>

                                    </td>
                                </tr>
                            </table>

                            <div style="text-align:center;margin-top:32px;margin-bottom:24px;">
                                <a href="{{frontendUrl}}product/find/{{isbn}}"
                                    style="background:#2563eb;color:#ffffff;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:600;display:inline-block;">
                                    View Publication
                                </a>
                            </div>

                            <p style="margin-top:24px;color:#6b7280;font-size:14px;line-height:1.6;">
                                If you have any questions or require assistance, please feel free to contact our support
                                team.
                            </p>

                            <p style="margin-top:10px;color:#6b7280;font-size:14px;">
                                Best regards,<br />
                                <strong>BR Publications Team</strong>
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
    TEXTBOOK_BULK_UPLOAD_REPORT: {
        subject: 'Bulk Upload Report - {{currentDate}}',
        variables: ['currentDate', 'name', 'total', 'successCount', 'failureCount', 'duration', 'currentYear'],
        content: `
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
                <table width="600" cellpadding="0" cellspacing="0"
                    style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;">
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
                            <p style="margin:0 0 18px;color:#374151;font-size:15px;">Hello <strong>{{name}}</strong>,</p>
                            <p style="margin:0 0 20px;color:#6b7280;font-size:14px;line-height:1.6;">The bulk upload process has finished. Below is the summary of the operations performed.</p>

                            <!-- Summary Card -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
                                <tr>
                                    <td style="padding:24px">
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
                                                    <span style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Total Processed</span><br />
                                                    <span style="color:#111827;font-size:18px;font-weight:700;">{{total}}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
                                                    <table width="100%" cellpadding="0" cellspacing="0">
                                                        <tr>
                                                            <td width="50%">
                                                                <span style="color:#10b981;font-size:12px;font-weight:600;text-transform:uppercase;">Successful</span><br />
                                                                <span style="color:#059669;font-size:18px;font-weight:700;">{{successCount}}</span>
                                                            </td>
                                                            <td width="50%">
                                                                <span style="color:#ef4444;font-size:12px;font-weight:600;text-transform:uppercase;">Failed</span><br />
                                                                <span style="color:#dc2626;font-size:18px;font-weight:700;">{{failureCount}}</span>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding:10px 0;">
                                                    <span style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Total Duration</span><br />
                                                    <span style="color:#111827;font-size:15px;">{{duration}}</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin-top:24px;color:#6b7280;font-size:14px;line-height:1.6;">This report provides a summary of the batch operation. Individual authors have been notified of their successful publications.</p>
                            <p style="margin-top:10px;color:#6b7280;font-size:14px;">Best regards,<br /><strong>BR Publications Management System</strong></p>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">
                            <p style="margin:0;color:#9ca3af;font-size:12px;">This is an automated administrative report from <strong>BR Publications</strong>.</p>
                            <p style="margin-top:4px;color:#9ca3af;font-size:12px;">© {{currentYear}} BR Publications. All rights reserved.</p>
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
    TEXTBOOK_COMMENT: {
        subject: 'New {{isReplyUppercase}}: {{bookTitle}}',
        variables: ['isReplyUppercase', 'bookTitle', 'name', 'commenterName', 'isReplyText', 'message', 'frontendUrl', 'currentYear'],
        content: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>New Discussion Notification</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0"
                    style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;">
                    <!-- Header -->
                    <tr>
                        <td style="background:linear-gradient(135deg,#581c87,#7c3aed);padding:36px 40px;text-align:center;">
                            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">BR Publications</h1>
                            <p style="margin:8px 0 0;color:#ddd6fe;font-size:14px;">Discussion Thread Update</p>
                        </td>
                    </tr>
                    <!-- Banner -->
                    <tr>
                        <td style="background:#f5f3ff;border-bottom:3px solid #8b5cf6;padding:16px 40px;text-align:center;">
                            <p style="margin:0;color:#6d28d9;font-size:15px;font-weight:600;">
                                💬 New Activity in your Textbook Discussion
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
                                <strong>{{commenterName}}</strong> has {{isReplyText}} your textbook submission <strong>{{bookTitle}}</strong>.
                            </p>
                            
                            <!-- Message Card -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:8px;margin-bottom:24px;">
                                <tr>
                                    <td style="padding:24px">
                                        <p style="margin:0 0 8px;color:#7c3aed;font-size:12px;font-weight:700;text-transform:uppercase;">
                                            Message Content
                                        </p>
                                        <div style="color:#111827;font-size:15px;line-height:1.6;white-space:pre-wrap;">{{message}}</div>
                                    </td>
                                </tr>
                            </table>

                             <div style="text-align:center;">
                                <a href="{{frontendUrl}}dashboard" style="background:#7c3aed;color:#ffffff;padding:14px 28px;text-decoration:none;border-radius:6px;font-weight:600;display:inline-block;">
                                    View & Reply in Dashboard
                                </a>
                            </div>
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
    }

};
