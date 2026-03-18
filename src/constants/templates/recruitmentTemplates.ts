export const RECRUITMENT_APPLICATION_ADMIN_HTML = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>New Recruitment Application</title>
</head>

<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:40px 20px;">
        <tr>
            <td align="center">

                <table width="600" cellpadding="0" cellspacing="0"
                    style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;">

                    <!-- Header -->
                    <tr>
                        <td
                            style="background:linear-gradient(135deg,#1e3a6e 0%,#2563eb 100%);padding:36px 40px;text-align:center;">
                            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Recruitment Application</h1>
                            <p style="margin:8px 0 0;color:#bfdbfe;font-size:14px;">Admin Notification System</p>
                        </td>
                    </tr>

                    <!-- Alert Banner -->
                    <tr>
                        <td
                            style="background:#eff6ff;border-bottom:3px solid #2563eb;padding:16px 40px;text-align:center;">
                            <p style="margin:0;color:#1d4ed8;font-size:15px;font-weight:600;">
                                📄 New Recruitment Application Submitted
                            </p>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding:36px 40px;">

                            <p style="margin:0 0 18px;color:#374151;font-size:15px;">
                                Hello <strong>{{adminName}}</strong>,
                            </p>

                            <p style="margin:0 0 26px;color:#6b7280;font-size:14px;line-height:1.6;">
                                A new recruitment application has been submitted by
                                <strong>{{applicantName}}</strong> for the role of
                                <strong>{{appliedRole}}</strong>.
                            </p>

                            <!-- Application Details -->
                            <table width="100%" cellpadding="0" cellspacing="0"
                                style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:28px;">
                                <tr>
                                    <td style="padding:24px;">

                                        <table width="100%" cellpadding="0" cellspacing="0">

                                            <tr>
                                                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
                                                    <span
                                                        style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Applicant
                                                        Name</span><br />
                                                    <span
                                                        style="color:#111827;font-size:15px;font-weight:600;">{{applicantName}}</span>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
                                                    <span
                                                        style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Applied
                                                        Role</span><br />
                                                    <span style="color:#111827;font-size:15px;">{{appliedRole}}</span>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
                                                    <span
                                                        style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Application
                                                        ID</span><br />
                                                    <span
                                                        style="color:#111827;font-size:16px;font-weight:700;">{{applicationId}}</span>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td style="padding:10px 0;">
                                                    <span
                                                        style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Submitted
                                                        On</span><br />
                                                    <span
                                                        style="color:#111827;font-size:15px;">{{submissionDate}}</span>
                                                </td>
                                            </tr>

                                        </table>

                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td
                            style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">

                            <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6;">
                                This is an automated notification from the <strong>BR Publications</strong>.<br />
                                Please review the application in the admin dashboard.
                            </p>

                            <p style="margin-top:12px;color:#9ca3af;font-size:12px;">
                                © {{currentYear}} <strong>BR Publications</strong>. All rights reserved.
                            </p>

                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>

</html>`;

export const RECRUITMENT_SUBMISSION_RECEIVED_HTML = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Application Received</title>
</head>

<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:40px 20px;">
        <tr>
            <td align="center">

                <table width="600" cellpadding="0" cellspacing="0"
                    style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;">

                    <!-- Header -->
                    <tr>
                        <td
                            style="background:linear-gradient(135deg,#1e3a6e 0%,#2563eb 100%);padding:36px 40px;text-align:center;">
                            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Recruitment Application</h1>
                            <p style="margin:8px 0 0;color:#bfdbfe;font-size:14px;">Application Confirmation</p>
                        </td>
                    </tr>

                    <!-- Confirmation Banner -->
                    <tr>
                        <td
                            style="background:#ecfdf5;border-bottom:3px solid #10b981;padding:16px 40px;text-align:center;">
                            <p style="margin:0;color:#047857;font-size:15px;font-weight:600;">
                                ✅ Your Application Has Been Successfully Submitted
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
                                Thank you for applying for the position of <strong>{{appliedRole}}</strong>.
                                We have successfully received your application.
                            </p>

                            <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6;">
                                Our recruitment team will carefully review your submission. If your qualifications match
                                our requirements,
                                a member of our team will contact you for the next steps in the selection process.
                            </p>

                            <!-- Application Details -->
                            <table width="100%" cellpadding="0" cellspacing="0"
                                style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
                                <tr>
                                    <td style="padding:24px;">

                                        <table width="100%" cellpadding="0" cellspacing="0">

                                            <tr>
                                                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
                                                    <span
                                                        style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Application
                                                        ID</span><br />
                                                    <span
                                                        style="color:#111827;font-size:16px;font-weight:700;">{{applicationId}}</span>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
                                                    <span
                                                        style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Position
                                                        Applied</span><br />
                                                    <span style="color:#111827;font-size:15px;">{{appliedRole}}</span>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td style="padding:10px 0;">
                                                    <span
                                                        style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Submitted
                                                        On</span><br />
                                                    <span
                                                        style="color:#111827;font-size:15px;">{{submissionDate}}</span>
                                                </td>
                                            </tr>

                                        </table>

                                    </td>
                                </tr>
                            </table>

                            <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">
                                We appreciate your interest in joining our team and thank you for taking the time to
                                submit your application.
                            </p>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td
                            style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">

                            <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6;">
                                This is an automated confirmation from the <strong>BR Publications</strong>.<br />
                                Please keep the application ID for future reference.
                            </p>

                            <p style="margin-top:12px;color:#9ca3af;font-size:12px;">
                                © {{currentYear}} <strong>BR Publications</strong>. All rights reserved.
                            </p>

                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>

</html>`;

