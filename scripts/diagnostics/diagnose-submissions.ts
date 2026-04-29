
import dotenv from 'dotenv';
import { Sequelize, Op } from 'sequelize';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Database Configuration
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

async function diagnose() {
    try {
        console.log('🔌 Connecting to database...');
        await sequelize.authenticate();

        // Import models logic (simplified)
        const User = (await import('../../src/models/user')).default;
        const BookChapterSubmission = (await import('../../src/models/bookChapterSubmission')).default;

        User.initialize(sequelize);
        BookChapterSubmission.initialize(sequelize);

        const users = await User.findAll({
            attributes: ['id', 'email', 'role', 'username', 'fullName']
        });

        const submissions = await BookChapterSubmission.findAll();

        if (submissions.length === 0) {
            console.log('❌ NO SUBMISSIONS FOUND IN DATABASE.');
        } else {
            console.table(submissions.map(s => ({
                id: s.id,
                title: s.bookTitle.substring(0, 30) + '...',
                status: s.status,
                assignedEditorId: s.assignedEditorId,
                submittedBy: s.submittedBy
            })));
        }

        const editors = users.filter(u => u.role === 'editor');

        editors.forEach(editor => {
            const assignedCount = submissions.filter(s => s.assignedEditorId === editor.id).length;
            if (assignedCount > 0) {
                const statuses = submissions.filter(s => s.assignedEditorId === editor.id).map(s => s.status);
            }
        });

        await sequelize.close();
    } catch (error) {
        console.error('Error:', error);
    }
}

diagnose();
