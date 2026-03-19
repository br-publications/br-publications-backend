import { Request, Response } from 'express';
import { Op } from 'sequelize';
import path from 'path';
import fs from 'fs';
import { AuthRequest } from '../../middleware/auth';
import { sendSuccess, sendError } from '../../utils/responseHandler';
import PublishedBookChapter from '../../models/publishedBookChapter';
import BookChapterSubmission, { BookChapterStatus } from '../../models/bookChapterSubmission';
import BookChapterStatusHistory from '../../models/bookChapterStatusHistory';
import BookChapter from '../../models/bookChapter';
import User, { UserRole } from '../../models/user';
import { sendDummyEmail, sendBookChapterPublishedEmail } from '../../utils/emailService';
import notificationService from '../../services/notificationService';
import { NotificationType, NotificationCategory } from '../../models/notification';
import { resolveDisplayBookTitle } from '../bookChapterSubmission/commonController';
import sharp from 'sharp';
import TemporaryUpload from '../../models/temporaryUpload';

const TEMP_UPLOAD_DIR = path.resolve('uploads/temp');

// ============================================================
// Helper
// ============================================================

const parseJsonField = (field: any) => {
    if (field == null) return null;
    if (typeof field === 'string') {
        try { return JSON.parse(field); } catch { return null; }
    }
    return field;
};

/**
 * Helper: Process tableContents to convert temp PDFs into permanent base64 data
 */
const processTempPdfsForTableContents = async (toc: any) => {
    if (!Array.isArray(toc)) return toc;
    
    for (const item of toc) {
        if (item && typeof item === 'object' && item.pdfKey) {
            try {
                const tempUpload = await TemporaryUpload.findByPk(item.pdfKey);
                if (tempUpload) {
                    item.pdfData = `data:${tempUpload.mimeType};base64,${tempUpload.fileData.toString('base64')}`;
                    delete item.pdfKey;
                    // Delete temp upload after processing
                    await tempUpload.destroy();
                }
            } catch (e) {
                console.error('Error processing temp PDF for TOC:', e);
            }
        }
    }
    return toc;
};

/**
 * Helper: Process frontmatterPdfs to convert temp PDFs into permanent base64 data
 */
const processTempPdfsForFrontmatter = async (frontmatter: any) => {
    if (!frontmatter || typeof frontmatter !== 'object') return frontmatter;
    
    for (const key of Object.keys(frontmatter)) {
        const item = frontmatter[key];
        if (item && typeof item === 'object' && item.pdfKey) {
            try {
                const tempUpload = await TemporaryUpload.findByPk(item.pdfKey);
                if (tempUpload) {
                    item.data = `data:${tempUpload.mimeType};base64,${tempUpload.fileData.toString('base64')}`;
                    delete item.pdfKey;
                    // Delete temp upload after processing
                    await tempUpload.destroy();
                }
            } catch (e) {
                console.error('Error processing temp PDF for Frontmatter:', e);
            }
        }
    }
    return frontmatter;
};

/**
 * Helper: Sends publication notifications (Email + In-App) to both the submitter
 * and the corresponding author. Deduplicates by user ID (for in-app) and email (for email).
 */
const sendPublicationNotifications = async (
    submission?: BookChapterSubmission | null,
    data?: {
        mainAuthor: any;
        bookTitle: string;
        isbn: string;
        doi?: string;
        editors?: string | string[];
        keywords?: string | string[];
    }
) => {
    try {
        const bookTitle = data?.bookTitle || (submission ? await resolveDisplayBookTitle(submission.bookTitle) : 'N/A');
        const isbn = data?.isbn || submission?.isbn || 'N/A';
        const doi = data?.doi || submission?.doi || 'N/A';
        const editors = data?.editors || submission?.editors || [];
        const keywords = data?.keywords || submission?.keywords || [];
        const publicationDate = new Date().toLocaleDateString();
        const link = `${process.env.FRONTEND_URL}/bookchapters`; // Update if needed based on FE routes

        const notificationRecipients = new Set<number>(); // User IDs for in-app
        const emailRecipients = new Map<string, string>(); // Email -> Name for emails

        // 1. Submitter (only if submission exists)
        if (submission && submission.submittedBy) {
            notificationRecipients.add(submission.submittedBy);
            // We need to get submitter's email.
            const submitter = await User.findByPk(submission.submittedBy);
            if (submitter) {
                emailRecipients.set(submitter.email.toLowerCase(), submitter.fullName);
            }
        }

        // 2. Corresponding Author
        let corrAuthor: any = null;
        if (submission) {
            corrAuthor = submission.getCorrespondingAuthor();
        } else if (data?.mainAuthor) {
            corrAuthor = data.mainAuthor;
        }

        if (corrAuthor && corrAuthor.email) {
            const email = corrAuthor.email.toLowerCase();
            const name = `${corrAuthor.firstName || ''} ${corrAuthor.lastName || ''}`.trim() || 'Author';

            if (!emailRecipients.has(email)) {
                emailRecipients.set(email, name);
            }

            // Check if this author has a registered account for in-app notification
            const registeredUser = await User.findOne({ where: { email: corrAuthor.email } });
            if (registeredUser) {
                notificationRecipients.add(registeredUser.id);
            }
        }

        // --- Execute In-App Notifications ---
        for (const recipientId of notificationRecipients) {
            notificationService.createNotification({
                recipientId,
                type: NotificationType.SUCCESS,
                category: NotificationCategory.SUBMISSION,
                title: 'Book Chapter Published! 🎉',
                message: `Your book chapter "${bookTitle}" has been officially published.`,
                relatedEntityId: submission?.id || undefined,
                relatedEntityType: submission ? 'BookChapterSubmission' : undefined,
            }).catch(err => console.error(`❌ In-app notification failed for userID ${recipientId}:`, err));
        }

        // --- Execute Email Notifications ---
        for (const [email, name] of emailRecipients.entries()) {
            sendBookChapterPublishedEmail(email, {
                authorName: name,
                bookTitle,
                isbn,
                doi,
                editors,
                keywords,
                publicationDate,
                link,
            }).catch(err => console.error(`❌ Email notification failed for ${email}:`, err));
        }

    } catch (err) {
        console.error('❌ Error in sendPublicationNotifications:', err);
    }
};

