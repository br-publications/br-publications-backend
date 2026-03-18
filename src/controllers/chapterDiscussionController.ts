import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/responseHandler';
import { ChapterDiscussion } from '../models/chapterDiscussion';
import IndividualChapter from '../models/individualChapter';
import User from '../models/user';
import { UserRole } from '../models/user';
import BookChapterSubmission from '../models/bookChapterSubmission';
import ChapterReviewerAssignment from '../models/chapterReviewerAssignment';

/**
 * @route GET /api/chapters/:chapterId/discussions
 * @desc Get all discussions for a specific chapter
 * @access Private (Author, Editor, Reviewer, Admin)
 */
export const getChapterDiscussions = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.authenticatedUser;
        if (!user) {
            return sendError(res, 'User not authenticated', 401);
        }

        const chapterId = parseInt(req.params.chapterId);
        if (isNaN(chapterId)) {
            return sendError(res, 'Invalid chapter ID', 400);
        }

        // Get chapter with submission info
        const chapter = await IndividualChapter.findByPk(chapterId, {
            include: [{
                model: BookChapterSubmission,
                as: 'submission',
                attributes: ['id', 'submittedBy', 'assignedEditorId']
            }]
        });

        if (!chapter) {
            return sendError(res, 'Chapter not found', 404);
        }

        // Check access permissions
        const isAuthor = chapter.submission?.submittedBy === user.id;
        const isEditor = chapter.submission?.assignedEditorId === user.id;
        const isAdmin = user.hasRole(UserRole.ADMIN) || user.hasRole(UserRole.DEVELOPER);
        const reviewerAssignment = await ChapterReviewerAssignment.findOne({
            where: { chapterId, reviewerId: user.id },
        });
        const isReviewer = !!reviewerAssignment;

        if (!isAuthor && !isEditor && !isAdmin && !isReviewer) {
            return sendError(res, 'You do not have permission to view these discussions', 403);
        }

        // Fetch discussions
        const where: any = { chapterId };

        // Filter internal discussions for non-privileged users
        if (!isEditor && !isAdmin && !isReviewer) {
            where.isInternal = false;
        }

        const discussions = await ChapterDiscussion.findAll({
            where,
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'fullName', 'role', 'profilePicture']
            }],
            order: [['createdAt', 'ASC']]
        });

        return sendSuccess(res, discussions, 'Chapter discussions retrieved successfully');
    } catch (error) {
        console.error('❌ Get chapter discussions error:', error);
        return sendError(res, 'Failed to retrieve discussions', 500);
    }
};

/**
 * @route POST /api/chapters/:chapterId/discussions
 * @desc Create a new discussion message for a chapter
 * @access Private (Author, Editor, Reviewer, Admin)
 */
export const createChapterDiscussion = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.authenticatedUser;
        if (!user) {
            return sendError(res, 'User not authenticated', 401);
        }

        const chapterId = parseInt(req.params.chapterId);
        const { message, isInternal } = req.body;

        if (isNaN(chapterId)) {
            return sendError(res, 'Invalid chapter ID', 400);
        }

        if (!message || message.trim().length === 0) {
            return sendError(res, 'Message is required', 400);
        }

        // Get chapter with submission info
        const chapter = await IndividualChapter.findByPk(chapterId, {
            include: [{
                model: BookChapterSubmission,
                as: 'submission',
                attributes: ['id', 'submittedBy', 'assignedEditorId', 'status']
            }]
        });

        if (!chapter) {
            return sendError(res, 'Chapter not found', 404);
        }

        // Check access permissions
        const isAuthor = chapter.submission?.submittedBy === user.id;
        const isEditor = chapter.submission?.assignedEditorId === user.id;
        const isAdmin = user.hasRole(UserRole.ADMIN) || user.hasRole(UserRole.DEVELOPER);
        const reviewerAssignment = await ChapterReviewerAssignment.findOne({
            where: { chapterId, reviewerId: user.id },
        });
        const isReviewer = !!reviewerAssignment;

        if (!isAuthor && !isEditor && !isAdmin && !isReviewer) {
            return sendError(res, 'You do not have permission to post discussions', 403);
        }

        // Only editors, reviewers, and admins can post internal messages
        const canPostInternal = isEditor || isAdmin || isReviewer;
        if (isInternal && !canPostInternal) {
            return sendError(res, 'You do not have permission to post internal messages', 403);
        }

        // Create discussion
        const discussion = await ChapterDiscussion.create({
            chapterId,
            userId: user.id,
            message: message.trim(),
            isInternal: canPostInternal ? !!isInternal : false,
        });

        // Fetch created discussion with user info
        const discussionWithUser = await ChapterDiscussion.findByPk(discussion.id, {
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'fullName', 'role', 'profilePicture']
            }]
        });

        return sendSuccess(res, discussionWithUser, 'Discussion message posted successfully');
    } catch (error) {
        console.error('❌ Create chapter discussion error:', error);
        return sendError(res, 'Failed to post discussion', 500);
    }
};

/**
 * @route DELETE /api/chapters/:chapterId/discussions/:discussionId
 * @desc Delete a discussion message
 * @access Private (Message author, Admin)
 */
export const deleteChapterDiscussion = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.authenticatedUser;
        if (!user) {
            return sendError(res, 'User not authenticated', 401);
        }

        const discussionId = parseInt(req.params.discussionId);
        if (isNaN(discussionId)) {
            return sendError(res, 'Invalid discussion ID', 400);
        }

        const discussion = await ChapterDiscussion.findByPk(discussionId);
        if (!discussion) {
            return sendError(res, 'Discussion not found', 404);
        }

        // Only the message author or admin can delete
        const isAuthor = discussion.userId === user.id;
        const isAdmin = user.hasRole(UserRole.ADMIN) || user.hasRole(UserRole.DEVELOPER);

        if (!isAuthor && !isAdmin) {
            return sendError(res, 'You do not have permission to delete this message', 403);
        }

        await discussion.destroy();

        return sendSuccess(res, null, 'Discussion message deleted successfully');
    } catch (error) {
        console.error('❌ Delete chapter discussion error:', error);
        return sendError(res, 'Failed to delete discussion', 500);
    }
};
