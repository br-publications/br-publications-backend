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
 * Escapes special XML characters
 */
const escapeXml = (unsafe: string): string => {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
};

/**
 * Generates a unique 6-digit slug in the format uid=XXXXXX
 * based on the book's ISBN and Release Date.
 */
const generateUniqueSlug = (isbn: string, releaseDate?: string): string => {
  const combined = `${isbn}${releaseDate || ''}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const positiveHash = Math.abs(hash);
  const sixDigit = (positiveHash % 1000000).toString().padStart(6, '0');
  return `uid=${sixDigit}`;
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
    const { default: PublishedAuthor } = await import('../models/publishedAuthor');
    const { default: PublishedEditor } = await import('../models/publishedEditor');
    const { default: PublishedIndividualChapter } = await import('../models/publishedIndividualChapter');

    // Fetch all published books, chapters, individual chapters, authors, and editors
    const [books, chapters, individualChapters, authors, editors] = await Promise.all([
      PublishedBook.findAll({
        attributes: ['id', 'updatedAt'],
        where: { isHidden: false },
        order: [['id', 'ASC']],
      }),
      PublishedBookChapter.findAll({
        attributes: ['id', 'title', 'isbn', 'releaseDate', 'updatedAt'],
        where: { isHidden: false },
        order: [['id', 'ASC']],
      }).catch(() => []),
      PublishedIndividualChapter.findAll({
        attributes: ['id', 'publishedBookChapterId', 'chapterNumber', 'title', 'updatedAt'],
        order: [['id', 'ASC']],
      }).catch(() => []),
      PublishedAuthor.findAll({
        attributes: ['id', 'name', 'updatedAt'],
        order: [['id', 'ASC']],
      }).catch(() => []),
      PublishedEditor.findAll({
        attributes: ['id', 'name', 'updatedAt'],
        order: [['id', 'ASC']],
      }).catch(() => []),
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
      const lastmod = book.updatedAt
        ? new Date(book.updatedAt).toISOString().split('T')[0]
        : today;
      urlEntries.push(`
  <url>
    <loc>${baseUrl}/book/${book.id}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <lastmod>${lastmod}</lastmod>
  </url>`);
    });

    // Add book chapters
    chapters.forEach((chapter: any) => {
      const slug = generateUniqueSlug(chapter.isbn || '', chapter.releaseDate || '');
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
    // Add individual chapter pages (/book/:bookId/chapter/:chapterNumber)
    individualChapters.forEach((ic: any) => {
      if (!ic.publishedBookChapterId || !ic.chapterNumber) return;
      const lastmod = ic.updatedAt
        ? new Date(ic.updatedAt).toISOString().split('T')[0]
        : today;
      urlEntries.push(`
  <url>
    <loc>${baseUrl}/book/${ic.publishedBookChapterId}/chapter/${ic.chapterNumber}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.75</priority>
    <lastmod>${lastmod}</lastmod>
  </url>`);
    });

    // Add author profile pages
    authors.forEach((author: any) => {
      const lastmod = author.updatedAt
        ? new Date(author.updatedAt).toISOString().split('T')[0]
        : today;
      urlEntries.push(`
  <url>
    <loc>${baseUrl}/author/${author.id}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <lastmod>${lastmod}</lastmod>
  </url>`);
    });

    // Add editor profile pages
    editors.forEach((editor: any) => {
      const lastmod = editor.updatedAt
        ? new Date(editor.updatedAt).toISOString().split('T')[0]
        : today;
      urlEntries.push(`
  <url>
    <loc>${baseUrl}/editor/${editor.id}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
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
  const frontendUrl = process.env.FRONTEND_URL || 'https://www.brpublications.com';

  const robots = `User-agent: *
Allow: /
Disallow: /dashboard/
Disallow: /user/register
Disallow: /user/login
# Allow Googlebot to read the public APIs needed for rendering the website
Allow: /api/book-chapter-publishing/
Allow: /api/books/
Allow: /api/contact/
# Block sensitive APIs if necessary
# Disallow: /api/admin/

User-agent: bingbot
Crawl-delay: 10

Sitemap: ${frontendUrl}/sitemap.xml
`;

  res.header('Content-Type', 'text/plain');
  res.header('Cache-Control', 'public, max-age=86400'); // Cache 24h
  res.send(robots);
});