// ============================================================
// ADMIN: Upload a single PDF to temporary storage
// ============================================================

/**
 * @route POST /api/book-chapter-publishing/:id/upload-temp-pdf
 * @desc  Upload a single PDF file to temp storage. Returns a fileKey that
 *        can be referenced in the publish payload instead of base64 data.
 * @access Admin / Editor
 */
export const uploadTempPdf = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.authenticatedUser;
        if (!user || (!user.hasRole(UserRole.ADMIN) && !user.hasRole(UserRole.DEVELOPER) && !user.hasRole(UserRole.EDITOR))) {
            return sendError(res, 'Admin or Editor access required', 403);
        }

        const file = (req as any).file;
        if (!file) {
            return sendError(res, 'No PDF file uploaded', 400);
        }

        // 1. Save to Database
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        const tempUpload = await TemporaryUpload.create({
            fileData: file.buffer,
            mimeType: file.mimetype,
            fileName: file.originalname,
            expiresAt
        });

        // 2. Mirror to Disk (temporary transition support)
        try {
            if (!fs.existsSync(TEMP_UPLOAD_DIR)) {
                fs.mkdirSync(TEMP_UPLOAD_DIR, { recursive: true });
            }
            // Use the database record ID as the filename for consistency if possible
            const diskPath = path.join(TEMP_UPLOAD_DIR, tempUpload.id);
            fs.writeFileSync(diskPath, file.buffer);
        } catch (diskErr) {
            console.error('⚠️ Disk mirroring failed (DB save succeeded):', diskErr);
            // We don't fail the request if disk write fails, as DB is primary now
        }

        return sendSuccess(res, {
            fileKey: tempUpload.id,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
        }, 'File uploaded successfully (Saved to DB and Disk)');
    } catch (err: any) {
        console.error('❌ uploadTempPdf error:', err);
        return sendError(res, 'Failed to upload PDF', 500);
    }
};

// ============================================================
// ADMIN: Publish a book chapter submission
// ============================================================

/**
 * @route POST /api/book-chapter-publishing/:id/publish
 * @desc  Admin publishes an APPROVED book chapter submission.
 *        Creates (or updates) a record in published_book_chapters.
 * @access Admin / Editor
 *
 * Body (all optional except isbn):
 *  {
 *    title, author, coAuthors, category, description,
 *    isbn, publishedDate, pages, indexedIn, releaseDate,
 *    copyright, doi, coverImage (base64 data URL),
 *    synopsis    (JSON object  { paragrapgh_1: "…" }),
 *    scope       (JSON object  { intro: "…", item_1: "…" }),
 *    tableContents (JSON array [{ title, chapterNumber, pages, pdfData, pdfMimeType, pdfName }]),
 *    authorBiographies (JSON array [{ authorName, biography }]),
 *    archives    (JSON object  { paragrapgh_1: "…" }),
 *    pricing     (JSON object  { softCopyPrice: 0, hardCopyPrice: 0, combinedPrice: 0 }),
 *    frontmatterPdfs (JSON object { dedication: { data: "base64...", name: "a.pdf", mimeType: "application/pdf" }, ...})
 *  }
 */
