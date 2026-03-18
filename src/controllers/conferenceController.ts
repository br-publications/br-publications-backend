import { Request, Response } from 'express';
import { Op } from 'sequelize';

// ─── Helpers ────────────────────────────────────────────────
const getModels = async () => {
    const Conference = (await import('../models/conference')).default;
    const ConferenceArticle = (await import('../models/conferenceArticle')).default;
    return { Conference, ConferenceArticle };
};

const ok = (res: Response, data: any, status = 200) =>
    res.status(status).json({ success: true, data });

const err = (res: Response, message: string, status = 500, error?: any) => {
    console.error(`[Conference] ${message}`, error ?? '');
    return res.status(status).json({ success: false, message });
};

// ════════════════════════════════════════════════════════════
// PUBLIC — CONFERENCES
// ════════════════════════════════════════════════════════════

/**
 * GET /api/conferences
 * Query: page, limit, search, publisher
 */
export const getConferences = async (req: Request, res: Response) => {
    try {
        const { Conference } = await getModels();
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
        const search = (req.query.search as string)?.trim() || '';
        const publisher = (req.query.publisher as string)?.trim() || '';

        const where: any = { isActive: true };

        if (search) {
            where[Op.or] = [
                { title: { [Op.iLike]: `%${search}%` } },
                { publisher: { [Op.iLike]: `%${search}%` } },
                { location: { [Op.iLike]: `%${search}%` } },
            ];
        }

        if (publisher) {
            where.publisher = { [Op.iLike]: `%${publisher}%` };
        }

        const { rows: conferences, count: total } = await Conference.findAndCountAll({
            where,
            order: [['createdAt', 'DESC']],
            limit,
            offset: (page - 1) * limit,
        });

        return ok(res, {
            conferences,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        });
    } catch (e) {
        return err(res, 'Failed to fetch conferences', 500, e);
    }
};

/**
 * GET /api/conferences/:id
 */
export const getConferenceById = async (req: Request, res: Response) => {
    try {
        const { Conference } = await getModels();
        const conference = await Conference.findOne({
            where: { id: req.params.id, isActive: true },
        });
        if (!conference) return err(res, 'Conference not found', 404);
        return ok(res, { conference });
    } catch (e) {
        return err(res, 'Failed to fetch conference', 500, e);
    }
};

// ════════════════════════════════════════════════════════════
// PUBLIC — ARTICLES
// ════════════════════════════════════════════════════════════

/**
 * GET /api/conferences/:id/articles
 * Query: page, limit, search
 */
export const getArticlesByConference = async (req: Request, res: Response) => {
    try {
        const { Conference, ConferenceArticle } = await getModels();
        const confId = Number(req.params.id);

        const conference = await Conference.findOne({
            where: { id: confId, isActive: true },
        });
        if (!conference) return err(res, 'Conference not found', 404);

        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
        const search = (req.query.search as string)?.trim() || '';

        const where: any = { conferenceId: confId, isActive: true };

        if (search) {
            where[Op.or] = [
                { title: { [Op.iLike]: `%${search}%` } },
                { abstract: { [Op.iLike]: `%${search}%` } },
            ];
        }

        const { rows: articles, count: total } = await ConferenceArticle.findAndCountAll({
            where,
            order: [['id', 'ASC']],
            limit,
            offset: (page - 1) * limit,
        });

        return ok(res, {
            articles,
            conference,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        });
    } catch (e) {
        return err(res, 'Failed to fetch articles', 500, e);
    }
};

/**
 * GET /api/conferences/:id/articles/:articleId
 */
