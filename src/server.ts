import dotenv from 'dotenv';
dotenv.config();
console.log('🚀 Server starting...');

import express, { Application, Request, Response } from 'express';
import path from 'path';
import cors from 'cors';
import { Sequelize } from 'sequelize';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { startTokenCleanup } from './utils/cleanupTokens';
import { startMonthlyReportScheduler } from './utils/monthlyReportScheduler';
import { seedSuperAdmin } from './utils/superAdminSeeder';
// import sequelize from './config/database';

const app: Application = express();
const PORT = process.env.PORT || 5000;

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
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BR Publications API',
      version: '1.0.0',
      description: 'API documentation for BR Publications with Authentication',
      contact: {
        name: 'API Support',
        email: 'support@brpublications.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token in format: Bearer <token>',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/server.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Debug logging middleware
app.use((req, res, next) => {
  next();
});

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check server health
 *     description: Returns the health status of the server
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is running
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

/**
 * @swagger
 * /health/db:
 *   get:
 *     summary: Check database health
 *     description: Returns the health status of the database connection
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Database connection is healthy
 *       500:
 *         description: Database connection failed
 */
app.get('/health/db', async (req: Request, res: Response) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'ok', message: 'Database connection is healthy' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Database connection failed' });
  }
});

// Database connection and server start
const startServer = async () => {
  try {
    await sequelize.authenticate();


    // Initialize models
    const User = (await import('./models/user')).default;
    const TokenBlacklist = (await import('./models/tokenBlacklist')).default;
    const BookChapterSubmission = (await import('./models/bookChapterSubmission')).default;
    const PublishedBook = (await import('./models/publishedBook')).default;
    const BookChapterFile = (await import('./models/bookChapterFile')).default;
    const BookChapterReviewerAssignment = (await import('./models/bookChapterReviewerAssignment')).default;
    const BookChapterStatusHistory = (await import('./models/bookChapterStatusHistory')).default;
    const BookChapterDiscussion = (await import('./models/bookChapterDiscussion')).default;
    const Notification = (await import('./models/notification')).default;
    const BookTitle = (await import('./models/bookTitle')).default;
    const BookChapter = (await import('./models/bookChapter')).default;
    const BookEditor = (await import('./models/bookEditor')).default;

    // New chapter-centric models
    const IndividualChapter = (await import('./models/individualChapter')).default;
    const ChapterReviewerAssignment = (await import('./models/chapterReviewerAssignment')).default;
    const ChapterRevision = (await import('./models/chapterRevision')).default;
    const ChapterStatusHistory = (await import('./models/chapterStatusHistory')).default;
    const ChapterDiscussion = (await import('./models/chapterDiscussion')).default;
    const CommunicationTemplate = (await import('./models/communicationTemplate')).default;

    // Book chapter publishing model (separate from textbook PublishedBook)
    const PublishedBookChapter = (await import('./models/publishedBookChapter')).default;

    // Text book models
    const TextBookSubmission = (await import('./models/textBookSubmission')).default;
    const TextBookFile = (await import('./models/textBookFile')).default;
    const TextBookRevision = (await import('./models/textBookRevision')).default;
    const TextBookStatusHistory = (await import('./models/textBookStatusHistory')).default;
    const TextBookDiscussion = (await import('./models/textBookDiscussion')).default;
    const ContactDetails = (await import('./models/contactDetails')).default;
    const RecruitmentSubmission = (await import('./models/recruitmentSubmission')).default;
    const ProjectInternshipSubmission = (await import('./models/projectInternshipSubmission')).default;
    const ContactInquiry = (await import('./models/contactInquiry')).default;

    // Custom role models
    const { Role, Permission, RolePermission, UserCustomRole } = await import('./models/customRole');

    // Delivery Address
    const DeliveryAddress = (await import('./models/deliveryAddress')).default;

    // Conference
    const Conference = (await import('./models/conference')).default;
    const ConferenceArticle = (await import('./models/conferenceArticle')).default;

    // 1. Collect all models
    const models = {
      User,
      TokenBlacklist,
      BookChapterSubmission,
      PublishedBook,
      BookChapterFile,
      BookChapterReviewerAssignment,
      BookChapterStatusHistory,
      BookChapterDiscussion,
      Notification,
      BookTitle,
      BookChapter,
      BookEditor,
      IndividualChapter,
      ChapterReviewerAssignment,
      ChapterRevision,
      ChapterStatusHistory,
      ChapterDiscussion,
      TextBookSubmission,
      TextBookFile,
      TextBookRevision,
      TextBookStatusHistory,
      TextBookDiscussion,
      ContactDetails,
      RecruitmentSubmission,
      ProjectInternshipSubmission,
      ContactInquiry,
      Role,
      Permission,
      RolePermission,
      UserCustomRole,
      CommunicationTemplate,
      PublishedBookChapter,
      DeliveryAddress,
      Conference,
      ConferenceArticle,
    };

    // 2. Initialize each model (handle both 'initialize' and 'initModel' methods)
    Object.values(models).forEach((model: any) => {
      if (typeof model.initialize === 'function') {
        model.initialize(sequelize);
      } else if (typeof model.initModel === 'function') {
        model.initModel(sequelize);
      }
    });

    // 3. Set up associations (Foreign Keys)
    Object.values(models).forEach((model: any) => {
      if (model.associate) model.associate(models);
    });



    // Sync models - DISABLED to prevent conflicts with migrations
    // We use migrations for schema changes instead of auto-sync
    // if (process.env.NODE_ENV === 'development') {
    //   await sequelize.sync({ alter: true });
    //   
    // }



    // Start token cleanup job
    startTokenCleanup();


    // Start monthly report scheduler
    startMonthlyReportScheduler();

    // Seed permanent Default Admin
    await seedSuperAdmin();

    // Import routes AFTER models are loaded
    const authRoutes = (await import('./routes/authRoutes')).default;
    const userRoutes = (await import('./routes/userRoutes')).default;
    const submissionRoutes = (await import('./routes/bookChapterSubmissionsRoutes')).default;
    const publishedBookRoutes = (await import('./routes/publishedBookRoutes')).default;
    const notificationRoutes = (await import('./routes/notificationRoutes')).default;
    const bookTitleRoutes = (await import('./routes/bookTitleRoutes')).default;
    const bookChapterRoutes = (await import('./routes/bookChapterRoutes')).default;
    const bookEditorRoutes = (await import('./routes/bookEditorRoutes')).default;
    const chapterRoutes = (await import('./routes/chapterRoutes')).default;
    const textBookRoutes = (await import('./routes/textBookRoutes')).default;
    const recruitmentRoutes = (await import('./routes/recruitmentSubmissionRoutes')).default;

    // API Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/book-chapters', submissionRoutes);
    app.use('/api/books', publishedBookRoutes);
    app.use('/api/notifications', notificationRoutes);
    app.use('/api/book-titles', bookTitleRoutes);
    app.use('/api/book-chapter-list', bookChapterRoutes);
    app.use('/api/book-editors', bookEditorRoutes);
    app.use('/api/chapters', chapterRoutes);
    app.use('/api/textbooks', textBookRoutes);
    app.use('/api/recruitment', recruitmentRoutes);

    // Book chapter publishing (new separate flow)
    const bookChapterPublishingRoutes = (await import('./controllers/bookChapterPublishing/bookChapterPublishingRoutes')).default;
    app.use('/api/book-chapter-publishing', bookChapterPublishingRoutes);

    // Contact routes
    const contactRoutes = (await import('./routes/contactRoutes')).default;
    app.use('/api/contact', contactRoutes);

    // Project & Internship routes
    const projectInternshipRoutes = (await import('./routes/projectInternshipRoutes')).default;
    app.use('/api/project-internship', projectInternshipRoutes);

    // Contact Inquiry routes (public submit + admin review/acknowledge)
    const contactInquiryRoutes = (await import('./routes/contactInquiryRoutes')).default;
    app.use('/api/contact-inquiry', contactInquiryRoutes);

    // Custom Roles routes
    const customRoleRoutes = (await import('./customRoles/routes/customRoleRoutes')).default;
    app.use('/api', customRoleRoutes);

    // Delivery Address
    const deliveryAddressRoutes = (await import('./routes/deliveryAddressRoutes')).default;
    app.use('/api/delivery-address', deliveryAddressRoutes);

    // Communication Templates (Admin email template management)
    const communicationTemplateRoutes = (await import('./routes/communicationTemplateRoutes')).default;
    app.use('/api/templates', communicationTemplateRoutes);

    // Stats & Analytics
    const statsRoutes = (await import('./routes/statsRoutes')).default;
    app.use('/api/stats', statsRoutes);

    // Conference
    const conferenceRoutes = (await import('./routes/conferenceRoutes')).default;
    app.use('/api/conferences', conferenceRoutes);



    // SEO Routes (sitemap.xml and robots.txt — must be at root, NOT under /api/)
    const sitemapRoutes = (await import('./routes/sitemapRoutes')).default;
    app.use('/', sitemapRoutes);

    // 404 Handler - Must be AFTER all routes
    app.use((req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        message: 'Route not found',
      });
    });

    // Global Error Handler
    app.use((err: any, req: Request, res: Response, next: any) => {
      console.error('Global error:', err);
      res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
      });
    });

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
};

startServer();

export default app;