export const publishBookChapter = async (req: AuthRequest, res: Response) => {
    const sequelize = BookChapterSubmission.sequelize;
    if (!sequelize) {
        return sendError(res, 'Database connection not initialized', 500);
    }

    const transaction = await sequelize.transaction();

    try {
        const user = req.authenticatedUser;
        const submissionId = parseInt(req.params.id);

        // Auth
        if (!user || (!user.hasRole(UserRole.ADMIN) && !user.hasRole(UserRole.DEVELOPER) && !user.hasRole(UserRole.EDITOR))) {
            await transaction.rollback();
            return sendError(res, 'Admin or Editor access required', 403);
        }

        if (isNaN(submissionId)) {
            await transaction.rollback();
            return sendError(res, 'Invalid submission ID', 400);
        }

        // Fetch submission with deliveryAddress
        const { default: DeliveryAddress } = await import('../../models/deliveryAddress');
        const submission = await BookChapterSubmission.findByPk(submissionId, {
            include: [{ model: DeliveryAddress, as: 'deliveryAddress' }],
            transaction
        });
        if (!submission) {
            await transaction.rollback();
            return sendError(res, 'Submission not found', 404);
        }

        if (
            submission.status !== BookChapterStatus.APPROVED &&
            submission.status !== BookChapterStatus.PUBLICATION_IN_PROGRESS &&
            submission.status !== BookChapterStatus.PUBLISHED
        ) {
            await transaction.rollback();
            return sendError(res, 'Submission must be APPROVED, in PUBLICATION_IN_PROGRESS, or already PUBLISHED before publishing', 400);
        }

        // Guard: Delivery address must be submitted before publishing
        if (
            submission.status === BookChapterStatus.PUBLICATION_IN_PROGRESS &&
            !(submission as any).deliveryAddress
        ) {
            await transaction.rollback();
            return sendError(res, 'Cannot publish: The author has not yet submitted their delivery address. Please wait for the author to provide delivery details.', 400);
        }

        // Extract body fields
        const {
            title,
            author,
            coAuthors,
            coverImage,
            category,
            description,
            isbn,
            publishedDate,
            pages,
            indexedIn,
            releaseDate,
            copyright,
            doi,
            synopsis,
            scope,
            tableContents,
            authorBiographies,
            archives,
            pricing,
            googleLink,
            flipkartLink,
            amazonLink,
            frontmatterPdfs, mainAuthor, coAuthorsData, keywords,
        } = req.body;

        // Validate required fields — fall back to the ISBN already recorded on the submission
        const resolvedIsbn = isbn || submission.isbn;
        if (!resolvedIsbn) {
            await transaction.rollback();
            return sendError(res, 'ISBN is required to publish a book chapter. Please ensure an ISBN has been assigned.', 400);
        }

        // Build the record data
        const bookData = {
            bookChapterSubmissionId: submissionId,
            title: (title || submission.bookTitle || '').trim(),
            author: (author || `${submission.mainAuthor?.firstName ?? ''} ${submission.mainAuthor?.lastName ?? ''}`.trim()),
            mainAuthor: mainAuthor || submission.mainAuthor || null,
            coAuthors: coAuthors || null,
            coAuthorsData: coAuthorsData || null,
            coverImage: coverImage || null,
            category: category || 'Engineering & Management',
            description: description || submission.abstract || '',
            isbn: resolvedIsbn.trim(),
            publishedDate: publishedDate || new Date().getFullYear().toString(),
            pages: pages ? parseInt(pages) : 0,
            indexedIn: indexedIn || null,
            releaseDate: releaseDate || null,
            copyright: copyright || null,
            doi: doi || null,
            synopsis: parseJsonField(synopsis),
            scope: parseJsonField(scope),
            tableContents: await processTempPdfsForTableContents(parseJsonField(tableContents)),
            authorBiographies: parseJsonField(authorBiographies),
            archives: parseJsonField(archives),
            pricing: parseJsonField(pricing),
            googleLink: googleLink || null,
            flipkartLink: flipkartLink || null,
            amazonLink: amazonLink || null,
            keywords: keywords || submission.keywords || [],
            frontmatterPdfs: await processTempPdfsForFrontmatter(parseJsonField(frontmatterPdfs)),
            isHidden: false,
            isFeatured: false,
        };

        // Create or update the published_book_chapters record
        let publishedChapter = await PublishedBookChapter.findOne({
            where: { bookChapterSubmissionId: submissionId },
            transaction,
        });

        if (publishedChapter) {
            await publishedChapter.update(bookData, { transaction });
        } else {
            publishedChapter = await PublishedBookChapter.create(bookData, { transaction });
        }

        // Update submission status → PUBLISHED
        const previousStatus = submission.status;
        submission.status = BookChapterStatus.PUBLISHED;
        submission.isbn = resolvedIsbn.trim(); // Ensure ISBN is synced to submission record
        submission.lastUpdatedBy = user.id;
        await submission.save({ transaction });

        // Record history
        await BookChapterStatusHistory.create(
            {
                submissionId: submission.id,
                previousStatus,
                newStatus: BookChapterStatus.PUBLISHED,
                changedBy: user.id,
                action: 'Book Chapter Published',
                notes: `Chapter published. ISBN: ${resolvedIsbn}. DOI: ${doi || 'N/A'}`,
                metadata: { isbn: resolvedIsbn, doi, publishedDate, pages: bookData.pages },
            },
            { transaction }
        );

        await transaction.commit();

        // --- Mark matching book_chapters rows as published (non-blocking) ---
        const tocList = parseJsonField(tableContents) || [];
        const tocTitles: string[] = tocList.map((c: any) => c.title).filter(Boolean);
        if (tocTitles.length > 0) {
            BookChapter.update(
                { isPublished: true },
                { where: { chapterTitle: { [Op.in]: tocTitles } } }
            ).catch((err: any) => console.error('❌ Error marking chapters as published:', err));
        }

        // --- Non-blocking notifications ---
        sendPublicationNotifications(submission, {
            mainAuthor,
            bookTitle: bookData.title,
            isbn: bookData.isbn,
            doi: bookData.doi || 'N/A',
            keywords: bookData.keywords
        }).catch(err => console.error('❌ Error sending publication notifications:', err));

        return sendSuccess(res, { submission, publishedChapter }, 'Book chapter published successfully');

    } catch (error) {
        await transaction.rollback();
        console.error('❌ publishBookChapter error:', error);
        return sendError(res, 'Failed to publish book chapter', 500);
    }
};

