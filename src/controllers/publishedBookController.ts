import { Request, Response } from 'express';
import { Op } from 'sequelize';
import PublishedBook from '../models/publishedBook';
import TextBookFile from '../models/textBookFile';
import { sendSuccess, sendError } from '../utils/responseHandler';
import sharp from 'sharp';
// import path from 'path';
// import fs from 'fs/promises';

/**
 * @route GET /api/books
 * @desc Get all published books with pagination and search
 * @access Public
 */
export const getAllBooks = async (req: Request, res: Response) => {
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
                { title: { [Op.like]: `%${search}%` } },
                { author: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } },
                { isbn: { [Op.like]: `%${search}%` } },
            ];
        }

        if (author) {
            where.author = { [Op.like]: `%${author}%` };
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

        // Default: Only show visible books unless specifically requesting hidden ones (e.g. admin might want to see all, but for now public API should probably hide hidden ones by default, or we can handle it via another param. 
        // Plan says: "Ensure public GET /api/books filters out isHidden: true by default."
        // Let's implement that logic here too.
        if (req.query.includeHidden !== 'true') {
            where.isHidden = false;
        }

        const { count, rows } = await PublishedBook.findAndCountAll({
            where,
            limit,
            offset,
            order: [['publishedDate', 'DESC'], ['createdAt', 'DESC']],
        });

        return sendSuccess(res, {
            books: rows,
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit),
            },
        }, 'Books retrieved successfully');

    } catch (error: any) {
        console.error('Error fetching books:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch books', error: error.message });
    }
};

/**
 * @route GET /api/books/:id
 * @desc Get book details by ID
 * @access Public
 */
export const getBookById = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return sendError(res, 'Invalid book ID', 400);
        }

        const book = await PublishedBook.findByPk(id);

        if (!book) {
            return sendError(res, 'Book not found', 404);
        }

        return sendSuccess(res, book, 'Book details retrieved successfully');

    } catch (error) {
        console.error('Error fetching book details:', error);
        return sendError(res, 'Failed to fetch book details', 500);
    }
};

/**
 * @route GET /api/books/categories
 * @desc Get unique categories
 * @access Public
 */
export const getCategories = async (req: Request, res: Response) => {
    try {
        const categories = await PublishedBook.findAll({
            attributes: [[PublishedBook.sequelize!.fn('DISTINCT', PublishedBook.sequelize!.col('category')), 'category']],
            raw: true
        });

        // Extract category names and add 'All'
        const categoryList = ['All', ...categories.map((c: any) => c.category).filter(Boolean).sort()];

        return sendSuccess(res, { categories: categoryList }, 'Categories retrieved successfully');
    } catch (error) {
        console.error('Error fetching categories:', error);
        return sendError(res, 'Failed to fetch categories', 500);
    }
};

/**
 * @route GET /api/books/:id/cover
 * @desc Get book cover image
 * @access Public
 */
export const getBookCover = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return sendError(res, 'Invalid book ID', 400);
        }

        const book = await PublishedBook.findByPk(id);

        if (!book || !book.coverImage) {
            return sendError(res, 'Cover image not found', 404);
        }

        // Handle base64 data URL
        if (book.coverImage.startsWith('data:image')) {
            const base64Data = book.coverImage.replace(/^data:image\/\w+;base64,/, '');
            const imageBuffer = Buffer.from(base64Data, 'base64');

            res.setHeader('Content-Type', 'image/jpeg');
            res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
            res.setHeader('Content-Length', imageBuffer.length.toString());
            return res.send(imageBuffer);
        }

        // Handle file path (if using file system storage)
        // Uncomment if you want to support file system storage
        /*
        if (book.coverImage.startsWith('/')) {
            const filepath = path.join(__dirname, '../../', book.coverImage);
            return res.sendFile(filepath);
        }
        */

        // Handle external URL (redirect to CDN/S3)
        if (book.coverImage.startsWith('http')) {
            return res.redirect(book.coverImage);
        }

        // Handle internal API path (TextBookFile)
        // Format: /api/textbooks/:submissionId/download/:fileId
        if (book.coverImage.startsWith('/api/textbooks/')) {
            try {
                const parts = book.coverImage.split('/');
                const fileId = parseInt(parts[parts.length - 1]);

                if (!isNaN(fileId)) {
                    const file = await TextBookFile.findByPk(fileId);
                    if (file && file.fileData) {
                        res.setHeader('Content-Type', file.mimeType || 'image/jpeg');
                        res.setHeader('Cache-Control', 'public, max-age=31536000');
                        res.setHeader('Content-Length', file.fileSize.toString());
                        return res.send(file.fileData);
                    }
                }
            } catch (err) {
                console.error('Error fetching file from path:', err);
                // Fall through to error
            }
        }

        return sendError(res, 'Invalid cover image format', 500);

    } catch (error) {
        console.error('Error fetching book cover:', error);
        return sendError(res, 'Failed to fetch cover image', 500);
    }
};

