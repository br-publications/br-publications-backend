/**
 * ============================================================
 * MONTHLY ADMIN REPORT EMAIL
 * ============================================================
 * Sends a comprehensive, professional monthly report to admin.
 * Covers all 6 key modules of the BR Publications platform.
 */

import { sendEmail, FRONTEND_URL, EmailCategory } from './base';

interface MonthlyReportData {
    period: { label: string; start: string; end: string };
    data: {
        bookChapterSubmissions: { total: number; byStatus: Record<string, number> };
        textBookSubmissions: { total: number; byStatus: Record<string, number> };
        publications: { newBooks: number; newChapters: number; totalByType: Record<string, number> };
        recruitment: { total: number; byStatus: Record<string, number>; byRole: Record<string, number> };
        projects: { total: number; byType: Record<string, number>; byStatus: Record<string, number> };
        contactInquiries: { total: number; byStatus: Record<string, number> };
        newUsers: number;
    };
}

// ─── Helpers ────────────────────────────────────────────────

const statusBadge = (status: string, count: number): string => {
    const colors: Record<string, string> = {
        SUBMITTED: '#3b82f6',
        UNDER_REVIEW: '#f59e0b',
        EDITORIAL_REVIEW: '#8b5cf6',
        APPROVED: '#10b981',
        ISBN_APPLIED: '#0891b2',
        PUBLICATION_IN_PROGRESS: '#f97316',
        PUBLISHED: '#059669',
        REJECTED: '#ef4444',
        WITHDRAWN: '#6b7280',
        PENDING: '#f59e0b',
        ACKNOWLEDGED: '#10b981',
        ACCEPTED: '#10b981',
        DECLINED: '#ef4444',
        COMPLETED: '#059669',
        EXPIRED: '#6b7280',
        WEB: '#3b82f6',
        MOBILE: '#8b5cf6',
        INTERNSHIP: '#f59e0b',
        CHAPTER: '#2563eb',
        TEXTBOOK: '#059669',
        editor: '#2563eb',
        reviewer: '#8b5cf6',
    };
    const color = colors[status] || '#6b7280';
    return `
      <span style="display:inline-flex;align-items:center;gap:4px;background:${color}18;border:1px solid ${color}40;border-radius:4px;padding:2px 8px;margin:2px 3px;">
        <span style="width:6px;height:6px;border-radius:50%;background:${color};display:inline-block;"></span>
        <span style="color:${color};font-size:11px;font-weight:600;">${status}</span>
        <span style="color:${color};font-size:11px;font-weight:700;margin-left:2px;">${count}</span>
      </span>`;
};

const statusRows = (obj: Record<string, number>): string => {
    if (!obj || Object.keys(obj).length === 0) return '<tr><td colspan="2" style="color:#9ca3af;font-size:11px;padding:6px 0;">No data for this period</td></tr>';
    return Object.entries(obj)
        .filter(([, v]) => v > 0)
        .map(([k, v]) => `
          <tr>
            <td style="padding:4px 8px 4px 0;">${statusBadge(k, v)}</td>
            <td style="padding:4px 0;text-align:right;">
              <span style="font-size:12px;font-weight:700;color:#111827;">${v}</span>
            </td>
          </tr>`).join('');
};

const sectionCard = (
    emoji: string,
    title: string,
    total: number,
    totalLabel: string,
    color: string,
    content: string
): string => `
<tr>
  <td style="padding:0 0 12px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
      <!-- Section Header -->
      <tr>
        <td style="background:${color}08;border-bottom:2px solid ${color}30;padding:10px 16px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <span style="font-size:14px;font-weight:700;color:#111827;">${emoji} ${title}</span>
              </td>
              <td style="text-align:right;">
                <span style="font-size:20px;font-weight:800;color:${color};">${total}</span>
                <span style="font-size:10px;color:#6b7280;display:block;">${totalLabel}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <!-- Section Body -->
      <tr>
        <td style="padding:10px 16px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            ${content}
          </table>
        </td>
      </tr>
    </table>
  </td>
</tr>`;

// ─── Main export ─────────────────────────────────────────────