export const RECRUITMENT_DECISION_ACCEPTED_HTML = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Application Accepted</title>
</head>

<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 20px;">
        <tr>
            <td align="center">

                <table width="600" cellpadding="0" cellspacing="0"
                    style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;">

                    <!-- Header -->
                    <tr>
                        <td
                            style="background:linear-gradient(135deg,#1e3a6e 0%,#2563eb 100%);padding:36px 40px;text-align:center;">
                            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Recruitment Application
                            </h1>
                            <p style="margin:8px 0 0;color:#bfdbfe;font-size:14px;">Application Update</p>
                        </td>
                    </tr>

                    <!-- Status Banner -->
                    <tr>
                        <td
                            style="background:#ecfdf5;border-bottom:3px solid #10b981;padding:16px 40px;text-align:center;">
                            <p style="margin:0;color:#047857;font-size:15px;font-weight:600;">
                                🎉 Your Application Has Been Accepted
                            </p>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding:36px 40px;">

                            <p style="margin:0 0 18px;color:#374151;font-size:15px;">
                                Hello <strong>{{name}}</strong>,
                            </p>

                            <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6;">
                                Congratulations! Your recruitment application has been successfully approved by our
                                team.
                            </p>

                            <table width="100%" cellpadding="0" cellspacing="0"
                                style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
                                <tr>
                                    <td style="padding:24px;">

                                        <table width="100%" cellpadding="0" cellspacing="0">

                                            <tr>
                                                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
                                                    <span
                                                        style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Application
                                                        ID</span><br />
                                                    <span
                                                        style="color:#111827;font-size:16px;font-weight:700;">{{applicationId}}</span>
                                                </td>
                                            </tr>

                                            <tr>
                                                <td style="padding:10px 0;">
                                                    <span
                                                        style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Assigned
                                                        Role</span><br />
                                                    <span style="color:#111827;font-size:15px;">{{assignedRole}}</span>
                                                </td>
                                            </tr>

                                        </table>

                                    </td>
                                </tr>
                            </table>

                            <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">
                                Our team will contact you soon with further details regarding the next steps.
                            </p>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td
                            style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 40px;text-align:center;">

                            <p style="margin:0;color:#9ca3af;font-size:12px;">
                                This is an automated notification from the <strong>BR Publications</strong>.
                            </p>

                            <p style="margin-top:12px;color:#9ca3af;font-size:12px;">
                                © {{currentYear}} <strong>BR Publications</strong>. All rights reserved.
                            </p>

                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>

</html>`;

export const RECRUITMENT_DECISION_REJECTED_HTML = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Application Update</title>
</head>

<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 20px;">
        <tr>
            <td align="center">

                <table width="600" cellpadding="0" cellspacing="0"
                    style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;">

                    <!-- Header -->
                    <tr>
                        <td
                            style="background:linear-gradient(135deg,#1e3a6e 0%,#2563eb 100%);padding:36px 40px;text-align:center;">
                            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Recruitment Application
                            </h1>
                            <p style="margin:8px 0 0;color:#bfdbfe;font-size:14px;">Application Update</p>
                        </td>
                    </tr>

                    <!-- Status Banner -->
                    <tr>
                        <td
                            style="background:#fef2f2;border-bottom:3px solid #ef4444;padding:16px 40px;text-align:center;">
                            <p style="margin:0;color:#b91c1c;font-size:15px;font-weight:600;">
                                ⚠️ Application Could Not Be Approved
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
                                Thank you for your interest in joining our team. After careful consideration, we regret
                                to inform you that your application could not be approved at this time.
                            </p>

                            <table width="100%" cellpadding="0" cellspacing="0"
                                style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
                                <tr>
                                    <td style="padding:24px;">

                                        <table width="100%" cellpadding="0" cellspacing="0">

                                            <tr>
                                                <td style="padding:10px 0;">
                                                    <span
                                                        style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Application
                                                        ID</span><br />
                                                    <span
                                                        style="color:#111827;font-size:16px;font-weight:700;">{{applicationId}}</span>
                                                </td>
                                            </tr>

                                        </table>

                                    </td>
                                </tr>
                            </table>

                            <p
                                style="margin:0 0 8px;color:#374151;font-size:13px;font-weight:600;text-transform:uppercase;">
                                Reason
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
                                This is an automated notification from the <strong>BR Publications</strong>.
                            </p>

                            <p style="margin-top:12px;color:#9ca3af;font-size:12px;">
                                © {{currentYear}} <strong>BR Publications</strong>. All rights reserved.
                            </p>

                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>

</html>`;

export const RECRUITMENT_TEMPLATES = {
    RECRUITMENT_APPLICATION_ADMIN: {
        subject: 'New Recruitment Application: {{applicantName}} - {{appliedRole}}',
        content: RECRUITMENT_APPLICATION_ADMIN_HTML
    },
    RECRUITMENT_SUBMISSION_RECEIVED: {
        subject: 'Application Received: {{appliedRole}} Role - BR Publications',
        content: RECRUITMENT_SUBMISSION_RECEIVED_HTML
    },
    RECRUITMENT_DECISION_ACCEPTED: {
        subject: 'Welcome to the Team! Application Approved — BR Publications',
        content: RECRUITMENT_DECISION_ACCEPTED_HTML
    },
    RECRUITMENT_DECISION_REJECTED: {
        subject: 'Update on Recruitment Application — BR Publications',
        content: RECRUITMENT_DECISION_REJECTED_HTML
    }
};
