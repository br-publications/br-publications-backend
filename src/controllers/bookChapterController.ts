import { Request, Response } from 'express';
import BookChapter from '../models/bookChapter';
import BookTitle from '../models/bookTitle';
import { Op } from 'sequelize';

/**
 * @swagger
 * tags:
 *   name: Book Chapters
 *   description: Book chapter management endpoints
 */

/**
 * @swagger
 * /api/book-chapter-list:
 *   post:
 *     summary: Create a new book chapter
 *     tags: [Book Chapters]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookTitleId
 *               - chapterTitle
 *             properties:
 *               bookTitleId:
 *                 type: integer
 *               chapterTitle:
 *                 type: string
 *               chapterNumber:
 *                 type: integer
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Chapter created successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Book title not found
 */
export const createBookChapter = async (req: Request, res: Response) => {
    try {
        const { bookTitleId, chapterTitle, chapterNumber, description } = req.body;



        // Validate required fields
        if (!bookTitleId || !chapterTitle || typeof chapterTitle !== 'string' || chapterTitle.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Book title ID and chapter title are required',
            });
        }

        const bTitleId = Number(bookTitleId);
        if (isNaN(bTitleId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid book title ID',
            });
        }

        // Check if book title exists
        const bookTitle = await BookTitle.findByPk(bTitleId);
        if (!bookTitle) {
            return res.status(404).json({
                success: false,
                message: 'Book title not found',
            });
        }

        const chTitle = chapterTitle.trim();

        // Check if chapter title already exists for this book
        const existingChapter = await BookChapter.findOne({
            where: {
                bookTitleId: bTitleId,
                chapterTitle: chTitle,
            },
        });

        if (existingChapter) {
            return res.status(400).json({
                success: false,
                message: 'Chapter title already exists for this book',
            });
        }

        // Create chapter
        // Explicitly handle chapterNumber to avoid undefined/null issues
        const chNum = chapterNumber ? Number(chapterNumber) : null;



        const chapter = await BookChapter.create({
            bookTitleId: bTitleId,
            chapterTitle: chTitle,
            chapterNumber: chNum, // The hook will handle assignment if this is null/0 but here it respects strict input
            description: description ? String(description).trim() : null,
            isActive: true,
        });



        return res.status(201).json({
            success: true,
            message: 'Chapter created successfully',
            data: chapter,
        });
    } catch (error: any) {
        console.error('Error creating chapter:', error);

        // Handle Sequelize Validation Errors
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const messages = error.errors.map((e: any) => e.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: messages,
                error: messages.join('. '),
            });
        }

        // Safely access error message
        const errorMessage = error.message || 'Unknown error';
        const errorStack = error.stack || '';

        return res.status(500).json({
            success: false,
            message: 'Failed to create chapter',
            error: process.env.NODE_ENV === 'development' ? `${errorMessage}\n${errorStack}` : errorMessage,
        });
    }
};

/**
 * @swagger
 * /api/book-chapter-list/book/{bookTitleId}:
 *   get:
 *     summary: Get chapters by book title ID
 *     tags: [Book Chapters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookTitleId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: activeOnly
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of chapters
 *       404:
 *         description: Book title not found
 */
export const getChaptersByBookTitle = async (req: Request, res: Response) => {
    try {
        const { bookTitleId } = req.params;
        const { activeOnly, includePublished } = req.query;

        // Check if book title exists
        const bookTitle = await BookTitle.findByPk(bookTitleId);
        if (!bookTitle) {
            return res.status(404).json({
                success: false,
                message: 'Book title not found',
            });
        }

        const whereClause: any = { bookTitleId };

        if (activeOnly === 'true') {
            whereClause.isActive = true;
        }

        // When includePublished=false (author view), exclude already-published chapters
        if (includePublished === 'false') {
            whereClause.isPublished = false;
        }

        const chapters = await BookChapter.findAll({
            where: whereClause,
            order: [
                ['chapterNumber', 'ASC NULLS LAST'],
                ['createdAt', 'ASC'],
            ],
        });

        return res.status(200).json({
            success: true,
            message: 'Chapters retrieved successfully',
            data: {
                bookTitle: {
                    id: bookTitle.id,
                    title: bookTitle.title,
                },
                chapters,
            },
        });
    } catch (error: any) {
        console.error('Error fetching chapters:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch chapters',
            error: error.message,
        });
    }
};

/**
 * @swagger
 * /api/book-chapter-list:
 *   get:
 *     summary: Get all chapters
 *     tags: [Book Chapters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of all chapters
 */
export const getAllChapters = async (req: Request, res: Response) => {
    try {
        const { search, page = 1, limit = 50 } = req.query;

        const whereClause: any = { isActive: true };

        if (search) {
            whereClause.chapterTitle = {
                [Op.iLike]: `%${search}%`,
            };
        }

        const offset = (Number(page) - 1) * Number(limit);

        const { count, rows: chapters } = await BookChapter.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: BookTitle,
                    as: 'bookTitle',
                    attributes: ['id', 'title'],
                },
            ],
            order: [['chapterNumber', 'ASC NULLS LAST'], ['createdAt', 'ASC']],
            limit: Number(limit),
            offset,
        });

        return res.status(200).json({
            success: true,
            message: 'Chapters retrieved successfully',
            data: {
                chapters,
                pagination: {
                    total: count,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(count / Number(limit)),
                },
            },
        });
    } catch (error: any) {
        console.error('Error fetching chapters:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch chapters',
            error: error.message,
        });
    }
};

