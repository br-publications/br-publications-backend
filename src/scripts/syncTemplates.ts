import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import CommunicationTemplate, { CommunicationType } from '../models/communicationTemplate';
import { DEFAULT_TEMPLATES } from '../constants/templates';

interface TemplateDef {
    subject: string;
    content: string;
    description?: string;
    variables?: string[];
}

dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME as string,
    process.env.DB_USER as string,
    process.env.DB_PASSWORD as string,
    {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 3306,
        dialect: (process.env.DB_DIALECT as any) || 'mysql',
        logging: false,
    }
);

// Initialize model
CommunicationTemplate.initialize(sequelize);

/**
 * Script to populate/sync the database with templates defined in constants.
 * This can be run manually to ensure all default templates exist in the DB.
 */
export const syncTemplatesFromConstants = async () => {
    console.log('🔄 Syncing communication templates from constants to database...');

    let createdCount = 0;
    let skippedCount = 0;

    for (const [code, tpl] of Object.entries(DEFAULT_TEMPLATES)) {
        try {
            const [model, created] = await CommunicationTemplate.findOrCreate({
                where: { code, type: CommunicationType.EMAIL },
                defaults: {
                    code,
                    type: CommunicationType.EMAIL,
                    subject: tpl.subject,
                    content: tpl.content,
                    htmlContent: tpl.content.includes('<html') || tpl.content.includes('<!DOCTYPE') ? tpl.content : null,
                    contentMode: (tpl.content.includes('<html') || tpl.content.includes('<!DOCTYPE')) ? 'html' : 'rich',
                    variables: tpl.variables || [],
                    description: (tpl as any).description || null,
                    isActive: true
                }
            });

            if (!created) {
                // Update variables, subject, and description even if it already exists
                // This ensures keywords and descriptions are visible in the Admin UI
                model.variables = tpl.variables || [];
                model.subject = tpl.subject;
                if ((tpl as any).description) model.description = (tpl as any).description;
                
                // If it's a new system-wide update, we might want to update the content too
                // For this specific task, we'll ensure content is synced if it was empty/null
                if (!model.content) model.content = tpl.content;

                // Also sync the new columns for existing templates
                model.htmlContent = tpl.content.includes('<html') || tpl.content.includes('<!DOCTYPE') ? tpl.content : null;
                model.contentMode = (tpl.content.includes('<html') || tpl.content.includes('<!DOCTYPE')) ? 'html' : 'rich';
                
                await model.save();
                console.log(`✅ Updated metadata for template: ${code}`);
                skippedCount++;
            } else {
                console.log(`✅ Created template: ${code}`);
                createdCount++;
            }
        } catch (error) {
            console.error(`❌ Error syncing template ${code}:`, error);
        }
    }

    console.log(`✨ Sync completed. Created: ${createdCount}, Already existed: ${skippedCount}`);
};

// Can be called via a npm script if needed
if (require.main === module) {
    syncTemplatesFromConstants().then(() => process.exit(0)).catch(() => process.exit(1));
}
