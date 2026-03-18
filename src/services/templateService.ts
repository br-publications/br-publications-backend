import CommunicationTemplate, { CommunicationType } from '../models/communicationTemplate';
import { DEFAULT_TEMPLATES } from '../constants/templates';

interface TemplateData {
    [key: string]: any;
}

class TemplateService {
    /**
     * Fetch a template by code and substitutions
     */
    async getTemplate(code: string, type: CommunicationType, data: TemplateData): Promise<{ subject: string; content: string } | null> {
        try {
            const template = await CommunicationTemplate.findOne({
                where: {
                    code,
                    type,
                    isActive: true
                }
            });

            if (!template) {
                console.warn(`⚠️ Template not found or inactive in DB: ${code} (${type}). Falling back to constants.`);

                // Fallback to coded constants if available
                const defaultTpl = DEFAULT_TEMPLATES[code];
                if (defaultTpl) {
                    const currentYear = new Date().getFullYear().toString();
                    const enrichedData = {
                        currentYear,
                        year: currentYear, // alias for compatibility
                        ...data
                    };
                    const subject = this.substituteVariables(defaultTpl.subject, enrichedData);
                    const content = this.substituteVariables(defaultTpl.content, enrichedData);
                    return { subject, content };
                }

                return null;
            }

            // Resolve which content to use based on contentMode setting
            const activeContent =
                (template.contentMode === 'html' && template.htmlContent)
                    ? template.htmlContent
                    : template.content;

            // Always inject currentYear so {{currentYear}} works in every template
            const currentYear = new Date().getFullYear().toString();
            const enrichedData = {
                currentYear,
                year: currentYear, // alias for compatibility
                ...data
            };

            const subject = this.substituteVariables(template.subject, enrichedData);
            const content = this.substituteVariables(activeContent, enrichedData);

            return { subject, content };
        } catch (error) {
            console.error(`❌ Error fetching template ${code}:`, error);
            return null;
        }
    }

    /**
     * Replace {{variable}} placeholders with data — also public as substituteVariables
     */
    substituteVariables(text: string, data: TemplateData): string {
        return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return data[key] !== undefined ? String(data[key]) : match;
        });
    }
}

export default new TemplateService();