// ============================================================
// ADMIN: Publish a direct book chapter (Manual Entry)
// ============================================================

/**
 * @route POST /api/book-chapter-publishing/direct
 * @desc  Admin publishes a book chapter directly (no existing submission).
 *        Creates a record in published_book_chapters.
 * @access Admin / Editor
 */
export const publishDirectBookChapter = async (req: AuthRequest, res: Response) => {
    const sequelize = PublishedBookChapter.sequelize;
    if (!sequelize) {
        return sendError(res, 'Database connection not initialized', 500);
    }

    const transaction = await sequelize.transaction();

    try {
        const user = req.authenticatedUser;

        // Auth
        if (!user || (!user.hasRole(UserRole.ADMIN) && !user.hasRole(UserRole.DEVELOPER) && !user.hasRole(UserRole.EDITOR))) {
            await transaction.rollback();
            return sendError(res, 'Admin or Editor access required', 403);
        }

        // Extract body fields
        const {
            title,
            author,
            coAuthors,
            coverImage,
            category,
            description,
            isbn,
            publishedDate,
            pages,
            indexedIn,
            releaseDate,
            copyright,
            doi,
            synopsis,
            scope,
            tableContents,
            authorBiographies,
            archives,
            pricing,
            googleLink,
            flipkartLink,
            amazonLink,
            frontmatterPdfs, mainAuthor, coAuthorsData, keywords, editors
        } = req.body;

        if (!title || !author || !isbn) {
            await transaction.rollback();
            return sendError(res, 'Title, main author, and ISBN are required to publish directly.', 400);
        }

        // Build the record data
        const bookData = {
            bookChapterSubmissionId: null, // No submission exists!
            title: title.trim(),
            author: author.trim(),
            mainAuthor: mainAuthor || null,
            coAuthors: coAuthors || null,
            coAuthorsData: coAuthorsData || null,
            coverImage: coverImage || null,
            category: category || 'Engineering & Management',
            description: description || '',
            editors: Array.isArray(editors) ? editors : (editors ? [editors] : []),
            isbn: isbn.trim(),
            publishedDate: publishedDate || new Date().getFullYear().toString(),
            pages: pages ? parseInt(pages) : 0,
            indexedIn: indexedIn || null,
            releaseDate: releaseDate || null,
            copyright: copyright || null,
            doi: doi || null,
            synopsis: parseJsonField(synopsis),
            scope: parseJsonField(scope),
            tableContents: await processTempPdfsForTableContents(parseJsonField(tableContents)),
            authorBiographies: parseJsonField(authorBiographies),
            archives: parseJsonField(archives),
            pricing: parseJsonField(pricing),
            googleLink: googleLink || null,
            flipkartLink: flipkartLink || null,
            amazonLink: amazonLink || null,
            keywords: keywords || [],
            frontmatterPdfs: await processTempPdfsForFrontmatter(parseJsonField(frontmatterPdfs)),
            isHidden: false,
            isFeatured: false,
        };

        const publishedChapter = await PublishedBookChapter.create(bookData, { transaction });

        await transaction.commit();

        // --- Note: Removed auto-marking as published as this is an individual chapter publish ---

        // --- Send Publication Notifications (non-blocking) ---
        sendPublicationNotifications(null, {
            mainAuthor: bookData.mainAuthor,
            bookTitle: bookData.title,
            isbn: bookData.isbn,
            doi: bookData.doi || 'N/A',
            editors: bookData.editors || [],
            keywords: bookData.keywords
        }).catch(err => console.error('❌ Error sending publication notifications for direct publish:', err));



        return sendSuccess(res, { publishedChapter }, 'Direct book chapter published successfully');

    } catch (error) {
        await transaction.rollback();
        console.error('❌ publishDirectBookChapter error:', error);
        return sendError(res, 'Failed to publish direct book chapter', 500);
    }
};

// ============================================================
// PUBLIC: Get all published book chapters
// ============================================================

/**
 * @route GET /api/book-chapter-publishing
 * @desc  Get all visible published book chapters (paginated, searchable)
 * @access Public
 */