/**
 * @route GET /api/books/:id/cover/thumbnail
 * @desc Get book cover thumbnail (smaller version)
 * @access Public
 */
export const getBookCoverThumbnail = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const width = parseInt(req.query.width as string) || 200;
        const height = parseInt(req.query.height as string) || 300;

        if (isNaN(id)) {
            return sendError(res, 'Invalid book ID', 400);
        }

        const book = await PublishedBook.findByPk(id);

        if (!book || !book.coverImage) {
            return sendError(res, 'Cover image not found', 404);
        }

        // Only process base64 images
        if (book.coverImage.startsWith('data:image')) {
            const base64Data = book.coverImage.replace(/^data:image\/\w+;base64,/, '');
            const imageBuffer = Buffer.from(base64Data, 'base64');

            // Generate thumbnail using sharp
            const thumbnailBuffer = await sharp(imageBuffer)
                .resize(width, height, {
                    fit: 'cover',
                    position: 'center'
                })
                .jpeg({ quality: 80 })
                .toBuffer();

            res.setHeader('Content-Type', 'image/jpeg');
            res.setHeader('Cache-Control', 'public, max-age=31536000');
            res.setHeader('Content-Length', thumbnailBuffer.length.toString());
            return res.send(thumbnailBuffer);
        }

        // For URLs, redirect to original
        if (book.coverImage.startsWith('http')) {
            return res.redirect(book.coverImage);
        }

        // Handle internal API path (TextBookFile)
        if (book.coverImage.startsWith('/api/textbooks/')) {
            try {
                const parts = book.coverImage.split('/');
                const fileId = parseInt(parts[parts.length - 1]);

                if (!isNaN(fileId)) {
                    const file = await TextBookFile.findByPk(fileId);
                    if (file && file.fileData) {
                        // Generate thumbnail using sharp
                        const thumbnailBuffer = await sharp(file.fileData)
                            .resize(width, height, {
                                fit: 'cover',
                                position: 'center'
                            })
                            .jpeg({ quality: 80 })
                            .toBuffer();

                        res.setHeader('Content-Type', 'image/jpeg');
                        res.setHeader('Cache-Control', 'public, max-age=31536000');
                        res.setHeader('Content-Length', thumbnailBuffer.length.toString());
                        return res.send(thumbnailBuffer);
                    }
                }
            } catch (err) {
                console.error('Error generating thumbnail from file:', err);
                // Fall through to error
            }
        }

        return sendError(res, 'Invalid cover image format', 500);

    } catch (error) {
        console.error('Error generating thumbnail:', error);
        return sendError(res, 'Failed to generate thumbnail', 500);
    }
};

/**
 * Helper function to process and save cover image
 * Used by the publishChapter controller
 */
export const processCoverImage = async (
    coverImageData: string,
    bookId: number,
    storageType: 'base64' | 'filesystem' | 'url' = 'base64'
): Promise<string> => {
    try {
        // Extract base64 data
        const base64Data = coverImageData.replace(/^data:image\/\w+;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');

        // Return original image data without processing (to preserve transparency and format)
        // const processedBuffer = await sharp(imageBuffer)
        //     .resize(800, 1200, {
        //         fit: 'cover',
        //         position: 'center'
        //     })
        //     .jpeg({ quality: 90 })
        //     .toBuffer();

        if (storageType === 'base64') {
            return coverImageData;
        }

        // Storage Strategy 2: File System
        /*
        if (storageType === 'filesystem') {
            const uploadsDir = path.join(__dirname, '../../uploads/covers');
            
            // Create directory if it doesn't exist
            try {
                await fs.access(uploadsDir);
            } catch {
                await fs.mkdir(uploadsDir, { recursive: true });
            }

            const filename = `cover-${bookId}-${Date.now()}.jpg`;
            const filepath = path.join(uploadsDir, filename);
            
            await sharp(imageBuffer)
                .resize(800, 1200, { fit: 'cover', position: 'center' })
                .jpeg({ quality: 90 })
                .toFile(filepath);

            return `/uploads/covers/${filename}`;
        }
        */

        // Storage Strategy 3: Upload to Cloud (S3, Cloudinary, etc.)
        /*
        if (storageType === 'url') {
            // Example: Upload to S3
            const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
            
            const s3Client = new S3Client({ 
                region: process.env.AWS_REGION || 'us-east-1' 
            });

            const filename = `covers/${bookId}-${Date.now()}.jpg`;
            
            const command = new PutObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME || 'your-bucket',
                Key: filename,
                Body: processedBuffer,
                ContentType: 'image/jpeg',
                ACL: 'public-read',
            });

            await s3Client.send(command);

            return `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${filename}`;
        }
        */

        // Default to base64
        return coverImageData;

    } catch (error) {
        console.error('Error processing cover image:', error);
        throw new Error('Failed to process cover image');
    }
};

/**
 * Helper function to validate image
 */
export const validateCoverImage = (coverImageData: string): boolean => {
    try {
        // Check if it's a valid base64 image
        if (coverImageData.startsWith('data:image')) {
            const base64Data = coverImageData.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');

            // Check if buffer is valid and has reasonable size (max 10MB)
            if (buffer.length > 0 && buffer.length < 10 * 1024 * 1024) {
                return true;
            }
        }

        // Check if it's a valid URL
        if (coverImageData.startsWith('http://') || coverImageData.startsWith('https://')) {
            return true;
        }

        return false;
    } catch (error) {
        return false;
    }
};

/**
 * @route PUT /api/books/:id
 * @desc Update book details
 * @access Admin
 */
export const updateBookDetails = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return sendError(res, 'Invalid book ID', 400);

        const book = await PublishedBook.findByPk(id);
        if (!book) return sendError(res, 'Book not found', 404);

        const {
            title, author, description, category, isbn, doi, pages,
            publishedDate, pricing, coAuthors, indexedIn, releaseDate,
            copyright, googleLink, flipkartLink, amazonLink
        } = req.body;

        const updateData: any = {
            title,
            author,
            description,
            category,
            isbn,
            doi,
            pages,
            pricing,
            coAuthors,
            indexedIn,
            releaseDate,
            copyright,
            googleLink,
            flipkartLink,
            amazonLink
        };

        // If publishedDate is not explicitly provided, derive it from releaseDate (Year)
        if (!publishedDate && releaseDate) {
            const year = new Date(releaseDate).getFullYear();
            if (!isNaN(year)) {
                updateData.publishedDate = year.toString();
            }
        } else if (publishedDate) {
            updateData.publishedDate = publishedDate;
        }

        await book.update(updateData);

        return sendSuccess(res, book, 'Book details updated successfully');
    } catch (error) {
        console.error('Error updating book details:', error);
        return sendError(res, 'Failed to update book details', 500);
    }
};

