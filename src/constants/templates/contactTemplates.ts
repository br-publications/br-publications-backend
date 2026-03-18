export const CONTACT_INQUIRY_ADMIN_HTML = `<!DOCTYPE html>
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
                <a href="{{frontendUrl}}dashboard/admin/contactinquiries"
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
</html>`;

export const CONTACT_INQUIRY_ACKNOWLEDGED_HTML = `<!DOCTYPE html>
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

              <!-- Original Message Reference -->
              <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin-bottom:28px;">
                <p style="margin:0 0 8px;color:#9ca3af;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Your Original Message</p>
                <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6;font-style:italic;white-space:pre-wrap;">{{originalMessage}}</p>
              </div>

              <p style="margin:0 0 8px;color:#374151;font-size:14px;line-height:1.6;">
                If you have any further questions, please feel free to reach out to us again. We're always here to help.
              </p>
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
</html>`;

export const CONTACT_TEMPLATES = {
  CONTACT_INQUIRY_ADMIN: {
    subject: 'New Contact Inquiry from {{name}}',
    content: CONTACT_INQUIRY_ADMIN_HTML
  },
  CONTACT_INQUIRY_ACKNOWLEDGED: {
    subject: "We've Responded to Your Inquiry — BR Publications",
    content: CONTACT_INQUIRY_ACKNOWLEDGED_HTML
  }
};
