import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
    listTemplates,
    getTemplate,
    updateTemplate,
    toggleTemplate,
    toggleContentMode,
    previewTemplate
} from '../controllers/communicationTemplateController';

const router = Router();

// All routes require Admin or Developer role
router.use(authenticate, authorize(['admin', 'developer']));

/**
 * GET /api/templates
 * List all templates (optionally ?type=EMAIL|NOTIFICATION & ?search=<keyword>)
 */
router.get('/', listTemplates);

/**
 * GET /api/templates/:id
 * Get a single template with full content
 */
router.get('/:id', getTemplate);

/**
 * PUT /api/templates/:id
 * Update subject and/or content of a template
 * Body: { subject?, content? }
 */
router.put('/:id', updateTemplate);

/**
 * PATCH /api/templates/:id/toggle
 * Toggle isActive flag
 */
router.patch('/:id/toggle', toggleTemplate);

/**
 * PATCH /api/templates/:id/toggle-mode
 * Toggle contentMode between 'rich' and 'html'
 */
router.patch('/:id/toggle-mode', toggleContentMode);

/**
 * POST /api/templates/:id/preview
 * Preview rendered template with sample variables
 * Body: { variables: { key: value, ... } }
 */
router.post('/:id/preview', previewTemplate);

export default router;
