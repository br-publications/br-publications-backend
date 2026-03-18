import { Request, Response } from 'express';
import BookEditor from '../models/bookEditor';
import BookTitle from '../models/bookTitle';
import User, { UserRole } from '../models/user';

/**
 * @swagger
 * tags:
 *   name: Book Editors
 *   description: Book editor assignment management endpoints
 */

/**
 * @swagger
 * /api/book-editors:
 *   post:
 *     summary: Assign an editor to a book title
 *     tags: [Book Editors]
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
 *               - editorId
 *             properties:
 *               bookTitleId:
 *                 type: integer
 *               editorId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Editor assigned successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Book title or editor not found
 */
export const assignEditor = async (req: Request, res: Response) => {
    try {
        const { bookTitleId, editorId } = req.body;
        const user = (req as any).authenticatedUser;

        // Validate required fields
        if (!bookTitleId || !editorId) {
            return res.status(400).json({
                success: false,
                message: 'Book title ID and editor ID are required',
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

        // Check if editor exists and has editor role
        const editor = await User.findByPk(editorId);
        if (!editor) {
            return res.status(404).json({
                success: false,
                message: 'Editor not found',
            });
        }

        if (editor.role !== UserRole.EDITOR) {
            return res.status(400).json({
                success: false,
                message: 'User must have editor role',
            });
        }

        // Check if editor is already assigned
        const existingAssignment = await BookEditor.findOne({
            where: { bookTitleId, editorId },
        });

        if (existingAssignment) {
            return res.status(400).json({
                success: false,
                message: 'Editor is already assigned to this book',
            });
        }

        // Create assignment
        const assignment = await BookEditor.create({
            bookTitleId,
            editorId,
            assignedBy: user.id,
        });

        // Fetch full assignment details
        const assignmentDetails = await BookEditor.findByPk(assignment.id, {
            include: [
                {
                    model: BookTitle,
                    as: 'bookTitle',
                    attributes: ['id', 'title'],
                },
                {
                    model: User,
                    as: 'editor',
                    attributes: ['id', 'userId', 'fullName', 'email'],
                },
                {
                    model: User,
                    as: 'assigner',
                    attributes: ['id', 'fullName'],
                },
            ],
        });

        return res.status(201).json({
            success: true,
            message: 'Editor assigned successfully',
            data: assignmentDetails,
        });
    } catch (error: any) {
        console.error('Error assigning editor:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to assign editor',
            error: error.message,
        });
    }
};

/**
 * @swagger
 * /api/book-editors/bulk:
 *   post:
 *     summary: Assign multiple editors to a book title
 *     tags: [Book Editors]
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
 *               - editorIds
 *             properties:
 *               bookTitleId:
 *                 type: integer
 *               editorIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       201:
 *         description: Editors assigned successfully
 *       400:
 *         description: Validation error
 */
export const bulkAssignEditors = async (req: Request, res: Response) => {
    try {
        const { bookTitleId, editorIds } = req.body;
        const user = (req as any).authenticatedUser;

        // Validate required fields
        if (!bookTitleId || !Array.isArray(editorIds) || editorIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Book title ID and editor IDs array are required',
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

        const results = {
            successful: [] as any[],
            failed: [] as any[],
        };

        // Process each editor assignment
        for (const editorId of editorIds) {
            try {
                // Check if editor exists and has editor role
                const editor = await User.findByPk(editorId);
                if (!editor || editor.role !== UserRole.EDITOR) {
                    results.failed.push({
                        editorId,
                        reason: 'Editor not found or does not have editor role',
                    });
                    continue;
                }

                // Check if already assigned
                const existingAssignment = await BookEditor.findOne({
                    where: { bookTitleId, editorId },
                });

                if (existingAssignment) {
                    results.failed.push({
                        editorId,
                        reason: 'Editor already assigned to this book',
                    });
                    continue;
                }

                // Create assignment
                const assignment = await BookEditor.create({
                    bookTitleId,
                    editorId,
                    assignedBy: user.id,
                });

                results.successful.push({
                    editorId,
                    assignmentId: assignment.id,
                });
            } catch (error: any) {
                results.failed.push({
                    editorId,
                    reason: error.message,
                });
            }
        }

        return res.status(201).json({
            success: true,
            message: `Assigned ${results.successful.length} editors successfully`,
            data: results,
        });
    } catch (error: any) {
        console.error('Error bulk assigning editors:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to assign editors',
            error: error.message,
        });
    }
};

/**
 * @swagger
 * /api/book-editors/book/{bookTitleId}:
 *   get:
 *     summary: Get all editors assigned to a book title
 *     tags: [Book Editors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookTitleId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of assigned editors
 *       404:
 *         description: Book title not found
 */
export const getEditorsByBookTitle = async (req: Request, res: Response) => {
    try {
        const { bookTitleId } = req.params;

        // Check if book title exists
        const bookTitle = await BookTitle.findByPk(bookTitleId);
        if (!bookTitle) {
            return res.status(404).json({
                success: false,
                message: 'Book title not found',
            });
        }

        const assignments = await BookEditor.findAll({
            where: { bookTitleId },
            include: [
                {
                    model: User,
                    as: 'editor',
                    attributes: ['id', 'userId', 'fullName', 'email'],
                },
                {
                    model: User,
                    as: 'assigner',
                    attributes: ['id', 'fullName'],
                },
            ],
            order: [['assignedAt', 'DESC']],
        });

        return res.status(200).json({
            success: true,
            message: 'Editors retrieved successfully',
            data: {
                bookTitle: {
                    id: bookTitle.id,
                    title: bookTitle.title,
                },
                editors: assignments,
            },
        });
    } catch (error: any) {
        console.error('Error fetching editors:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch editors',
            error: error.message,
        });
    }
};

/**
 * @swagger
 * /api/book-editors/editor/{editorId}:
 *   get:
 *     summary: Get all book titles assigned to an editor
 *     tags: [Book Editors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: editorId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of assigned book titles
 *       404:
 *         description: Editor not found
 */
export const getBooksByEditor = async (req: Request, res: Response) => {
    try {
        const { editorId } = req.params;

        // Check if editor exists
        const editor = await User.findByPk(editorId);
        if (!editor) {
            return res.status(404).json({
                success: false,
                message: 'Editor not found',
            });
        }

        const assignments = await BookEditor.findAll({
            where: { editorId },
            include: [
                {
                    model: BookTitle,
                    as: 'bookTitle',
                    attributes: ['id', 'title', 'description', 'isActive'],
                },
                {
                    model: User,
                    as: 'assigner',
                    attributes: ['id', 'fullName'],
                },
            ],
            order: [['assignedAt', 'DESC']],
        });

        return res.status(200).json({
            success: true,
            message: 'Book titles retrieved successfully',
            data: {
                editor: {
                    id: editor.id,
                    userId: editor.userId,
                    fullName: editor.fullName,
                    email: editor.email,
                },
                bookTitles: assignments,
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
 * /api/book-editors/{id}:
 *   delete:
 *     summary: Remove editor assignment
 *     tags: [Book Editors]
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
 *         description: Assignment removed successfully
 *       404:
 *         description: Assignment not found
 */
export const removeEditorAssignment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const assignment = await BookEditor.findByPk(id);

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found',
            });
        }

        await assignment.destroy();

        return res.status(200).json({
            success: true,
            message: 'Editor assignment removed successfully',
        });
    } catch (error: any) {
        console.error('Error removing assignment:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to remove assignment',
            error: error.message,
        });
    }
};