export const getAllPublishedChapters = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const search = req.query.search as string;
        const author = req.query.author as string;
        const publishedAfter = req.query.publishedAfter as string;
        const publishedBefore = req.query.publishedBefore as string;
        const category = req.query.category as string;
        const offset = (page - 1) * limit;

        const where: any = {};

        if (search) {
            where[Op.or] = [
                { title: { [Op.iLike]: `%${search}%` } },
                { author: { [Op.iLike]: `%${search}%` } },
                { isbn: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } },
            ];
        }

        if (author) {
            where.author = { [Op.iLike]: `%${author}%` };
        }

        if (publishedAfter || publishedBefore) {
            where.publishedDate = {};
            if (publishedAfter) where.publishedDate[Op.gte] = publishedAfter;
            if (publishedBefore) where.publishedDate[Op.lte] = publishedBefore;
        }

        if (category && category !== 'All') {
            where.category = category;
        }

        if (req.query.featured === 'true') {
            where.isFeatured = true;
        }

        // Public route: hide hidden entries by default
        if (req.query.includeHidden !== 'true') {
            where.isHidden = false;
        }

        const { count, rows } = await PublishedBookChapter.findAndCountAll({
            where,
            limit,
            offset,
            // Exclude raw PDF/image data from list response (large fields)
            attributes: {
                include: [
                    [PublishedBookChapter.sequelize!.literal('case when cover_image is not null then true else false end'), 'hasCoverImage']
                ],
                exclude: ['coverImage', 'tableContents', 'synopsis', 'scope', 'authorBiographies', 'archives', 'frontmatterPdfs', 'mainAuthor', 'coAuthorsData']
            },
            order: [['publishedDate', 'DESC'], ['createdAt', 'DESC']],
        });

        return sendSuccess(res, {
            items: rows,
            pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
        }, 'Published book chapters retrieved successfully');

    } catch (error) {
        console.error('❌ getAllPublishedChapters error:', error);
        return sendError(res, 'Failed to fetch published book chapters', 500);
    }
};

// ============================================================
// PUBLIC: Get a single published book chapter (full detail)
// ============================================================

/**
 * @route GET /api/book-chapter-publishing/:id
 * @desc  Get full detail of a published book chapter (includes synopsis, TOC, etc.)
 * @access Public
 */
export const getPublishedChapterById = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return sendError(res, 'Invalid ID', 400);

        const chapter = await PublishedBookChapter.findByPk(id, {
            // Exclude raw binary data from detail too — serve via dedicated endpoints
            attributes: {
                include: [
                    [PublishedBookChapter.sequelize!.literal('case when cover_image is not null then true else false end'), 'hasCoverImage']
                ],
                exclude: ['coverImage']
            },
        });

        if (!chapter) return sendError(res, 'Published book chapter not found', 404);

        return sendSuccess(res, chapter, 'Published book chapter retrieved successfully');

    } catch (error) {
        console.error('❌ getPublishedChapterById error:', error);
        return sendError(res, 'Failed to fetch published book chapter', 500);
    }
};

// ============================================================
// PUBLIC: Serve cover image
// ============================================================

/**
 * @route GET /api/book-chapter-publishing/:id/cover
 * @desc  Stream the cover image stored as base64 in the DB
 * @access Public
 */
export const getChapterCover = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return sendError(res, 'Invalid ID', 400);

        const chapter = await PublishedBookChapter.findByPk(id, {
            attributes: ['id', 'coverImage'],
        });

        if (!chapter || !chapter.coverImage) {
            return sendError(res, 'Cover image not found', 404);
        }

        const mimeMatch = chapter.coverImage.match(/^data:(image\/\w+);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

        const base64Data = chapter.coverImage.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        res.setHeader('Content-Type', mimeType);
        res.setHeader('Cache-Control', 'no-cache, must-revalidate');
        res.setHeader('Content-Length', buffer.length.toString());
        return res.send(buffer);

    } catch (error) {
        console.error('❌ getChapterCover error:', error);
        return sendError(res, 'Failed to fetch cover image', 500);
    }
};

/**
 * @route GET /api/book-chapter-publishing/:id/cover/thumbnail
 * @desc  Stream a resized thumbnail of the cover image
 * @access Public
 */
export const getChapterCoverThumbnail = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const width = parseInt(req.query.width as string) || 200;
        const height = parseInt(req.query.height as string) || 280;

        if (isNaN(id)) return sendError(res, 'Invalid ID', 400);

        const chapter = await PublishedBookChapter.findByPk(id, {
            attributes: ['id', 'coverImage'],
        });

        if (!chapter || !chapter.coverImage) {
            return sendError(res, 'Cover image not found', 404);
        }

        const base64Data = chapter.coverImage.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        const thumbnail = await sharp(buffer)
            .resize(width, height, { fit: 'cover', position: 'center' })
            .jpeg({ quality: 80 })
            .toBuffer();

        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Cache-Control', 'no-cache, must-revalidate');
        res.setHeader('Content-Length', thumbnail.length.toString());
        return res.send(thumbnail);

    } catch (error) {
        console.error('❌ getChapterCoverThumbnail error:', error);
        return sendError(res, 'Failed to generate thumbnail', 500);
    }
};

