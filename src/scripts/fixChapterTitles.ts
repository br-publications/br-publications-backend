/**
 * Migration script to fix chapter titles that have numeric IDs instead of actual titles
 * Run this once to update all existing chapters
 */

import IndividualChapter from '../models/individualChapter';
import BookChapterSubmission from '../models/bookChapterSubmission';
import BookTitle from '../models/bookTitle';
import BookChapter from '../models/bookChapter';

async function fixChapterTitles() {


    try {
        // Get all individual chapters
        const allChapters = await IndividualChapter.findAll({
            include: [{
                model: BookChapterSubmission,
                as: 'submission',
                attributes: ['id', 'bookTitle']
            }]
        });



        let fixedCount = 0;
        let skippedCount = 0;

        for (const chapter of allChapters) {
            const chapterTitle = chapter.chapterTitle;

            // Check if the title is numeric
            if (!isNaN(Number(chapterTitle))) {

                const submission = (chapter as any).submission;
                if (!submission) {

                    skippedCount++;
                    continue;
                }

                // Find the book title record
                const bookTitleRecord = await BookTitle.findOne({
                    where: { title: submission.bookTitle }
                });

                if (!bookTitleRecord) {

                    skippedCount++;
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

                    fixedCount++;
                } else {

                    skippedCount++;
                }
            }
        }

    } catch (error) {
        console.error('❌ Error during migration:', error);
        throw error;
    }
}

// If running directly
if (require.main === module) {
    fixChapterTitles()
        .then(() => {

            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Script failed:', error);
            process.exit(1);
        });
}

export default fixChapterTitles;
