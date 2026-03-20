import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';

/**
 * Categories for different email purposes
 */
export enum EmailCategory {
    BOOK_CHAPTER = 'BOOK_CHAPTER',
    TEXTBOOK = 'TEXTBOOK',
    RECRUITMENT = 'RECRUITMENT',
    PROJECT = 'PROJECT',
    GENERAL = 'GENERAL'
}

/**
 * Cache for transporters to avoid re-creating them for every email
 */
const transporters = new Map<string, nodemailer.Transporter>();

/**
 * Get a transporter for a specific category, or the default one
 */
const getTransporter = (category: EmailCategory): { transporter: nodemailer.Transporter, from: string } => {
    // Default connection & credentials
    const defaultHost = process.env.EMAIL_HOST || '';
    const defaultPort = Number(process.env.EMAIL_PORT) || 587;
    const defaultUser = process.env.EMAIL_USER || '';
    const defaultPass = process.env.EMAIL_PASSWORD || '';

    // Category-specific properties (fallback to default)
    let host = defaultHost;
    let port = defaultPort;
    let user = defaultUser;
    let pass = defaultPass;
    let from = defaultUser;

    switch (category) {
        case EmailCategory.BOOK_CHAPTER:
            host = process.env.EMAIL_HOST_BOOK_CHAPTER || defaultHost;
            port = process.env.EMAIL_PORT_BOOK_CHAPTER ? Number(process.env.EMAIL_PORT_BOOK_CHAPTER) : defaultPort;
            from = process.env.EMAIL_FROM_BOOK_CHAPTER || defaultUser;
            user = process.env.EMAIL_USER_BOOK_CHAPTER || defaultUser;
            pass = process.env.EMAIL_PASS_BOOK_CHAPTER || defaultPass;
            break;
        case EmailCategory.TEXTBOOK:
            host = process.env.EMAIL_HOST_TEXTBOOK || defaultHost;
            port = process.env.EMAIL_PORT_TEXTBOOK ? Number(process.env.EMAIL_PORT_TEXTBOOK) : defaultPort;
            from = process.env.EMAIL_FROM_TEXTBOOK || defaultUser;
            user = process.env.EMAIL_USER_TEXTBOOK || defaultUser;
            pass = process.env.EMAIL_PASS_TEXTBOOK || defaultPass;
            break;
        case EmailCategory.RECRUITMENT:
            host = process.env.EMAIL_HOST_RECRUITMENT || defaultHost;
            port = process.env.EMAIL_PORT_RECRUITMENT ? Number(process.env.EMAIL_PORT_RECRUITMENT) : defaultPort;
            from = process.env.EMAIL_FROM_RECRUITMENT || defaultUser;
            user = process.env.EMAIL_USER_RECRUITMENT || defaultUser;
            pass = process.env.EMAIL_PASS_RECRUITMENT || defaultPass;
            break;
        case EmailCategory.PROJECT:
            host = process.env.EMAIL_HOST_PROJECT || defaultHost;
            port = process.env.EMAIL_PORT_PROJECT ? Number(process.env.EMAIL_PORT_PROJECT) : defaultPort;
            from = process.env.EMAIL_FROM_PROJECT || defaultUser;
            user = process.env.EMAIL_USER_PROJECT || defaultUser;
            pass = process.env.EMAIL_PASS_PROJECT || defaultPass;
            break;
        default:
            host = defaultHost;
            port = defaultPort;
            from = defaultUser;
            user = defaultUser;
            pass = defaultPass;
    }

    const cacheKey = `${host}:${port}:${user}`;

    if (!transporters.has(cacheKey)) {
        const connectionTimeout = Number(process.env.EMAIL_CONNECTION_TIMEOUT_MS) || 10000;

        const newTransporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465, // true for SMTPS on 465, false for STARTTLS on 587
            auth: { user, pass },
            connectionTimeout,
            greetingTimeout: connectionTimeout,
            socketTimeout: connectionTimeout,
            tls: {
                rejectUnauthorized: false,
            },
        });
        transporters.set(cacheKey, newTransporter);
    }

    return {
        transporter: transporters.get(cacheKey)!,
        from: `"BR Publications" <${from}>`,
    };
};

// For backward compatibility while refactoring
const defaultPort = Number(process.env.EMAIL_PORT) || 587;
export const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: defaultPort,
    secure: defaultPort === 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
    connectionTimeout: Number(process.env.EMAIL_CONNECTION_TIMEOUT_MS) || 10000,
    greetingTimeout: Number(process.env.EMAIL_CONNECTION_TIMEOUT_MS) || 10000,
    socketTimeout: Number(process.env.EMAIL_CONNECTION_TIMEOUT_MS) || 10000,
    tls: {
        rejectUnauthorized: false,
    },
});

const rawFrontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
export const FRONTEND_URL = rawFrontendUrl.endsWith('/') ? rawFrontendUrl : `${rawFrontendUrl}/`;

const emailProvider = (process.env.EMAIL_PROVIDER || 'smtp').toLowerCase();

const sendEmailViaSendGrid = async (
    to: string,
    subject: string,
    html: string,
    text?: string
): Promise<void> => {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
        throw new Error('SENDGRID_API_KEY is required when EMAIL_PROVIDER=sendgrid');
    }

    sgMail.setApiKey(apiKey);

    const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;
    if (!from) {
        throw new Error('EMAIL_FROM or EMAIL_USER is required for SendGrid');
    }

    const message = {
        to,
        from,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''),
    };

    const [response] = await sgMail.send(message);
    console.log(`✅ SendGrid email sent successfully to ${to}. StatusCode: ${response.statusCode}`);
};

/**
 * Base email sending function — updated to support categories.
 */
export const sendEmail = async (
    to: string,
    subject: string,
    html: string,
    text?: string,
    category: EmailCategory = EmailCategory.GENERAL,
    waitForResponse: boolean = false
): Promise<void> => {
    try {
        if (emailProvider === 'sendgrid') {
            await sendEmailViaSendGrid(to, subject, html, text);
            return;
        }

        const { transporter: activeTransporter, from } = getTransporter(category);

        const sendPromise = activeTransporter.sendMail({
            from,
            to,
            subject,
            html,
            text: text || html.replace(/<[^>]*>/g, ''),
        }).then(info => {
            console.log(`✅ Email sent successfully to ${to}. MessageId: ${info.messageId}`);
        }).catch(error => {
            console.error(`❌ Error sending email to ${to}:`, error);
            if (waitForResponse) throw error;
        });

        if (waitForResponse) {
            await sendPromise;
        }
    } catch (error) {
        console.error(`❌ Error initiating email to ${to}:`, error);
        if (waitForResponse) {
            throw error;
        }
    }
};