// ============================================================
// PUBLIC: Serve a chapter PDF from the TOC
// ============================================================

/**
 * @route GET /api/book-chapter-publishing/:id/toc/:chapterIndex/pdf
 * @desc  Stream the PDF stored (as base64) for a specific TOC chapter
 * @access Public
 */
export const getChapterPdf = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const chapterIndex = parseInt(req.params.chapterIndex);

        if (isNaN(id) || isNaN(chapterIndex)) return sendError(res, 'Invalid parameters', 400);

        const book = await PublishedBookChapter.findByPk(id, {
            attributes: ['id', 'tableContents'],
        });

        if (!book || !book.tableContents) {
            return sendError(res, 'Table of contents not found', 404);
        }

        const toc = book.tableContents as any[];
        const tocEntry = toc[chapterIndex];

        if (!tocEntry) return sendError(res, 'Chapter not found in TOC', 404);

        let buffer: Buffer;
        let filename = tocEntry.pdfName || `chapter-${chapterIndex + 1}.pdf`;

        if (tocEntry.pdfKey) {
            const tempUpload = await TemporaryUpload.findByPk(tocEntry.pdfKey);
            if (tempUpload) {
                buffer = tempUpload.fileData;
            } else {
                // Fallback to disk storage (for legacy records)
                const filePath = path.join(TEMP_UPLOAD_DIR, tocEntry.pdfKey);
                if (fs.existsSync(filePath)) {
                    buffer = fs.readFileSync(filePath);
                } else {
                    return sendError(res, 'Chapter PDF file not found (it may have expired or was already processed)', 404);
                }
            }
        } else if (tocEntry.pdfData) {
            const base64Data = (tocEntry.pdfData as string).replace(/^data:application\/pdf;base64,/, '');
            buffer = Buffer.from(base64Data, 'base64');
        } else {
            return sendError(res, 'PDF data or key not found for this chapter', 404);
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
        res.setHeader('Content-Length', buffer.length.toString());
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.send(buffer);

    } catch (error) {
        console.error('❌ getChapterPdf error:', error);
        return sendError(res, 'Failed to fetch chapter PDF', 500);
    }
};

// ============================================================
// ADMIN: Update published book chapter details
// ============================================================

/**
 * @route PUT /api/book-chapter-publishing/:id
 * @desc  Update an existing published book chapter record
 * @access Admin
 */
export const updatePublishedChapter = async (req: AuthRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return sendError(res, 'Invalid ID', 400);

        const chapter = await PublishedBookChapter.findByPk(id);
        if (!chapter) return sendError(res, 'Published book chapter not found', 404);

        const {
            title, author, coAuthors, category, description,
            isbn, doi, pages, publishedDate, releaseDate,
            copyright, indexedIn, pricing, synopsis, scope,
            tableContents, authorBiographies, archives, frontmatterPdfs,
            mainAuthor, coAuthorsData, coverImage,
            googleLink, flipkartLink, amazonLink, keywords
        } = req.body;

        await chapter.update({
            ...(title && { title }),
            ...(author && { author }),
            ...(coAuthors !== undefined && { coAuthors }),
            ...(category && { category }),
            ...(description && { description }),
            ...(isbn && { isbn }),
            ...(doi !== undefined && { doi }),
            ...(pages && { pages: parseInt(pages) }),
            ...(publishedDate && { publishedDate }),
            ...(releaseDate !== undefined && { releaseDate }),
            ...(copyright !== undefined && { copyright }),
            ...(indexedIn !== undefined && { indexedIn }),
            ...(pricing && { pricing: parseJsonField(pricing) }),
            ...(synopsis && { synopsis: parseJsonField(synopsis) }),
            ...(scope && { scope: parseJsonField(scope) }),
            ...(tableContents && { tableContents: await processTempPdfsForTableContents(parseJsonField(tableContents)) }),
            ...(authorBiographies && { authorBiographies: parseJsonField(authorBiographies) }),
            ...(archives && { archives: parseJsonField(archives) }),
            ...(frontmatterPdfs && { frontmatterPdfs: await processTempPdfsForFrontmatter(parseJsonField(frontmatterPdfs)) }),
            ...(mainAuthor && { mainAuthor: parseJsonField(mainAuthor) }),
            ...(coAuthorsData && { coAuthorsData: parseJsonField(coAuthorsData) }),
            ...(coverImage !== undefined && { coverImage }),
            ...(googleLink !== undefined && { googleLink }),
            ...(flipkartLink !== undefined && { flipkartLink }),
            ...(amazonLink !== undefined && { amazonLink }),
            ...(keywords !== undefined && { keywords }),
        });

        return sendSuccess(res, chapter, 'Published book chapter updated successfully');

    } catch (error) {
        console.error('❌ updatePublishedChapter error:', error);
        return sendError(res, 'Failed to update published book chapter', 500);
    }
};

