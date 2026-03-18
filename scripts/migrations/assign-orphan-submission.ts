
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

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

async function assignOrphan() {
    try {
        console.log('🔌 Connecting to database...');
        await sequelize.authenticate();

        const BookChapterSubmission = (await import('../../src/models/bookChapterSubmission')).default;
        const User = (await import('../../src/models/user')).default;

        BookChapterSubmission.initialize(sequelize);
        User.initialize(sequelize);

        // Find editor@gmail.com
        const targetEditor = await User.findOne({ where: { email: 'editor@gmail.com' } });
        if (!targetEditor) {
            console.error('❌ Could not find user: editor@gmail.com');
            return;
        }

        // Find orphan submissions (status INITIAL_SUBMITTED and assignedEditorId IS NULL)
        const [updatedCount] = await BookChapterSubmission.update(
            { assignedEditorId: targetEditor.id },
            {
                where: {
                    status: 'INITIAL_SUBMITTED',
                    assignedEditorId: null
                }
            }
        );

        // Double check ID 5 specifically if needed
        const sub5 = await BookChapterSubmission.findByPk(5);
        if (sub5 && !sub5.assignedEditorId) {
            sub5.assignedEditorId = targetEditor.id;
            await sub5.save();
            console.log('✅ Forced assignment of Submission ID 5.');
        }

        await sequelize.close();
        console.log('🎉 Done!');

    } catch (error) {
        console.error('Error:', error);
    }
}

assignOrphan();
