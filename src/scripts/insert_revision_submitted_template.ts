import { Sequelize, DataTypes, Model } from 'sequelize';
import * as dotenv from 'dotenv';

dotenv.config();

// Define CommunicationsType enum to match model
enum CommunicationType {
    EMAIL = 'EMAIL',
    NOTIFICATION = 'NOTIFICATION'
}

// Minimal CommunicationTemplate model for the script
class CommunicationTemplate extends Model {
    public id!: number;
    public code!: string;
    public type!: string;
    public subject!: string;
    public content!: string;
    public variables!: string[];
    public description!: string;
    public isActive!: boolean;
}

const PREMIUM_HTML_REVIEWER = `
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
                <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);max-width:600px;">
                    <tr>
                        <td style="background:linear-gradient(135deg,#10b981,#059669);padding:36px 40px;text-align:center;">
                            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">BR Publications</h1>
                            <p style="margin:8px 0 0;color:#d1fae5;font-size:14px;">Revision Submitted</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:40px;">
                            <h2 style="margin:0 0 16px;color:#111827;font-size:18px;font-weight:700;">Hello {{userName}},</h2>
                            <p style="margin:0 0 20px;color:#4b5563;font-size:15px;line-height:1.6;">
                                Author <strong>{{authorName}}</strong> has submitted a revised manuscript for a chapter.
                            </p>
                            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #d1fae5;border-radius:8px;margin-bottom:24px;">
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
`;

const PREMIUM_HTML_REVIEWER_V2 = PREMIUM_HTML_REVIEWER.replace(
    'Please log in to the <strong>BR Publications Reviewer Dashboard</strong>',
    `{{#authorMessage}}
                            <div style="margin:0 0 24px;padding:16px;background:#f9fafb;border-left:4px solid #10b981;border-radius:4px;">
                                <p style="margin:0 0 8px;color:#374151;font-size:14px;font-weight:600;">Author Message:</p>
                                <p style="margin:0;color:#4b5563;font-size:14px;line-height:1.6;white-space:pre-wrap;">{{authorMessage}}</p>
                            </div>
                            {{/authorMessage}}
                            <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">
                                Please log in to the <strong>BR Publications Reviewer Dashboard</strong> to review the submitted revision and coordinate next steps.
                            </p>`
);

const PREMIUM_HTML_REVIEW_SUBMITTED = `
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
`;

const PREMIUM_HTML_ALL_REVIEWS_COMPLETED = `
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
`;

async function updateTemplates() {
    // Dynamic sequelize construction to avoid import issues in standalone script
    const sequelize = new Sequelize(
        process.env.DB_NAME as string,
        process.env.DB_USER as string,
        process.env.DB_PASSWORD as string,
        {
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT) || 5432,
            dialect: 'postgres',
            logging: false,
        }
    );

    try {
        console.log('🔄 Connecting to database...');
        await sequelize.authenticate();

        // Manual model initialization for the script
        CommunicationTemplate.init({
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            code: { type: DataTypes.STRING, allowNull: false, unique: true },
            type: { type: DataTypes.ENUM('EMAIL', 'NOTIFICATION'), allowNull: false },
            subject: { type: DataTypes.STRING, allowNull: false },
            content: { type: DataTypes.TEXT, allowNull: false },
            variables: { type: DataTypes.JSON, allowNull: true },
            description: { type: DataTypes.STRING, allowNull: true },
            isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
        }, {
            sequelize,
            tableName: 'communication_templates',
            timestamps: true
        });

        const templates = [
            {
                code: 'BOOK_CHAPTER_REVISION_SUBMITTED_REVIEWER',
                subject: 'Revision Submitted: {{chapterTitle}}',
                content: PREMIUM_HTML_REVIEWER,
                variables: ['userName', 'authorName', 'bookTitle', 'chapterTitle', 'revisionNumber', 'frontendUrl'],
                description: 'Sent to Reviewer when an author submits a revision for a chapter'
            },
            {
                code: 'BOOK_CHAPTER_REVISION_SUBMITTED_REVIEWER_V2',
                subject: 'Revision Submitted: {{chapterTitle}}',
                content: PREMIUM_HTML_REVIEWER_V2,
                variables: ['userName', 'authorName', 'bookTitle', 'chapterTitle', 'revisionNumber', 'authorMessage', 'frontendUrl'],
                description: 'Sent to Reviewer when an author submits a revision for a chapter (with message)'
            },
            {
                code: 'BOOK_CHAPTER_REVIEW_SUBMITTED',
                subject: 'Review Submitted: {{chapterTitle}}',
                content: PREMIUM_HTML_REVIEW_SUBMITTED,
                variables: ['editorName', 'reviewerName', 'bookTitle', 'chapterTitle', 'recommendation', 'frontendUrl'],
                description: 'Sent to Editor when a reviewer submits their review'
            },
            {
                code: 'BOOK_CHAPTER_ALL_REVIEWS_COMPLETED',
                subject: 'All Reviews Completed: {{bookTitle}}',
                content: PREMIUM_HTML_ALL_REVIEWS_COMPLETED,
                variables: ['editorName', 'bookTitle', 'chapters', 'authorName', 'reviewSummary', 'frontendUrl'],
                description: 'Sent to Editor when all assigned reviewers have completed their reviews'
            }
        ];

        for (const t of templates) {
            const [template, created] = await CommunicationTemplate.findOrCreate({
                where: { code: t.code, type: CommunicationType.EMAIL },
                defaults: {
                    code: t.code,
                    type: CommunicationType.EMAIL,
                    subject: t.subject,
                    content: t.content,
                    variables: t.variables,
                    description: t.description,
                    isActive: true
                }
            });

            if (!created) {
                template.setDataValue('subject', t.subject);
                template.setDataValue('content', t.content);
                template.setDataValue('variables', t.variables);
                template.setDataValue('description', t.description);
                await template.save();
            } else {
                console.log(`✨ Created new template: ${t.code}`);
            }
        }
        console.log('🚀 Template sync completed successfully!');
    } catch (error) {
        console.error('❌ Error updating templates:', error);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

updateTemplates();
