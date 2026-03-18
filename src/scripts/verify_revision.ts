
import { config } from 'dotenv';
// Load env vars
config();

const API_URL = 'http://localhost:5000/api';

// Helper to log steps
const log = (msg: string) => console.log(`[LOG] ${msg}`);
const error = (msg: string, err?: any) => console.error(`[ERROR] ${msg}`, err);

async function main() {
    try {
        log('Starting verification script...');

        // 1. Login Admin
        log('Logging in as Admin...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usernameOrEmail: 'admin@example.com', password: 'admin123' })
        });

        if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.statusText}`);
        const loginData = (await loginRes.json()) as any;
        const adminToken = loginData.token;
        log('Admin logged in successfully.');

        // 2. Get Submissions (Admin)
        log('Fetching submissions...');
        const subsRes = await fetch(`${API_URL}/book-chapters/admin/submissions?limit=5`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const subsData = (await subsRes.json()) as any;
        const submissions = subsData.data.items || subsData.data.submissions || [];

        if (submissions.length === 0) throw new Error('No submissions found to test.');

        // Find a submission that has chapters
        // and ideally one that is NOT fully published/rejected
        const submission = submissions.find((s: any) =>
            s.status !== 'PUBLISHED' && s.status !== 'REJECTED'
        ) || submissions[0];

        log(`Selected submission: ${submission.id} - ${submission.bookTitle} (Status: ${submission.status})`);

        // 3. Get Chapters
        const chaptersRes = await fetch(`${API_URL}/chapters/submission/${submission.id}/chapters`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const chaptersData = (await chaptersRes.json()) as any;
        const chapters = chaptersData.data;

        if (!chapters || chapters.length === 0) {
            throw new Error('No chapters found for submission.');
        }

        const chapter = chapters[0];
        log(`Selected chapter: ${chapter.id} - ${chapter.chapterTitle} (Status: ${chapter.status})`);

        // 4. Ensure Reviewer Assigned
        let reviewerId = chapter.assignedReviewers?.[0];

        if (!reviewerId) {
            log('No reviewer assigned. Finding a user to assign...');
            const usersRes = await fetch(`${API_URL}/users`, {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            const usersData = (await usersRes.json()) as any;
            const users = usersData.data.users || usersData.data;

            // Find a reviewer who is NOT the author
            const reviewer = users.find((u: any) =>
                (u.role === 'reviewer' || u.role === 'editor') && u.id !== submission.submittedBy
            );

            if (!reviewer) throw new Error('No suitable reviewer found.');
            reviewerId = reviewer.id;

            // Assign
            log(`Assigning reviewer ${reviewerId}...`);
            const assignRes = await fetch(`${API_URL}/chapters/${chapter.id}/assign-reviewers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                },
                body: JSON.stringify({ reviewerIds: [reviewerId], deadline: new Date(Date.now() + 86400000).toISOString() })
            });

            if (!assignRes.ok) {
                const err = (await assignRes.json()) as any;
                log(`Assign failed: ${JSON.stringify(err)}`);
                // Proceed if likely already assigned or trivial error
            } else {
                log(`Assigned reviewer: ${reviewerId}`);
            }
        } else {
            if (typeof reviewerId === 'object') reviewerId = (reviewerId as any).id || (reviewerId as any).reviewerId;
            log(`Reviewer already assigned: ${reviewerId}`);
        }

        // 5. Impersonate Reviewer
        log(`Impersonating Reviewer (ID: ${reviewerId})...`);
        const impReviewerRes = await fetch(`${API_URL}/users/impersonate/${reviewerId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const impReviewerData = (await impReviewerRes.json()) as any;
        if (!impReviewerData.success) throw new Error('Failed to impersonate reviewer.');
        const reviewerToken = impReviewerData.data.token;

        // 6. Request Revision (Reviewer)
        log('Requesting Revision...');
        const revReqRes = await fetch(`${API_URL}/chapters/${chapter.id}/request-revision`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${reviewerToken}`
            },
            body: JSON.stringify({ reviewerComments: "Please update the introduction (Verification Test)." })
        });

        if (!revReqRes.ok) {
            const err = (await revReqRes.json()) as any;
            log(`Request revision response: ${revReqRes.status} - ${JSON.stringify(err)}`);
            // If 400, maybe already requested?
        } else {
            log('Revision requested successfully.');
        }

        // Verify status is REVISION_REQUESTED
        const chapterCheckRes = await fetch(`${API_URL}/chapters/${chapter.id}`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const chapterCheck = (await chapterCheckRes.json() as any).data;
        if (chapterCheck.status !== 'REVISION_REQUESTED') {
            log(`WARNING: Chapter status is ${chapterCheck.status}, expected REVISION_REQUESTED.`);
            // If it failed, we can't really test upload revision properly if the constraint checks status
            // But maybe the upload works anyway if I relaxed checks? No, I added checks.
        } else {
            log('Confirmed Chapter Status: REVISION_REQUESTED');
        }

        // 7. Impersonate Author
        const authorId = submission.submittedBy;
        log(`Impersonating Author (ID: ${authorId})...`);
        const impAuthorRes = await fetch(`${API_URL}/users/impersonate/${authorId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const impAuthorData = (await impAuthorRes.json()) as any;
        const authorToken = impAuthorData.data.token;

        // 8. Upload Manuscript (Author)
        log('Uploading Revision Manuscript...');

        try {
            const formData = new FormData();
            const fileContent = "Dummy revision content for verification " + Date.now();
            const file = new Blob([fileContent], { type: 'text/plain' });

            // We append 'manuscript' as file
            formData.append('manuscript', file, 'revision_verification.txt');
            formData.append('customFileName', 'revision_verification.txt'); // Optional

            // Use correct endpoint: /api/book-chapters/chapters/:chapterId/upload-manuscript
            const uploadRes = await fetch(`${API_URL}/book-chapters/chapters/${chapter.id}/upload-manuscript`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authorToken}`
                    // Content-Type not needed for FormData
                },
                body: formData
            });

            if (!uploadRes.ok) {
                const err = (await uploadRes.json()) as any;
                throw new Error(`Upload failed: ${uploadRes.status} - ${JSON.stringify(err)}`);
            }

            const uploadData = (await uploadRes.json()) as any;
            log(`Upload success!`);

            // 9. Verify Final Status
            const finalChapterRes = await fetch(`${API_URL}/chapters/${chapter.id}`, {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            const finalChapter = (await finalChapterRes.json() as any).data;

            log(`Final Chapter Status: ${finalChapter.status}`);
            if (finalChapter.status === 'REVISION_SUBMITTED') {
                log('✅ VERIFICATION PASSED: Status is REVISION_SUBMITTED');
            } else {
                log('❌ VERIFICATION FAILED: Status is NOT REVISION_SUBMITTED');
            }

        } catch (e: any) {
            log(`Failed to upload: ${e.message}`);
        }

    } catch (err: any) {
        error('Script failed', err);
        process.exit(1);
    }
}

main();
