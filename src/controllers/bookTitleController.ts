import { Request, Response } from 'express';
import BookTitle from '../models/bookTitle';
import BookChapter from '../models/bookChapter';
import BookEditor from '../models/bookEditor';
import User from '../models/user';
import { Op } from 'sequelize';

/**
 * @swagger
 * tags:
 *   name: Book Titles
 *   description: Book title management endpoints
 */

/**
 * @swagger
 * /api/book-titles:
 *   post:
 *     summary: Create a new book title
 *     tags: [Book Titles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Book title created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
export const createBookTitle = async (req: Request, res: Response) => {
    try {
        const { title, description } = req.body;
        const user = (req as any).authenticatedUser;

        // Validate required fields
        if (!title || title.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Book title is required',
            });
        }

        // Check if title already exists
        const existingTitle = await BookTitle.findOne({
            where: { title: title.trim() },
        });

        if (existingTitle) {
            return res.status(400).json({
                success: false,
                message: 'Book title already exists',
            });
        }

        // Create book title
        const bookTitle = await BookTitle.create({
            title: title.trim(),
            description: description?.trim() || null,
            createdBy: user.id,
            isActive: true,
        });

        return res.status(201).json({
            success: true,
            message: 'Book title created successfully',
            data: bookTitle,
        });
    } catch (error: any) {
        console.error('Error creating book title:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create book title',
            error: error.message,
        });
    }
};

/**
 * @swagger
 * /api/book-titles:
 *   get:
 *     summary: Get all book titles
 *     tags: [Book Titles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: activeOnly
 *         schema:
 *           type: boolean
 *         description: Filter for active titles only
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of book titles
 *       401:
 *         description: Unauthorized
 */
export const getAllBookTitles = async (req: Request, res: Response) => {
    try {
        const { activeOnly, search, page = 1, limit = 50 } = req.query;

        const whereClause: any = {};

        // Filter by active status
        if (activeOnly === 'true') {
            whereClause.isActive = true;
        }

        // Search filter
        if (search) {
            whereClause.title = {
                [Op.iLike]: `%${search}%`,
            };
        }

        // Pagination
        const offset = (Number(page) - 1) * Number(limit);

        const { count, rows: bookTitles } = await BookTitle.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'fullName', 'email'],
                },
            ],
            order: [['title', 'ASC']],
            limit: Number(limit),
            offset,
        });

        // Get chapter and editor counts for each book
        const bookTitlesWithCounts = await Promise.all(
            bookTitles.map(async (book) => {
                const chapterCount = await book.getChapterCount();
                const editorCount = await book.getEditorCount();

                return {
                    ...book.toJSON(),
                    chapterCount,
                    editorCount,
                };
            })
        );

        return res.status(200).json({
            success: true,
            message: 'Book titles retrieved successfully',
            data: {
                bookTitles: bookTitlesWithCounts,
                pagination: {
                    total: count,
                    page: Number(page),
                    limit: Number(limit),
                    totalPages: Math.ceil(count / Number(limit)),
                },
            },
        });
    } catch (error: any) {
        console.error('Error fetching book titles:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch book titles',
            error: error.message,
        });
    }
};

/**
 * @swagger
 * /api/book-titles/{id}:
 *   get:
 *     summary: Get book title by ID
 *     tags: [Book Titles]
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
 *         description: Book title details
 *       404:
 *         description: Book title not found
 */
export const getBookTitleById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const bookTitle = await BookTitle.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'fullName', 'email'],
                },
                {
                    model: BookChapter,
                    as: 'chapters',
                    where: { isActive: true },
                    required: false,
                    order: [['chapterNumber', 'ASC']],
                },
                {
                    model: BookEditor,
                    as: 'editorAssignments',
                    include: [
                        {
                            model: User,
                            as: 'editor',
                            attributes: ['id', 'userId', 'fullName', 'email'],
                        },
                    ],
                },
            ],
        });

        if (!bookTitle) {
            return res.status(404).json({
                success: false,
                message: 'Book title not found',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Book title retrieved successfully',
            data: bookTitle,
        });
    } catch (error: any) {
        console.error('Error fetching book title:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch book title',
            error: error.message,
        });
    }
};

