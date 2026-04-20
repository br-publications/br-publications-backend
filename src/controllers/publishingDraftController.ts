import { Response } from 'express';
import { Op } from 'sequelize';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/responseHandler';
import PublishingDraft from '../models/publishingDraft';

/**
 * @route GET /api/drafts
 * @desc Get all active drafts for the logged-in user
 */
export const listDrafts = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.authenticatedUser;
        if (!user) return sendError(res, 'Unauthorized', 401);

        // Standard 5-day expiration filter
        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

        const drafts = await PublishingDraft.findAll({
            where: {
                userId: user.id,
                updatedAt: { [Op.gte]: fiveDaysAgo }
            },
            order: [['updatedAt', 'DESC']]
        });

        return sendSuccess(res, drafts, 'Drafts retrieved successfully');
    } catch (error: any) {
        console.error('Error listing drafts:', error);
        return sendError(res, 'Failed to list drafts', 500);
    }
};

/**
 * @route GET /api/drafts/submission/:submissionId
 * @route GET /api/drafts/:id
 * @desc Get a specific draft by ID or Submission ID
 */
export const getDraft = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.authenticatedUser;
        if (!user) return sendError(res, 'Unauthorized', 401);

        const { id, submissionId } = req.params;
        const where: any = { userId: user.id };

        if (id) {
            where.id = id;
        } else if (submissionId) {
            where.submissionId = submissionId;
        } else {
            return sendError(res, 'Missing identifier', 400);
        }

        const draft = await PublishingDraft.findOne({ where });

        if (!draft) {
            return sendError(res, 'Draft not found', 404);
        }

        // Check expiration (5 days)
        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

        if (draft.updatedAt < fiveDaysAgo) {
            await draft.destroy(); // Passive cleanup
            return sendError(res, 'Draft has expired', 404);
        }

        return sendSuccess(res, draft, 'Draft retrieved successfully');
    } catch (error: any) {
        console.error('Error fetching draft:', error);
        return sendError(res, 'Failed to fetch draft', 500);
    }
};

/**
 * @route POST /api/drafts
 * @desc Create or update a draft (Upsert)
 */
export const upsertDraft = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.authenticatedUser;
        if (!user) return sendError(res, 'Unauthorized', 401);

        const { id, submissionId, draftName, wizardType, payload } = req.body;

        if (!payload) {
            return sendError(res, 'Payload is required', 400);
        }

        let draft;

        // Try to find existing draft by ID or SubmissionID
        if (id) {
            draft = await PublishingDraft.findOne({ where: { id, userId: user.id } });
        } else if (submissionId) {
            draft = await PublishingDraft.findOne({ where: { submissionId, userId: user.id } });
        }

        if (draft) {
            // Update existing
            await draft.update({
                draftName: draftName || draft.draftName,
                wizardType: wizardType || draft.wizardType,
                payload,
                submissionId: submissionId || draft.submissionId // Allow linking an ID later
            });
            return sendSuccess(res, draft, 'Draft updated successfully');
        } else {
            // Create new
            const newDraft = await PublishingDraft.create({
                userId: user.id,
                submissionId: submissionId || null,
                draftName: draftName || 'Untitled Draft',
                wizardType: wizardType || 'PUBLISH_BOOK',
                payload
            });
            return sendSuccess(res, newDraft, 'Draft created successfully', 201);
        }
    } catch (error: any) {
        console.error('Error upserting draft:', error);
        return sendError(res, 'Failed to save draft', 500);
    }
};

/**
 * @route DELETE /api/drafts/:id
 * @route DELETE /api/drafts/submission/:submissionId
 * @desc Delete a specific draft
 */
export const deleteDraft = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.authenticatedUser;
        if (!user) return sendError(res, 'Unauthorized', 401);

        const { id, submissionId } = req.params;
        const where: any = { userId: user.id };

        if (id) {
            where.id = id;
        } else if (submissionId) {
            where.submissionId = submissionId;
        }

        const deleted = await PublishingDraft.destroy({ where });

        if (deleted === 0) {
            return sendError(res, 'Draft not found or already deleted', 404);
        }

        return sendSuccess(res, null, 'Draft deleted successfully');
    } catch (error: any) {
        console.error('Error deleting draft:', error);
        return sendError(res, 'Failed to delete draft', 500);
    }
};
