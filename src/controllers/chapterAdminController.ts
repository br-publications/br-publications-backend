import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/responseHandler';
import IndividualChapter from '../models/individualChapter';
import BookChapterSubmission from '../models/bookChapterSubmission';
import BookTitle from '../models/bookTitle';
import BookChapter from '../models/bookChapter';
import { UserRole } from '../models/user';

/**
 * @route POST /api/chapters/admin/fix-titles
 * @desc Fix chapter titles that have numeric IDs instead of actual titles
 * @access Private (Admin only)
 */
export const fixChapterTitles = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.authenticatedUser;

        if (!user || !user.isAdminOrDeveloper()) {
            return sendError(res, 'Unauthorized', 403);
        }



        // Get all individual chapters with their submissions
        const allChapters = await IndividualChapter.findAll({
            include: [{
                model: BookChapterSubmission,
                as: 'submission',
                attributes: ['id', 'bookTitle']
            }]
        });



        let fixedChaptersCount = 0;
        let fixedSubmissionsCount = 0;
        let skippedCount = 0;
        const fixedChapters: any[] = [];
        const fixedSubmissions: any[] = [];
        const skipped: any[] = [];

        // 1. First, fix BookChapterSubmission records that have numeric bookTitle
        const allSubmissions = await BookChapterSubmission.findAll();
        for (const submission of allSubmissions) {
            const bookTitle = submission.bookTitle;
            if (!isNaN(Number(bookTitle))) {

                const bookTitleRecord = await BookTitle.findByPk(Number(bookTitle));
                if (bookTitleRecord) {
                    const actualTitle = bookTitleRecord.title;

                    submission.bookTitle = actualTitle;
                    await submission.save();
                    fixedSubmissionsCount++;
                    fixedSubmissions.push({ id: submission.id, from: bookTitle, to: actualTitle });
                } else {

                }
            }
        }

        // 2. Now fix individual chapters
        for (const chapter of allChapters) {
            const chapterTitle = chapter.chapterTitle;

            // Check if the title is numeric
            if (!isNaN(Number(chapterTitle))) {
                // Refresh submission to get updated title if it was just fixed
                const submission = await BookChapterSubmission.findByPk(chapter.submissionId);

                if (!submission) {
                    skippedCount++;
                    skipped.push({ id: chapter.id, reason: 'No submission found' });
                    continue;
                }

                // Find the book title record
                const bookTitleRecord = await BookTitle.findOne({
                    where: { title: submission.bookTitle }
                });

                if (!bookTitleRecord) {
                    skippedCount++;
                    skipped.push({ id: chapter.id, reason: `Book title "${submission.bookTitle}" not found` });
                    continue;
                }

                // Find the actual chapter with this ID
                const bookChapter = await BookChapter.findOne({
                    where: {
                        id: Number(chapterTitle),
                        bookTitleId: bookTitleRecord.id,
                        isActive: true
                    }
                });

                if (bookChapter) {
                    const actualTitle = bookChapter.chapterTitle;

                    // Update the chapter title
                    chapter.chapterTitle = actualTitle;
                    await chapter.save();

                    fixedChaptersCount++;
                    fixedChapters.push({
                        id: chapter.id,
                        from: chapterTitle,
                        to: actualTitle,
                        submission: submission.id
                    });


                } else {
                    skippedCount++;
                    skipped.push({ id: chapter.id, reason: `Chapter ID ${chapterTitle} not found` });
                }
            }
        }

        return sendSuccess(res, {
            fixedChapters: fixedChaptersCount,
            fixedSubmissions: fixedSubmissionsCount,
            skipped,
            totalSubmissions: allSubmissions.length,
            totalChapters: allChapters.length,
            details: {
                fixedChapters,
                fixedSubmissions,
                skipped
            }
        }, `Fixed ${fixedSubmissionsCount} submissions and ${fixedChaptersCount} chapters`);

    } catch (error: any) {
        console.error('❌ Error fixing chapter titles:', error);
        return sendError(res, 'Failed to fix chapter titles', 500);
    }
};
