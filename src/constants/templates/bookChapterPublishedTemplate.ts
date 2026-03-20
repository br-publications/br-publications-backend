export const BOOK_CHAPTER_PUBLISHED_TEMPLATE = {
    BOOK_CHAPTER_PUBLISHED: {
        subject: 'Your Book Chapter Has Been Published',
        variables: ['authorName', 'bookTitle', 'publicationDate', 'isbn', 'keywords'],
        content: `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Book Chapter Published</title>
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
                            <p style="margin:0;color:#047857;font-size:15px;font-weight:600;">🎉 Congratulations! Your Book Chapter is Published</p>
                        </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                        <td style="padding:36px 40px;">
                            <p style="margin:0 0 18px;color:#374151;font-size:15px;">Hello <strong>{{authorName}}</strong>,</p>
                            <p style="margin:0 0 20px;color:#6b7280;font-size:14px;line-height:1.6;">We are thrilled to inform you that your book chapter in <strong>{{bookTitle}}</strong> has officially been published and is now available.</p>
                            <!-- Details Card -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
                                <tr>
                                    <td style="padding:24px">
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
                                                    <span style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Book Title</span><br />
                                                    <span style="color:#111827;font-size:15px;">{{bookTitle}}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
                                                    <span style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Published Date</span><br />
                                                    <span style="color:#111827;font-size:15px;">{{publicationDate}}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
                                                    <span style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">ISBN</span><br />
                                                    <span style="color:#111827;font-size:15px;font-weight:600;">{{isbn}}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding:10px 0;">
                                                    <span style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;">Keywords</span><br />
                                                    <span style="color:#111827;font-size:14px;">{{keywords}}</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
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
</html>`
    }
};