/**
 * @swagger
 * /api/book-titles/{id}:
 *   put:
 *     summary: Update book title
 *     tags: [Book Titles]
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Book title updated successfully
 *       404:
 *         description: Book title not found
 */
export const updateBookTitle = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, description, isActive } = req.body;

        const bookTitle = await BookTitle.findByPk(id);

        if (!bookTitle) {
            return res.status(404).json({
                success: false,
                message: 'Book title not found',
            });
        }

        // Check if new title already exists (if title is being changed)
        if (title && title !== bookTitle.title) {
            const existingTitle = await BookTitle.findOne({
                where: {
                    title: title.trim(),
                    id: { [Op.ne]: id },
                },
            });

            if (existingTitle) {
                return res.status(400).json({
                    success: false,
                    message: 'Book title already exists',
                });
            }
        }

        // Update fields
        if (title !== undefined) bookTitle.title = title.trim();
        if (description !== undefined) bookTitle.description = description?.trim() || null;
        if (isActive !== undefined) bookTitle.isActive = isActive;

        await bookTitle.save();

        return res.status(200).json({
            success: true,
            message: 'Book title updated successfully',
            data: bookTitle,
        });
    } catch (error: any) {
        console.error('Error updating book title:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update book title',
            error: error.message,
        });
    }
};

/**
 * @swagger
 * /api/book-titles/{id}:
 *   delete:
 *     summary: Delete book title (soft delete)
 *     tags: [Book Titles]
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
 *         description: Book title deleted successfully
 *       400:
 *         description: Cannot delete - has active submissions
 *       404:
 *         description: Book title not found
 */
export const deleteBookTitle = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const bookTitle = await BookTitle.findByPk(id);

        if (!bookTitle) {
            return res.status(404).json({
                success: false,
                message: 'Book title not found',
            });
        }

        // Check if book can be deleted
        const canDelete = await bookTitle.canBeDeleted();

        if (!canDelete) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete book title with active submissions',
            });
        }

        // Create transaction for atomic delete
        // Use the model's sequelize instance to avoid import issues
        const t = await BookTitle.sequelize?.transaction();

        if (!t) {
            throw new Error('Database transaction failed to initialize');
        }

        try {
            // 1. Delete all editor assignments
            await BookEditor.destroy({
                where: { bookTitleId: id },
                transaction: t
            });

            // 2. Delete all chapters
            await BookChapter.destroy({
                where: { bookTitleId: id },
                transaction: t
            });

            // 3. Delete the book title
            await bookTitle.destroy({ transaction: t });

            await t.commit();

            return res.status(200).json({
                success: true,
                message: 'Book title and associated data deleted successfully',
            });
        } catch (error) {
            await t.rollback();
            throw error;
        }
    } catch (error: any) {
        console.error('Error deleting book title:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete book title',
            error: error.message,
        });
    }
};

/**
 * @swagger
 * /api/book-titles/{id}/with-chapters:
 *   get:
 *     summary: Get book title with all chapters (for dropdowns)
 *     tags: [Book Titles]
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
 *         description: Book title with chapters
 *       404:
 *         description: Book title not found
 */
export const getBookTitleWithChapters = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const bookTitle = await BookTitle.findByPk(id);

        if (!bookTitle) {
            return res.status(404).json({
                success: false,
                message: 'Book title not found',
            });
        }

        const chapters = await bookTitle.getActiveChapters();

        return res.status(200).json({
            success: true,
            message: 'Book title with chapters retrieved successfully',
            data: {
                id: bookTitle.id,
                title: bookTitle.title,
                chapters: chapters.map((ch: any) => ({
                    id: ch.id,
                    chapterTitle: ch.chapterTitle,
                    chapterNumber: ch.chapterNumber,
                })),
            },
        });
    } catch (error: any) {
        console.error('Error fetching book title with chapters:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch book title with chapters',
            error: error.message,
        });
    }
};