/**
 * @route PUT /api/books/:id/cover
 * @desc Update book cover
 * @access Admin
 */
export const updateBookCover = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return sendError(res, 'Invalid book ID', 400);

        if (!req.file) return sendError(res, 'No image file provided', 400);

        const book = await PublishedBook.findByPk(id);
        if (!book) return sendError(res, 'Book not found', 404);

        // Use original image (preserve transparency and format)
        const coverImageBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

        await book.update({ coverImage: coverImageBase64 });

        return sendSuccess(res, { coverImage: coverImageBase64 }, 'Cover image updated successfully');
    } catch (error) {
        console.error('Error updating book cover:', error);
        return sendError(res, 'Failed to update book cover', 500);
    }
};

/**
 * @route PUT /api/books/:id/visibility
 * @desc Toggle book visibility (Hide/Show)
 * @access Admin
 */
export const updateVisibility = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return sendError(res, 'Invalid book ID', 400);

        const { isHidden } = req.body;
        if (typeof isHidden !== 'boolean') return sendError(res, 'Invalid visibility status', 400);

        const book = await PublishedBook.findByPk(id);
        if (!book) return sendError(res, 'Book not found', 404);

        await book.update({ isHidden });

        return sendSuccess(res, { isHidden }, `Book is now ${isHidden ? 'hidden' : 'visible'}`);
    } catch (error) {
        console.error('Error updating visibility:', error);
        return sendError(res, 'Failed to update visibility', 500);
    }
};

/**
 * @route PUT /api/books/:id/featured
 * @desc Toggle book featured status
 * @access Admin
 */
export const updateFeatured = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return sendError(res, 'Invalid book ID', 400);

        const { isFeatured } = req.body;
        if (typeof isFeatured !== 'boolean') return sendError(res, 'Invalid featured status', 400);

        const book = await PublishedBook.findByPk(id);
        if (!book) return sendError(res, 'Book not found', 404);

        await book.update({ isFeatured });

        return sendSuccess(res, { isFeatured }, `Book is now ${isFeatured ? 'featured' : 'not featured'}`);
    } catch (error) {
        console.error('Error updating featured status:', error);
        return sendError(res, 'Failed to update featured status', 500);
    }
};

/**
 * @route DELETE /api/books/:id
 * @desc Delete published book
 * @access Admin
 */
export const deleteBook = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return sendError(res, 'Invalid book ID', 400);

        const book = await PublishedBook.findByPk(id);
        if (!book) return sendError(res, 'Book not found', 404);

        await book.destroy();

        return sendSuccess(res, null, 'Book deleted successfully');
    } catch (error) {
        console.error('Error deleting book:', error);
        return sendError(res, 'Failed to delete book', 500);
    }
};

export default {
    getAllBooks,
    getBookById,
    getCategories,
    getBookCover,
    getBookCoverThumbnail,
    processCoverImage,
    validateCoverImage,
    updateBookDetails,
    updateBookCover,
    updateVisibility,
    updateFeatured,
    deleteBook
};
