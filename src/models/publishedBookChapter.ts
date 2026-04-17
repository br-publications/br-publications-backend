import { DataTypes, Model } from 'sequelize';

// ============================================================
// Interfaces & Types
// ============================================================

export interface TocChapter {
    title: string;
    chapterNumber?: string;
    authors?: string;
    pagesFrom?: string;
    pagesTo?: string;
    abstract?: string;
    priceSoftCopy?: number;
    priceHardCopy?: number;
    priceCombined?: number;
    /** Disk-based file key from the pre-upload endpoint (preferred) */
    pdfKey?: string;
    /** Legacy: base64-encoded PDF binary (kept for backward compat) */
    pdfData?: string;
    pdfMimeType?: string;  // e.g. "application/pdf"
    pdfName?: string;      // original file name (for display)
}


export interface AuthorBiography {
    authorName: string;
    affiliation: string;
    email?: string;
    biography: string;
}

export interface PublishedBookChapterAttributes {
    id: number;
    // Link back to the original submission
    bookChapterSubmissionId: number | null;

    // Author info
    author: string;
    mainAuthor: any | null;   // Structured author object
    coAuthors: string | null; // comma-separated list
    coAuthorsData: any[] | null; // Array of structured author objects

    // Book metadata
    title: string;
    editors: string[] | null;
    primaryEditor: string | null;
    category: string;
    description: string; // abstract / short description
    isbn: string;
    publishedDate: string; // "2024" (year only)
    pages: number;
    keywords: string[] | null;
    indexedIn: string | null; // "Scopus, Google Scholar, DBLP"
    releaseDate: string | null;
    copyright: string | null;
    doi: string | null;

    // Cover image stored as base64 data URL
    coverImage: string | null;

    // Rich content (JSONB)
    synopsis: Record<string, string> | null;  // { paragraph_1: "...", paragraph_2: "..." }
    scope: Record<string, string> | null;      // { intro: "...", item_1: "...", ... }
    tableContents: TocChapter[] | null;        // array of chapter objects
    authorBiographies: AuthorBiography[] | null;
    archives: Record<string, string> | null;   // { paragraph_1: "...", ... }
    pricing: Record<string, number> | null;
    googleLink: string | null;
    flipkartLink: string | null;
    amazonLink: string | null;
    frontmatterPdfs: Record<string, { data?: string; mimeType?: string; name?: string; }> | null;
    editorBiographies: AuthorBiography[] | null;

    // Display flags
    isHidden: boolean;
    isFeatured: boolean;

    createdAt?: Date;
    updatedAt?: Date;
}

interface PublishedBookChapterCreationAttributes
    extends Omit<PublishedBookChapterAttributes, 'id' | 'createdAt' | 'updatedAt'> { }

// ============================================================
// Model
// ============================================================