export const sendMonthlyAdminReportEmail = async (
    adminEmail: string,
    adminName: string,
    report: MonthlyReportData
): Promise<void> => {
    const { data, period } = report;

    const bcsStatusContent = statusRows(data.bookChapterSubmissions.byStatus);
    const tbStatusContent = statusRows(data.textBookSubmissions.byStatus);
    const contactStatusContent = statusRows(data.contactInquiries.byStatus);
    const recruitmentStatusContent = statusRows(data.recruitment.byStatus);
    const recruitmentRoleContent = statusRows(data.recruitment.byRole);
    const projectsTypeContent = statusRows(data.projects.byType);
    const projectsStatusContent = statusRows(data.projects.byStatus);

    const subject = `BR Publications — Monthly Report: ${period.label}`;
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Monthly Report — BR Publications</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 12px;">
  <tr>
    <td align="center">
      <table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;">

        <!-- ═══ HEADER ═══ -->
        <tr>
          <td style="background:linear-gradient(135deg,#1e3a6e 0%,#2563eb 60%,#1d4ed8 100%);border-radius:10px 10px 0 0;padding:24px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <p style="margin:0;color:#bfdbfe;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Admin Report</p>
                  <h1 style="margin:4px 0 0;color:#fff;font-size:20px;font-weight:800;letter-spacing:0.3px;">BR Publications</h1>
                </td>
                <td style="text-align:right;">
                  <p style="margin:0;color:#bfdbfe;font-size:10px;">Monthly Summary</p>
                  <p style="margin:4px 0 0;color:#fff;font-size:14px;font-weight:700;">${period.label}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ═══ GREETING ═══ -->
        <tr>
          <td style="background:#fff;padding:16px 28px 0;">
            <p style="margin:0;color:#374151;font-size:13px;">Hello <strong>${adminName}</strong>,</p>
            <p style="margin:6px 0 0;color:#6b7280;font-size:12px;line-height:1.6;">
              Here is your automated monthly summary for <strong>${period.label}</strong>. 
              This report covers all major activities across the BR Publications platform.
            </p>
          </td>
        </tr>

        <!-- ═══ KPI BAR ═══ -->
        <tr>
          <td style="background:#fff;padding:12px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;">
              <tr>
                <td style="padding:10px 0;text-align:center;border-right:1px solid #e2e8f0;">
                  <p style="margin:0;font-size:18px;font-weight:800;color:#2563eb;">${data.bookChapterSubmissions.total}</p>
                  <p style="margin:2px 0 0;font-size:10px;color:#6b7280;">BCS</p>
                </td>
                <td style="padding:10px 0;text-align:center;border-right:1px solid #e2e8f0;">
                  <p style="margin:0;font-size:18px;font-weight:800;color:#059669;">${data.textBookSubmissions.total}</p>
                  <p style="margin:2px 0 0;font-size:10px;color:#6b7280;">Textbooks</p>
                </td>
                <td style="padding:10px 0;text-align:center;border-right:1px solid #e2e8f0;">
                  <p style="margin:0;font-size:18px;font-weight:800;color:#f59e0b;">${data.publications.newBooks + data.publications.newChapters}</p>
                  <p style="margin:2px 0 0;font-size:10px;color:#6b7280;">Published</p>
                </td>
                <td style="padding:10px 0;text-align:center;border-right:1px solid #e2e8f0;">
                  <p style="margin:0;font-size:18px;font-weight:800;color:#8b5cf6;">${data.recruitment.total}</p>
                  <p style="margin:2px 0 0;font-size:10px;color:#6b7280;">Recruitment</p>
                </td>
                <td style="padding:10px 0;text-align:center;border-right:1px solid #e2e8f0;">
                  <p style="margin:0;font-size:18px;font-weight:800;color:#f97316;">${data.projects.total}</p>
                  <p style="margin:2px 0 0;font-size:10px;color:#6b7280;">Projects</p>
                </td>
                <td style="padding:10px 0;text-align:center;">
                  <p style="margin:0;font-size:18px;font-weight:800;color:#ec4899;">${data.contactInquiries.total}</p>
                  <p style="margin:2px 0 0;font-size:10px;color:#6b7280;">Inquiries</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ═══ NEW USERS ═══ -->
        <tr>
          <td style="background:#fff;padding:0 28px 12px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#0f172a,#1e3a6e);border-radius:8px;">
              <tr>
                <td style="padding:10px 16px;">
                  <span style="font-size:12px;color:#bfdbfe;font-weight:600;">👤 New Users Registered</span>
                  <span style="font-size:22px;font-weight:800;color:#fff;margin-left:16px;">${data.newUsers}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ═══ SECTIONS ═══ -->
        <tr>
          <td style="background:#fff;padding:0 28px 16px;">
            <table width="100%" cellpadding="0" cellspacing="0">

              ${sectionCard(
        '📘', 'Book Chapter Submissions',
        data.bookChapterSubmissions.total, 'this month', '#2563eb',
        bcsStatusContent
    )}

              ${sectionCard(
        '📗', 'Textbook Submissions',
        data.textBookSubmissions.total, 'this month', '#059669',
        tbStatusContent
    )}

              ${sectionCard(
        '📚', 'Published Books & Chapters',
        data.publications.newBooks + data.publications.newChapters, 'total published', '#f59e0b',
        `<tr>
                    <td style="padding:4px 0;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding:4px 8px;background:#f0fdf4;border-radius:6px;text-align:center;">
                            <p style="margin:0;font-size:11px;color:#6b7280;">Books Published</p>
                            <p style="margin:2px 0 0;font-size:20px;font-weight:800;color:#059669;">${data.publications.newBooks}</p>
                          </td>
                          <td style="width:8px;"></td>
                          <td style="padding:4px 8px;background:#eff6ff;border-radius:6px;text-align:center;">
                            <p style="margin:0;font-size:11px;color:#6b7280;">Chapter Books</p>
                            <p style="margin:2px 0 0;font-size:20px;font-weight:800;color:#2563eb;">${data.publications.newChapters}</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>`
    )}

              ${sectionCard(
        '👥', 'Recruitment Applications',
        data.recruitment.total, 'this month', '#8b5cf6',
        `<tr><td colspan="2" style="padding-bottom:6px;">
                    <p style="margin:0;font-size:10px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">By Status</p>
                  </td></tr>
                  ${recruitmentStatusContent}
                  <tr><td colspan="2" style="padding:6px 0 4px;">
                    <p style="margin:0;font-size:10px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">By Role</p>
                  </td></tr>
                  ${recruitmentRoleContent}`
    )}

              ${sectionCard(
        '💼', 'Projects & Internships',
        data.projects.total, 'this month', '#f97316',
        `<tr><td colspan="2" style="padding-bottom:6px;">
                    <p style="margin:0;font-size:10px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">By Type</p>
                  </td></tr>
                  ${projectsTypeContent}
                  <tr><td colspan="2" style="padding:6px 0 4px;">
                    <p style="margin:0;font-size:10px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">By Status</p>
                  </td></tr>
                  ${projectsStatusContent}`
    )}

              ${sectionCard(
        '📩', 'Contact Inquiries',
        data.contactInquiries.total, 'this month', '#ec4899',
        `${contactStatusContent}
                  <tr><td colspan="2" style="padding-top:6px;">
                    <span style="font-size:11px;color:#6b7280;">Response rate: </span>
                    <span style="font-size:12px;font-weight:700;color:#059669;">
                      ${data.contactInquiries.total > 0
            ? Math.round(((data.contactInquiries.byStatus['ACKNOWLEDGED'] || 0) / data.contactInquiries.total) * 100)
            : 0}%
                    </span>
                  </td></tr>`
    )}

            </table>
          </td>
        </tr>

        <!-- ═══ CTA ═══ -->
        <tr>
          <td style="background:#fff;padding:0 28px 20px;text-align:center;">
            <a href="${FRONTEND_URL}dashboard/admin/stats"
               style="display:inline-block;background:linear-gradient(135deg,#1e3a6e,#2563eb);color:#fff;padding:10px 28px;border-radius:6px;text-decoration:none;font-size:13px;font-weight:700;letter-spacing:0.3px;">
              View Full Dashboard →
            </a>
          </td>
        </tr>

        <!-- ═══ FOOTER ═══ -->
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;border-radius:0 0 10px 10px;padding:14px 28px;text-align:center;">
            <p style="margin:0;color:#374151;font-size:11px;font-weight:600;">BR Publications</p>
            <p style="margin:4px 0 0;color:#9ca3af;font-size:10px;line-height:1.6;">
              This is an automated monthly report. Generated on ${new Date().toLocaleString('en-IN', { dateStyle: 'long' })}.<br/>
              © ${new Date().getFullYear()} BR Publications. All rights reserved.
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

    await sendEmail(adminEmail, subject, html, undefined, EmailCategory.GENERAL);
};