export const getArticleById = async (req: Request, res: Response) => {
    try {
        const { Conference, ConferenceArticle } = await getModels();
        const confId = Number(req.params.id);
        const artId = Number(req.params.articleId);

        const conference = await Conference.findOne({ where: { id: confId, isActive: true } });
        if (!conference) return err(res, 'Conference not found', 404);

        const article = await ConferenceArticle.findOne({
            where: { id: artId, conferenceId: confId, isActive: true },
        });
        if (!article) return err(res, 'Article not found', 404);

        // Fetch prev/next article IDs for navigation
        const allIds = (await ConferenceArticle.findAll({
            where: { conferenceId: confId, isActive: true },
            attributes: ['id'],
            order: [['id', 'ASC']],
        })).map((a: any) => a.id);

        const artIdx = allIds.indexOf(artId);
        const prevId = artIdx > 0 ? allIds[artIdx - 1] : null;
        const nextId = artIdx < allIds.length - 1 ? allIds[artIdx + 1] : null;

        return ok(res, {
            article,
            conference,
            navigation: {
                total: allIds.length,
                position: artIdx + 1,
                prevId,
                nextId,
            },
        });
    } catch (e) {
        return err(res, 'Failed to fetch article', 500, e);
    }
};

// ════════════════════════════════════════════════════════════
// ADMIN — CONFERENCES
// ════════════════════════════════════════════════════════════

/** POST /api/conferences */
export const createConference = async (req: Request, res: Response) => {
    try {
        const { Conference } = await getModels();
        const conference = await Conference.create(req.body);
        return ok(res, { conference }, 201);
    } catch (e) {
        return err(res, 'Failed to create conference', 500, e);
    }
};

/** PUT /api/conferences/:id */
export const updateConference = async (req: Request, res: Response) => {
    try {
        const { Conference } = await getModels();
        const conference = await Conference.findByPk(req.params.id);
        if (!conference) return err(res, 'Conference not found', 404);
        await conference.update(req.body);
        return ok(res, { conference });
    } catch (e) {
        return err(res, 'Failed to update conference', 500, e);
    }
};

/** DELETE /api/conferences/:id */
export const deleteConference = async (req: Request, res: Response) => {
    try {
        const { Conference } = await getModels();
        const conference = await Conference.findByPk(req.params.id);
        if (!conference) return err(res, 'Conference not found', 404);
        await conference.update({ isActive: false });
        return ok(res, { message: 'Conference deactivated' });
    } catch (e) {
        return err(res, 'Failed to delete conference', 500, e);
    }
};

// ════════════════════════════════════════════════════════════
// ADMIN — ARTICLES
// ════════════════════════════════════════════════════════════

/** POST /api/conferences/:id/articles */
export const createArticle = async (req: Request, res: Response) => {
    try {
        const { Conference, ConferenceArticle } = await getModels();
        const conference = await Conference.findByPk(req.params.id);
        if (!conference) return err(res, 'Conference not found', 404);
        const article = await ConferenceArticle.create({ ...req.body, conferenceId: Number(req.params.id) });
        // Update articleCount
        const count = await ConferenceArticle.count({ where: { conferenceId: conference.id, isActive: true } });
        await conference.update({ articleCount: count });
        return ok(res, { article }, 201);
    } catch (e) {
        return err(res, 'Failed to create article', 500, e);
    }
};

/** PUT /api/conferences/:id/articles/:articleId */
export const updateArticle = async (req: Request, res: Response) => {
    try {
        const { ConferenceArticle } = await getModels();
        const article = await ConferenceArticle.findOne({
            where: { id: req.params.articleId, conferenceId: req.params.id },
        });
        if (!article) return err(res, 'Article not found', 404);
        await article.update(req.body);
        return ok(res, { article });
    } catch (e) {
        return err(res, 'Failed to update article', 500, e);
    }
};

/** DELETE /api/conferences/:id/articles/:articleId */
export const deleteArticle = async (req: Request, res: Response) => {
    try {
        const { Conference, ConferenceArticle } = await getModels();
        const article = await ConferenceArticle.findOne({
            where: { id: req.params.articleId, conferenceId: req.params.id },
        });
        if (!article) return err(res, 'Article not found', 404);
        await article.update({ isActive: false });
        // Update articleCount
        const conference = await Conference.findByPk(req.params.id);
        if (conference) {
            const count = await ConferenceArticle.count({ where: { conferenceId: conference.id, isActive: true } });
            await conference.update({ articleCount: count });
        }
        return ok(res, { message: 'Article deactivated' });
    } catch (e) {
        return err(res, 'Failed to delete article', 500, e);
    }
};