class PublishedBookChapter
    extends Model<PublishedBookChapterAttributes, PublishedBookChapterCreationAttributes>
    implements PublishedBookChapterAttributes {
    public id!: number;
    public bookChapterSubmissionId!: number | null;
    public author!: string;
    public mainAuthor!: any | null;
    public coAuthors!: string | null;
    public coAuthorsData!: any[] | null;
    public title!: string;
    public editors!: string[] | null;
    public primaryEditor!: string | null;
    public category!: string;
    public description!: string;
    public isbn!: string;
    public publishedDate!: string;
    public pages!: number;
    public keywords!: string[] | null;
    public indexedIn!: string | null;
    public releaseDate!: string | null;
    public copyright!: string | null;
    public doi!: string | null;
    public coverImage!: string | null;
    public synopsis!: Record<string, string> | null;
    public scope!: Record<string, string> | null;
    public tableContents!: TocChapter[] | null;
    public authorBiographies!: AuthorBiography[] | null;
    public archives!: Record<string, string> | null;
    public pricing!: Record<string, number> | null;
    public googleLink!: string | null;
    public flipkartLink!: string | null;
    public amazonLink!: string | null;
    public frontmatterPdfs!: Record<string, { data?: string; mimeType?: string; name?: string; }> | null;
    public editorBiographies!: AuthorBiography[] | null;
    public isHidden!: boolean;
    public isFeatured!: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static initialize(sequelize: any) {
        PublishedBookChapter.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                bookChapterSubmissionId: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    references: {
                        model: 'book_chapter_submissions',
                        key: 'id',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'SET NULL',
                },
                author: {
                    type: DataTypes.STRING(500),
                    allowNull: true,
                },
                mainAuthor: {
                    type: DataTypes.JSON,
                    allowNull: true,
                },
                coAuthors: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                coAuthorsData: {
                    type: DataTypes.JSON,
                    allowNull: true,
                },
                title: {
                    type: DataTypes.STRING(500),
                    allowNull: false,
                },
                editors: {
                    type: DataTypes.JSON,
                    allowNull: true,
                },
                primaryEditor: {
                    type: DataTypes.STRING(200),
                    allowNull: true,
                },
                category: {
                    type: DataTypes.STRING(200),
                    allowNull: false,
                    defaultValue: 'General',
                },
                description: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                isbn: {
                    type: DataTypes.STRING(50),
                    allowNull: false,
                },
                publishedDate: {
                    type: DataTypes.STRING(50),
                    allowNull: true,
                },
                pages: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    defaultValue: 0,
                },
                keywords: {
                    type: DataTypes.JSON,
                    allowNull: true,
                    defaultValue: null,
                },
                indexedIn: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                releaseDate: {
                    type: DataTypes.STRING(50),
                    allowNull: true,
                },
                copyright: {
                    type: DataTypes.STRING(200),
                    allowNull: true,
                },
                doi: {
                    type: DataTypes.STRING(200),
                    allowNull: true,
                },
                coverImage: {
                    type: DataTypes.TEXT('long'), // base64 data URL
                    allowNull: true,
                },
                synopsis: {
                    type: DataTypes.JSON,
                    allowNull: true,
                    defaultValue: null,
                },
                scope: {
                    type: DataTypes.JSON,
                    allowNull: true,
                    defaultValue: null,
                },
                tableContents: {
                    type: DataTypes.JSON,
                    allowNull: true,
                    defaultValue: null,
                },
                authorBiographies: {
                    type: DataTypes.JSON,
                    allowNull: true,
                    defaultValue: null,
                },
                archives: {
                    type: DataTypes.JSON,
                    allowNull: true,
                    defaultValue: null,
                },
                pricing: {
                    type: DataTypes.JSON,
                    allowNull: true,
                    defaultValue: null,
                },
                googleLink: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                flipkartLink: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                amazonLink: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                frontmatterPdfs: {
                    type: DataTypes.JSON,
                    allowNull: true,
                    defaultValue: null,
                },
                editorBiographies: {
                    type: DataTypes.JSON,
                    allowNull: true,
                    defaultValue: null,
                },
                isHidden: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
                },
                isFeatured: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
                },
            },
            {
                sequelize,
                tableName: 'published_book_chapters',
                timestamps: true,
                underscored: true,
            }
        );

        return PublishedBookChapter;
    }

    static associate(models: any) {
        if (models.BookChapterSubmission) {
            PublishedBookChapter.belongsTo(models.BookChapterSubmission, {
                foreignKey: 'bookChapterSubmissionId',
                as: 'submission',
            });
        }
        if (models.PublishedIndividualChapter) {
            PublishedBookChapter.hasMany(models.PublishedIndividualChapter, {
                foreignKey: 'publishedBookChapterId',
                as: 'chapters',
            });
        }
        if (models.PublishedEditor) {
            PublishedBookChapter.belongsToMany(models.PublishedEditor, {
                through: 'published_book_editors',
                foreignKey: 'published_book_chapter_id',
                otherKey: 'published_editor_id',
                as: 'biographyEditors',
                timestamps: true
            });
        }
    }
}

export default PublishedBookChapter;
