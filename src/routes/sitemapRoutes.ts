import express, { Request, Response } from 'express';

const router = express.Router();

// Helper: URL-safe slug from a string
const toSlug = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

/**
 * GET /sitemap.xml
 * Dynamically generates a sitemap listing all published books and book chapters
 */
router.get('/sitemap.xml', async (req: Request, res: Response) => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'https://www.brpublications.com';
    const today = new Date().toISOString().split('T')[0];

    // Import models dynamically (they're loaded by the time routes are called)
    const { default: PublishedBook } = await import('../models/publishedBook');
    const { default: PublishedBookChapter } = await import('../models/publishedBookChapter');

    // Fetch all published books and chapters
    const [books, chapters] = await Promise.all([
      PublishedBook.findAll({
        attributes: ['id', 'title', 'updatedAt'],
        where: { isHidden: false },
        order: [['id', 'ASC']],
      }),
      PublishedBookChapter.findAll({
        attributes: ['id', 'title', 'updatedAt'],
        where: { isHidden: false },
        order: [['id', 'ASC']],
      }).catch(() => []) // graceful fallback if table differs
    ]);

    // Static pages
    const staticPages = [
      { path: '/', priority: '1.0', changefreq: 'weekly' },
      { path: '/books', priority: '0.9', changefreq: 'weekly' },
      { path: '/bookchapters', priority: '0.9', changefreq: 'weekly' },
      { path: '/resnova', priority: '0.7', changefreq: 'monthly' },
      { path: '/ipr', priority: '0.6', changefreq: 'monthly' },
      { path: '/book-chapter-manuscript', priority: '0.7', changefreq: 'monthly' },
      { path: '/book-manuscript', priority: '0.7', changefreq: 'monthly' },
    ];

    const urlEntries: string[] = [];

    // Add static pages
    staticPages.forEach(page => {
      urlEntries.push(`
  <url>
    <loc>${baseUrl}${page.path}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <lastmod>${today}</lastmod>
  </url>`);
    });

    // Add books
    books.forEach((book: any) => {
      const slug = toSlug(book.title || '');
      const lastmod = book.updatedAt
        ? new Date(book.updatedAt).toISOString().split('T')[0]
        : today;
      urlEntries.push(`
  <url>
    <loc>${baseUrl}/book/${book.id}/${slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <lastmod>${lastmod}</lastmod>
  </url>`);
    });

    // Add book chapters
    chapters.forEach((chapter: any) => {
      const slug = toSlug(chapter.title || '');
      const lastmod = chapter.updatedAt
        ? new Date(chapter.updatedAt).toISOString().split('T')[0]
        : today;
      urlEntries.push(`
  <url>
    <loc>${baseUrl}/bookchapter/${chapter.id}/${slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <lastmod>${lastmod}</lastmod>
  </url>`);
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urlEntries.join('')}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'public, max-age=3600'); // Cache 1h
    res.send(xml);

  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).send('Error generating sitemap');
  }
});

/**
 * GET /robots.txt
 * Tells search engine crawlers what to index and where the sitemap is
 */
router.get('/robots.txt', (req: Request, res: Response) => {
  const baseUrl = process.env.FRONTEND_URL || 'https://www.brpublications.com';

  const robots = `User-agent: *
Allow: /
Disallow: /dashboard/
Disallow: /api/
Disallow: /user/register
Disallow: /user/login

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml
`;

  res.header('Content-Type', 'text/plain');
  res.header('Cache-Control', 'public, max-age=86400'); // Cache 24h
  res.send(robots);
});

export default router;
