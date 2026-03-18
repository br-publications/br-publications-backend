import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Import models
import BookChapterSubmission, { BookChapterStatus } from '../models/bookChapterSubmission';
import IndividualChapter, { ChapterStatus } from '../models/individualChapter';
import ChapterStatusHistory from '../models/chapterStatusHistory';
import ChapterReviewerAssignment, { ReviewerAssignmentStatus } from '../models/chapterReviewerAssignment';
import User from '../models/user';
import BookChapterFile from '../models/bookChapterFile';
import BookChapterReviewerAssignment from '../models/bookChapterReviewerAssignment';
import BookChapterStatusHistory from '../models/bookChapterStatusHistory';
import TokenBlacklist from '../models/tokenBlacklist';
import PublishedBook from '../models/publishedBook';
import BookChapterDiscussion from '../models/bookChapterDiscussion';
import Notification from '../models/notification';
import BookTitle from '../models/bookTitle';
import BookChapter from '../models/bookChapter';
import BookEditor from '../models/bookEditor';
import ChapterRevision from '../models/chapterRevision';

// Create sequelize instance
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

/**
 * Map old submission status to new chapter status
 */
function mapSubmissionStatusToChapterStatus(submissionStatus: BookChapterStatus): ChapterStatus {
    const mapping: Record<BookChapterStatus, ChapterStatus> = {
        [BookChapterStatus.ABSTRACT_SUBMITTED]: ChapterStatus.ABSTRACT_SUBMITTED,
        [BookChapterStatus.MANUSCRIPTS_PENDING]: ChapterStatus.MANUSCRIPTS_PENDING,
        [BookChapterStatus.REVIEWER_ASSIGNMENT]: ChapterStatus.REVIEWER_ASSIGNMENT,
        [BookChapterStatus.UNDER_REVIEW]: ChapterStatus.UNDER_REVIEW,
        [BookChapterStatus.EDITORIAL_REVIEW]: ChapterStatus.EDITORIAL_REVIEW,
        [BookChapterStatus.APPROVED]: ChapterStatus.CHAPTER_APPROVED,
        [BookChapterStatus.REJECTED]: ChapterStatus.CHAPTER_REJECTED,
        [BookChapterStatus.PUBLISHED]: ChapterStatus.CHAPTER_APPROVED,
        [BookChapterStatus.ISBN_APPLIED]: ChapterStatus.CHAPTER_APPROVED,
        [BookChapterStatus.PUBLICATION_IN_PROGRESS]: ChapterStatus.CHAPTER_APPROVED,
    };

    return mapping[submissionStatus] || ChapterStatus.ABSTRACT_SUBMITTED;
}

/**
 * Initialize database models
 */
async function initializeModels() {
    const models = {
        User,
        TokenBlacklist,
        BookChapterSubmission,
        PublishedBook,
        BookChapterFile,
        BookChapterReviewerAssignment,
        BookChapterStatusHistory,
        BookChapterDiscussion,
        Notification,
        BookTitle,
        BookChapter,
        BookEditor,
        IndividualChapter,
        ChapterReviewerAssignment,
        ChapterRevision,
        ChapterStatusHistory,
    };

    // Initialize each model
    Object.values(models).forEach((model: any) => model.initialize(sequelize));

    // Set up associations
    Object.values(models).forEach((model: any) => {
        if (model.associate) model.associate(models);
    });


}

/**
 * Migrate existing submissions to chapter-centric model
 */
async function migrateExistingSubmissions() {
    const transaction = await sequelize.transaction();

    try {


        // Get all submissions
        const submissions = await BookChapterSubmission.findAll({
            order: [['id', 'ASC']],
        });



        let migratedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        for (const submission of submissions) {
            try {




                // Check if chapters already exist for this submission
                const existingChapters = await IndividualChapter.findAll({
                    where: { submissionId: submission.id },
                    transaction,
                });

                if (existingChapters.length > 0) {

                    skippedCount++;
                    continue;
                }

                // Map submission status to chapter status
                const chapterStatus = mapSubmissionStatusToChapterStatus(submission.status);

                // Create individual chapters
                for (const [index, chapterTitle] of submission.bookChapterTitles.entries()) {
                    const chapter = await IndividualChapter.create({
                        submissionId: submission.id,
                        chapterTitle: chapterTitle,
                        chapterNumber: index + 1,
                        status: chapterStatus,
                        assignedReviewers: null,
                        reviewDeadline: submission.reviewDeadline || null,
                        manuscriptFileId: null,
                        editorDecision: null,
                        editorDecisionDate: submission.editorDecisionDate || null,
                        editorDecisionNotes: null,
                        revisionCount: submission.revisionCount || 0,
                        currentRevisionNumber: submission.currentRevisionNumber || 0,
                    }, { transaction });

                    // Create initial status history for chapter
                    await ChapterStatusHistory.create({
                        chapterId: chapter.id,
                        previousStatus: null,
                        newStatus: chapterStatus,
                        changedBy: submission.submittedBy,
                        action: 'Migration from legacy submission',
                        notes: `Migrated from submission #${submission.id}`,
                        metadata: {
                            originalSubmissionStatus: submission.status,
                            migrationDate: new Date(),
                        },
                    }, { transaction });

                    // Legacy: no longer migrating reviewer assignments from submission level
                    // Reviewers are now assigned at the chapter level through ChapterReviewerAssignment


                }

                migratedCount++;


            } catch (error: any) {
                console.error(`   ❌ Error migrating submission #${submission.id}:`, error.message);
                errorCount++;
            }
        }

    } catch (error: any) {
        await transaction.rollback();
        console.error('\n❌ Migration failed:', error);
        throw error;
    }
}

/**
 * Rollback migration - delete all migrated chapters
 */
async function rollbackMigration() {
    const transaction = await sequelize.transaction();

    try {


        const chapterCount = await IndividualChapter.count();
        const historyCount = await ChapterStatusHistory.count();
        const assignmentCount = await ChapterReviewerAssignment.count();





        await ChapterReviewerAssignment.destroy({ where: {}, transaction });
        await ChapterStatusHistory.destroy({ where: {}, transaction });
        await IndividualChapter.destroy({ where: {}, transaction });

        await transaction.commit();






    } catch (error: any) {
        await transaction.rollback();
        console.error('\n❌ Rollback failed:', error);
        throw error;
    }
}

// Main execution
const command = process.argv[2];

async function main() {
    try {
        await sequelize.authenticate();


        await initializeModels();

        if (command === 'migrate') {
            await migrateExistingSubmissions();
        } else if (command === 'rollback') {
            await rollbackMigration();
        } else {



            process.exit(1);
        }

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        await sequelize.close();
        process.exit(1);
    }
}

main();