// ============================================================
// PUBLIC: Serve an extra PDF (Dedication, Index, etc.)
// ============================================================

/**
 * @route GET /api/book-chapter-publishing/:id/extra-pdf/:type
 * @desc  Stream a specific extra PDF (e.g., dedication, index, preface)
 * @access Public
 */
export const getExtraPdf = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const { type } = req.params;

        if (isNaN(id) || !type) return sendError(res, 'Invalid parameters', 400);

        const book = await PublishedBookChapter.findByPk(id, {
            attributes: ['id', 'frontmatterPdfs'],
        });

        if (!book || !book.frontmatterPdfs) {
            return sendError(res, 'No frontmatter PDFs available', 404);
        }

        const pdfs = book.frontmatterPdfs as Record<string, any>;

        // Alias map: normalise requests so older and newer key names both work
        const KEY_ALIASES: Record<string, string[]> = {
            'Detailed Table of Contents': ['Table of Contents', 'detailed table of contents', 'table of contents', 'toc'],
            'About the Contributors': ['Contributors', 'about the contributors'],
            'Frontmatter': ['frontmatter', 'front matter'],
            'Preface': ['preface'],
            'Acknowledgment': ['Acknowledgement', 'acknowledgment', 'acknowledgement'],
            'Dedication': ['dedication'],
            'Index': ['index'],
        };

        // 1. Exact match
        let pdfEntry = pdfs[type];

        // 2. Try each alias group: check if 'type' is an alias and look up the canonical key
        if (!pdfEntry) {
            for (const [canonical, aliases] of Object.entries(KEY_ALIASES)) {
                const allNames = [canonical.toLowerCase(), ...aliases.map(a => a.toLowerCase())];
                if (allNames.includes(type.toLowerCase())) {
                    // Try canonical first
                    pdfEntry = pdfs[canonical];
                    // Then try every alias in whatever casing it was stored
                    if (!pdfEntry) {
                        for (const alias of [canonical, ...aliases]) {
                            pdfEntry = pdfs[alias];
                            if (pdfEntry) break;
                        }
                    }
                    break;
                }
            }
        }

        // 3. Last resort: case-insensitive key scan
        if (!pdfEntry) {
            const lowerType = type.toLowerCase();
            for (const [key, val] of Object.entries(pdfs)) {
                if (key.toLowerCase() === lowerType) {
                    pdfEntry = val;
                    break;
                }
            }
        }

        if (!pdfEntry) return sendError(res, `PDF entry for "${type}" not found`, 404);

        let buffer: Buffer;
        let filename = pdfEntry.name || `${type}.pdf`;

        if (pdfEntry.pdfKey) {
            const tempUpload = await TemporaryUpload.findByPk(pdfEntry.pdfKey);
            if (tempUpload) {
                buffer = tempUpload.fileData;
            } else {
                // Fallback to disk storage (for legacy records)
                const filePath = path.join(TEMP_UPLOAD_DIR, pdfEntry.pdfKey);
                if (fs.existsSync(filePath)) {
                    buffer = fs.readFileSync(filePath);
                } else {
                    return sendError(res, `Frontmatter PDF file for "${type}" not found on disk or database`, 404);
                }
            }
        } else if (pdfEntry.data) {
            const base64Data = (pdfEntry.data as string).replace(/^data:application\/pdf;base64,/, '');
            buffer = Buffer.from(base64Data, 'base64');
        } else {
            return sendError(res, `PDF data or key not found for type: ${type}`, 404);
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
        res.setHeader('Content-Length', buffer.length.toString());
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.send(buffer);

    } catch (error) {
        console.error('❌ getExtraPdf error:', error);
        return sendError(res, 'Failed to fetch PDF', 500);
    }
};

// ============================================================
// ADMIN: Update cover image
// ============================================================

/**
 * @route PUT /api/book-chapter-publishing/:id/cover
 * @desc  Replace the cover image (accepts multipart/jpeg or base64 JSON)
 * @access Admin
 */
export const updateChapterCover = async (req: AuthRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return sendError(res, 'Invalid ID', 400);

        const chapter = await PublishedBookChapter.findByPk(id);
        if (!chapter) return sendError(res, 'Published book chapter not found', 404);

        let coverImage: string | null = null;

        if (req.file) {
            // Uploaded via multipart
            coverImage = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        } else if (req.body.coverImage) {
            // Sent as base64 JSON field
            coverImage = req.body.coverImage;
        } else {
            return sendError(res, 'No cover image provided', 400);
        }

        await chapter.update({ coverImage });

        return sendSuccess(res, { message: 'Cover updated' }, 'Cover image updated successfully');

    } catch (error) {
        console.error('❌ updateChapterCover error:', error);
        return sendError(res, 'Failed to update cover image', 500);
    }
};

// ============================================================
// ADMIN: Toggle visibility / featured
// ============================================================