/**
 * GET /onix-feed.xml
 * Generates an ONIX 3.0 feed for Google Books Partner Center
 */
router.get('/onix-feed.xml', async (req: Request, res: Response) => {
  try {
    const { default: PublishedBook } = await import('../models/publishedBook');
    const { default: PublishedBookChapter } = await import('../models/publishedBookChapter');

    // Fetch all public books from both tables
    const [books, chapters] = await Promise.all([
      PublishedBook.findAll({ where: { isHidden: false } }),
      PublishedBookChapter.findAll({ where: { isHidden: false } }),
    ]);

    const allItems = [
      ...books.map((b: any) => ({
        id: `BOOK-${b.id}`,
        title: b.title,
        isbn: b.isbn.replace(/-/g, ''),
        author: b.author,
        description: b.description || b.title,
        publishedYear: b.publishedDate || new Date(b.createdAt).getFullYear().toString(),
        publisher: 'BR Publications'
      })),
      ...chapters.map((c: any) => ({
        id: `RESNOVA-${c.id}`,
        title: c.title,
        isbn: c.isbn.replace(/-/g, ''),
        author: Array.isArray(c.editors) && c.editors.length > 0 ? c.editors[0] : (c.author || 'BR Publications'),
        description: c.description || c.title,
        publishedYear: c.publishedDate || new Date(c.createdAt).getFullYear().toString(),
        publisher: 'BR ResNova Academic Press'
      }))
    ];

    const bookXML = allItems.map(item => `
    <Product>
      <RecordReference>${item.id}</RecordReference>
      <NotificationType>03</NotificationType>
      
      <ProductIdentifier>
        <ProductIDType>15</ProductIDType>
        <IDValue>${item.isbn}</IDValue>
      </ProductIdentifier>
      
      <DescriptiveDetail>
        <TitleDetail>
          <TitleType>01</TitleType>
          <TitleElement>
            <TitleElementLevel>01</TitleElementLevel>
            <TitleText>${escapeXml(item.title)}</TitleText>
          </TitleElement>
        </TitleDetail>
        
        <Contributor>
          <ContributorRole>A01</ContributorRole>
          <PersonName>${escapeXml(item.author)}</PersonName>
        </Contributor>
        
        <Language>
          <LanguageRole>01</LanguageRole>
          <LanguageCode>eng</LanguageCode>
        </Language>
      </DescriptiveDetail>
      
      <PublishingDetail>
        <Publisher>
          <PublishingRole>01</PublishingRole>
          <PublisherName>${escapeXml(item.publisher)}</PublisherName>
        </Publisher>
        <PublicationDate>
          <PublicationDateRole>01</PublicationDateRole>
          <Date>${item.publishedYear}</Date>
        </PublicationDate>
      </PublishingDetail>
      
      <CollateralDetail>
        <TextContent>
          <TextType>03</TextType>
          <ContentAudience>00</ContentAudience>
          <Text>${escapeXml(item.description)}</Text>
        </TextContent>
      </CollateralDetail>
    </Product>`).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ONIXMessage release="3.0" xmlns="http://ns.editeur.org/onix/3.0/reference">
  <Header>
    <Sender>
      <SenderName>BR Publications</SenderName>
      <ContactName>API Support</ContactName>
      <EmailAddress>support@brpublications.com</EmailAddress>
    </Sender>
    <SentDateTime>${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}</SentDateTime>
  </Header>
  ${bookXML}
</ONIXMessage>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);

  } catch (error) {
    console.error('ONIX feed generation error:', error);
    res.status(500).send('Error generating ONIX feed');
  }
});

export default router;
