import { Request, Response } from 'express';
import { Op } from 'sequelize';
import CommunicationTemplate, { CommunicationType } from '../models/communicationTemplate';
import { sendSuccess, sendError } from '../utils/responseHandler';
import templateService from '../services/templateService';

// ─────────────────────────────────────────────────────────────
// GET /api/templates
// List all communication templates, optionally filtered by type
// Query: ?type=EMAIL|NOTIFICATION&search=<code keyword>
// Access: Admin
// ─────────────────────────────────────────────────────────────
export const listTemplates = async (req: Request, res: Response) => {
    try {
        const { type, search } = req.query as { type?: string; search?: string };

        const where: any = {};
        if (type && Object.values(CommunicationType).includes(type as CommunicationType)) {
            where.type = type;
        }
        if (search) {
            where.code = { [Op.like]: `%${search}%` };
        }

        const templates = await CommunicationTemplate.findAll({
            where,
            order: [['type', 'ASC'], ['code', 'ASC']],
            attributes: ['id', 'code', 'type', 'subject', 'content', 'htmlContent', 'contentMode', 'variables', 'description', 'isActive', 'updatedAt']
        });

        // Group by domain prefix for the frontend
        const grouped: Record<string, any[]> = {};
        for (const t of templates) {
            const domain = getDomain(t.code);
            if (!grouped[domain]) grouped[domain] = [];
            grouped[domain].push(t);
        }

        return sendSuccess(res, { templates, grouped }, 'Templates fetched');
    } catch (err) {
        console.error('listTemplates error:', err);
        return sendError(res, 'Failed to fetch templates', 500);
    }
};

// ─────────────────────────────────────────────────────────────
// GET /api/templates/:id
// Get a single template with full content
// Access: Admin
// ─────────────────────────────────────────────────────────────
export const getTemplate = async (req: Request, res: Response) => {
    try {
        const template = await CommunicationTemplate.findByPk(req.params.id);
        if (!template) return sendError(res, 'Template not found', 404);
        return sendSuccess(res, template, 'Template fetched');
    } catch (err) {
        console.error('getTemplate error:', err);
        return sendError(res, 'Failed to fetch template', 500);
    }
};

// ─────────────────────────────────────────────────────────────
// PUT /api/templates/:id
// Update template subject and/or content
// Body: { subject?, content? }
// Access: Admin
// ─────────────────────────────────────────────────────────────
export const updateTemplate = async (req: Request, res: Response) => {
    try {
        const template = await CommunicationTemplate.findByPk(req.params.id);
        if (!template) return sendError(res, 'Template not found', 404);

        const { subject, content, htmlContent, contentMode } = req.body;

        if (subject === undefined && content === undefined && htmlContent === undefined && contentMode === undefined) {
            return sendError(res, 'Provide at least subject, content, htmlContent, or contentMode to update', 400);
        }

        if (subject !== undefined) template.subject = subject.trim();
        if (content !== undefined) template.content = content.trim();
        if (htmlContent !== undefined) template.htmlContent = htmlContent ? htmlContent.trim() : null;
        if (contentMode === 'rich' || contentMode === 'html') template.contentMode = contentMode;
        await template.save();

        return sendSuccess(res, template, 'Template updated successfully');
    } catch (err) {
        console.error('updateTemplate error:', err);
        return sendError(res, 'Failed to update template', 500);
    }
};

// ─────────────────────────────────────────────────────────────
// PATCH /api/templates/:id/toggle
// Toggle isActive on/off
// Access: Admin
// ─────────────────────────────────────────────────────────────
export const toggleTemplate = async (req: Request, res: Response) => {
    try {
        const template = await CommunicationTemplate.findByPk(req.params.id);
        if (!template) return sendError(res, 'Template not found', 404);

        template.isActive = !template.isActive;
        await template.save();

        return sendSuccess(
            res,
            { id: template.id, code: template.code, isActive: template.isActive },
            `Template ${template.isActive ? 'enabled' : 'disabled'} successfully`
        );
    } catch (err) {
        console.error('toggleTemplate error:', err);
        return sendError(res, 'Failed to toggle template', 500);
    }
};

// ─────────────────────────────────────────────────────────────
// PATCH /api/templates/:id/toggle-mode
// Toggle contentMode between 'rich' and 'html'
// Access: Admin
// ─────────────────────────────────────────────────────────────
export const toggleContentMode = async (req: Request, res: Response) => {
    try {
        const template = await CommunicationTemplate.findByPk(req.params.id);
        if (!template) return sendError(res, 'Template not found', 404);

        // Only allow switching to 'html' if htmlContent actually exists
        if (template.contentMode === 'rich') {
            if (!template.htmlContent) {
                return sendError(res, 'Cannot switch to HTML mode: no HTML content saved for this template yet.', 400);
            }
            template.contentMode = 'html';
        } else {
            template.contentMode = 'rich';
        }
        await template.save();

        return sendSuccess(
            res,
            { id: template.id, code: template.code, contentMode: template.contentMode },
            `Template is now using ${template.contentMode === 'html' ? 'HTML' : 'Rich Text'} content for emails`
        );
    } catch (err) {
        console.error('toggleContentMode error:', err);
        return sendError(res, 'Failed to toggle content mode', 500);
    }
};

// ─────────────────────────────────────────────────────────────
// POST /api/templates/:id/preview
// Render the template with sample variables for preview
// Body: { variables: Record<string, string> }
// Access: Admin
// ─────────────────────────────────────────────────────────────
export const previewTemplate = async (req: Request, res: Response) => {
    try {
        const template = await CommunicationTemplate.findByPk(req.params.id);
        if (!template) return sendError(res, 'Template not found', 404);

        const sampleData: Record<string, string> = req.body.variables || {};
        // Default to the template's own contentMode so preview always shows the active version
        const mode = (req.query.mode as string) || template.contentMode || 'rich';

        // Resolve which content version to preview
        const contentToPreview = (mode === 'html' && template.htmlContent)
            ? template.htmlContent
            : template.content;

        // If no sample data provided, auto-fill all variables with placeholder values
        const vars: string[] = Array.isArray(template.variables) ? template.variables : [];
        const autoData: Record<string, string> = {
            currentYear: new Date().getFullYear().toString(),  // always injected automatically
        };
        for (const v of vars) {
            autoData[v] = sampleData[v] ?? `[${v}]`;
        }

        const renderedSubject = templateService.substituteVariables(template.subject, autoData);
        const renderedContent = templateService.substituteVariables(contentToPreview, autoData);

        return sendSuccess(res, { subject: renderedSubject, content: renderedContent }, 'Preview rendered');
    } catch (err) {
        console.error('previewTemplate error:', err);
        return sendError(res, 'Failed to generate preview', 500);
    }
};

// ─────────────────────────────────────────────────────────────
// Helper: derive domain label from template code
// ─────────────────────────────────────────────────────────────
function getDomain(code: string): string {
    if (code.startsWith('BOOK_CHAPTER')) return 'Book Chapter';
    if (code.startsWith('TEXTBOOK')) return 'Text Book';
    if (code.startsWith('RECRUITMENT')) return 'Recruitment';
    if (code.startsWith('PROJECT')) return 'Projects & Internships';
    return 'Auth & General';
}