/**
 * @swagger
 * /api/book-chapter-list/{id}:
 *   get:
 *     summary: Get chapter by ID
 *     tags: [Book Chapters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Chapter details
 *       404:
 *         description: Chapter not found
 */
export const getChapterById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const chapter = await BookChapter.findByPk(id, {
            include: [
                {
                    model: BookTitle,
                    as: 'bookTitle',
                    attributes: ['id', 'title', 'description'],
                },
            ],
        });

        if (!chapter) {
            return res.status(404).json({
                success: false,
                message: 'Chapter not found',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Chapter retrieved successfully',
            data: chapter,
        });
    } catch (error: any) {
        console.error('Error fetching chapter:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch chapter',
            error: error.message,
        });
    }
};

/**
 * @swagger
 * /api/book-chapter-list/{id}:
 *   put:
 *     summary: Update chapter
 *     tags: [Book Chapters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chapterTitle:
 *                 type: string
 *               chapterNumber:
 *                 type: integer
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Chapter updated successfully
 *       404:
 *         description: Chapter not found
 */
export const updateBookChapter = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { chapterTitle, chapterNumber, description, isActive } = req.body;

        const chapter = await BookChapter.findByPk(id);

        if (!chapter) {
            return res.status(404).json({
                success: false,
                message: 'Chapter not found',
            });
        }

        // Check if new chapter title already exists for this book
        if (chapterTitle && chapterTitle !== chapter.chapterTitle) {
            const existingChapter = await BookChapter.findOne({
                where: {
                    bookTitleId: chapter.bookTitleId,
                    chapterTitle: chapterTitle.trim(),
                    id: { [Op.ne]: id },
                },
            });

            if (existingChapter) {
                return res.status(400).json({
                    success: false,
                    message: 'Chapter title already exists for this book',
                });
            }
        }

        // Update fields
        if (chapterTitle !== undefined) chapter.chapterTitle = chapterTitle.trim();
        if (chapterNumber !== undefined) chapter.chapterNumber = chapterNumber;
        if (description !== undefined) chapter.description = description?.trim() || null;
        if (isActive !== undefined) chapter.isActive = isActive;

        await chapter.save();

        return res.status(200).json({
            success: true,
            message: 'Chapter updated successfully',
            data: chapter,
        });
    } catch (error: any) {
        console.error('Error updating chapter:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update chapter',
            error: error.message,
        });
    }
};

/**
 * @swagger
 * /api/book-chapter-list/{id}:
 *   delete:
 *     summary: Delete chapter (soft delete)
 *     tags: [Book Chapters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Chapter deleted successfully
 *       400:
 *         description: Cannot delete - has active submissions
 *       404:
 *         description: Chapter not found
 */
export const deleteBookChapter = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const chapter = await BookChapter.findByPk(id);

        if (!chapter) {
            return res.status(404).json({
                success: false,
                message: 'Chapter not found',
            });
        }

        // Check if chapter can be deleted
        const canDelete = await chapter.canBeDeleted();

        if (!canDelete) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete chapter with active submissions',
            });
        }

        // Soft delete
        chapter.isActive = false;
        await chapter.save();

        return res.status(200).json({
            success: true,
            message: 'Chapter deleted successfully',
        });
    } catch (error: any) {
        console.error('Error deleting chapter:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete chapter',
            error: error.message,
        });
    }
};

/**
 * @swagger
 * /api/book-chapter-list/book/{bookTitleId}/reorder:
 *   put:
 *     summary: Reorder chapters for a book
 *     tags: [Book Chapters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookTitleId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - chapters
 *             properties:
 *               chapters:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     chapterNumber:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Chapters reordered successfully
 *       404:
 *         description: Book title not found
 */
export const reorderChapters = async (req: Request, res: Response) => {
    try {
        const { bookTitleId } = req.params;
        const { chapters } = req.body;

        // Validate input
        if (!Array.isArray(chapters) || chapters.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Chapters array is required',
            });
        }

        // Check if book title exists
        const bookTitle = await BookTitle.findByPk(bookTitleId);
        if (!bookTitle) {
            return res.status(404).json({
                success: false,
                message: 'Book title not found',
            });
        }

        // Update chapter numbers
        const updatePromises = chapters.map(async (chapterData: any) => {
            const chapter = await BookChapter.findOne({
                where: {
                    id: chapterData.id,
                    bookTitleId,
                },
            });

            if (chapter) {
                chapter.chapterNumber = chapterData.chapterNumber;
                await chapter.save();
            }
        });

        await Promise.all(updatePromises);

        // Fetch updated chapters
        const updatedChapters = await BookChapter.findAll({
            where: { bookTitleId, isActive: true },
            order: [['chapterNumber', 'ASC']],
        });

        return res.status(200).json({
            success: true,
            message: 'Chapters reordered successfully',
            data: updatedChapters,
        });
    } catch (error: any) {
        console.error('Error reordering chapters:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to reorder chapters',
            error: error.message,
        });
    }
};