/**
 * @route PUT /api/book-chapter-publishing/:id/visibility
 * @access Admin
 */
export const updateVisibility = async (req: AuthRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return sendError(res, 'Invalid ID', 400);

        const { isHidden } = req.body;
        if (typeof isHidden !== 'boolean') return sendError(res, 'isHidden must be boolean', 400);

        const chapter = await PublishedBookChapter.findByPk(id);
        if (!chapter) return sendError(res, 'Not found', 404);

        await chapter.update({ isHidden });
        return sendSuccess(res, { isHidden }, `Book chapter is now ${isHidden ? 'hidden' : 'visible'}`);

    } catch (error) {
        console.error('❌ updateVisibility error:', error);
        return sendError(res, 'Failed to update visibility', 500);
    }
};

/**
 * @route PUT /api/book-chapter-publishing/:id/featured
 * @access Admin
 */
export const updateFeatured = async (req: AuthRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return sendError(res, 'Invalid ID', 400);

        const { isFeatured } = req.body;
        if (typeof isFeatured !== 'boolean') return sendError(res, 'isFeatured must be boolean', 400);

        const chapter = await PublishedBookChapter.findByPk(id);
        if (!chapter) return sendError(res, 'Not found', 404);

        await chapter.update({ isFeatured });
        return sendSuccess(res, { isFeatured }, `Book chapter is now ${isFeatured ? 'featured' : 'not featured'}`);

    } catch (error) {
        console.error('❌ updateFeatured error:', error);
        return sendError(res, 'Failed to update featured status', 500);
    }
};

// ============================================================
// ADMIN: Delete
// ============================================================

/**
 * @route DELETE /api/book-chapter-publishing/:id
 * @access Admin
 */
export const deletePublishedChapter = async (req: AuthRequest, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return sendError(res, 'Invalid ID', 400);

        const chapter = await PublishedBookChapter.findByPk(id);
        if (!chapter) return sendError(res, 'Not found', 404);

        await chapter.destroy();
        return sendSuccess(res, null, 'Published book chapter deleted successfully');

    } catch (error) {
        console.error('❌ deletePublishedChapter error:', error);
        return sendError(res, 'Failed to delete published book chapter', 500);
    }
};

// ============================================================
// PUBLIC: Get unique categories
// ============================================================

/**
 * @route GET /api/book-chapter-publishing/categories
 * @access Public
 */
export const getCategories = async (req: Request, res: Response) => {
    try {
        const categories = await PublishedBookChapter.findAll({
            attributes: [[PublishedBookChapter.sequelize!.fn('DISTINCT', PublishedBookChapter.sequelize!.col('category')), 'category']],
            where: { isHidden: false },
            raw: true,
        });

        const categoryList = ['All', ...categories.map((c: any) => c.category).filter(Boolean).sort()];
        return sendSuccess(res, { categories: categoryList }, 'Categories retrieved successfully');

    } catch (error) {
        console.error('❌ getCategories error:', error);
        return sendError(res, 'Failed to fetch categories', 500);
    }
};

// ============================================================
// ADMIN: Check ISBN availability against PublishedBookChapter
// ============================================================

/**
 * @route POST /api/book-chapter-publishing/check-isbn
 * @desc  Check if the given ISBNs already exist in the published_book_chapters table.
 *        Returns the subset of ISBNs that are already taken.
 * @access Admin
 */
export const checkBookChapterIsbnAvailability = async (req: AuthRequest, res: Response) => {
    try {
        const { isbns } = req.body;

        if (!isbns || !Array.isArray(isbns)) {
            return sendError(res, 'Invalid input: isbns must be an array of strings', 400);
        }

        if (isbns.length === 0) {
            return sendSuccess(res, { existingIsbns: [] });
        }

        const normalizedIsbns = isbns.map((isbn: string) => isbn.trim()).filter(Boolean);

        // 1. Check PublishedBookChapter table
        const publishedBooks = await PublishedBookChapter.findAll({
            where: {
                isbn: { [Op.in]: normalizedIsbns },
            },
            attributes: ['isbn'],
        });

        // 2. Check BookChapterSubmission table (exclude rejected/withdrawn)
        // Book_chapter_submissions stores ISBN in `isbn` column.
        const activeSubmissions = await BookChapterSubmission.findAll({
            where: {
                isbn: { [Op.in]: normalizedIsbns },
                status: {
                    [Op.notIn]: [
                        BookChapterStatus.REJECTED
                    ]
                }
            },
            attributes: ['isbn'],
        });

        const existingSet = new Set<string>();
        publishedBooks.forEach(b => { if (b.isbn) existingSet.add(b.isbn); });
        activeSubmissions.forEach(s => { if (s.isbn) existingSet.add(s.isbn); });

        const existingIsbns = Array.from(existingSet);
        return sendSuccess(res, { existingIsbns }, 'ISBN availability checked');

    } catch (error) {
        console.error('❌ checkBookChapterIsbnAvailability error:', error);
        return sendError(res, 'Failed to check ISBN availability', 500);
    }
};
