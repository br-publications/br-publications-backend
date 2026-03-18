import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

import CommunicationTemplate, { CommunicationType } from '../models/communicationTemplate';
import { BOOK_CHAPTER_PUBLISHED_TEMPLATE } from '../constants/templates/bookChapterPublishedTemplate';

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

CommunicationTemplate.initialize(sequelize);

const insertTemplate = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ DB Connected.');

        const code = 'BOOK_CHAPTER_PUBLISHED';
        const tpl = BOOK_CHAPTER_PUBLISHED_TEMPLATE[code];

        const [template, created] = await CommunicationTemplate.findOrCreate({
            where: { code, type: CommunicationType.EMAIL },
            defaults: {
                code,
                type: CommunicationType.EMAIL,
                subject: tpl.subject,
                content: tpl.content,
                htmlContent: tpl.content.includes('<html') || tpl.content.includes('<!DOCTYPE') ? tpl.content : null,
                contentMode: (tpl.content.includes('<html') || tpl.content.includes('<!DOCTYPE')) ? 'html' : 'rich',
                variables: [],
                isActive: true
            }
        });

        if (created) {
            console.log(`✅ Created template: ${code}`);
        } else {
            console.log(`ℹ️ Template already exists: ${code}. Updating...`);
            await template.update({
                subject: tpl.subject,
                content: tpl.content,
                htmlContent: tpl.content.includes('<html') || tpl.content.includes('<!DOCTYPE') ? tpl.content : null,
                contentMode: (tpl.content.includes('<html') || tpl.content.includes('<!DOCTYPE')) ? 'html' : 'rich',
                variables: ['authorName', 'bookTitle', 'isbn', 'doi', 'publicationDate', 'link', 'keywords']
            });
            console.log(`✅ Updated existing template: ${code}`);
        }

    } catch (error) {
        console.error('❌ Error inserting template:', error);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
};

insertTemplate();
