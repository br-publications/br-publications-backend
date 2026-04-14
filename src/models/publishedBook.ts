import { DataTypes, Model } from 'sequelize';
import TextBookSubmission from './textBookSubmission';

export enum BookType {
    CHAPTER = 'CHAPTER',
    TEXTBOOK = 'TEXTBOOK'
}

export interface PublishedBookAttributes {
    id: number;
    submissionId: number | null; // Optional link to book chapter submission
    textBookSubmissionId: number | null; // Optional link to text book submission
    bookType: BookType;
    title: string;
    author: string;
    coAuthors: string | null;
    coverImage: string | null;
    category: string;
    description: string;
    isbn: string;
    publishedDate: string; // "2024"
    pages: number;
    indexedIn: string | null;
    releaseDate: string | null; // "DD/MM/YYYY" or ISO
    copyright: string | null;
    doi: string | null;
    // Chapter specific fields (can be null for textbooks)
    synopsis: Record<string, string> | null;
    scope: Record<string, string> | null;
    tableContents: Record<string, string> | null;
    authorBiographies: Record<string, { authorName: string; affiliation: string; email?: string; biography: string }> | null;
    archives: Record<string, string> | null;
    pricing: Record<string, number> | null;
    googleLink: string | null;
    flipkartLink: string | null;
    amazonLink: string | null;
    isHidden: boolean;
    isFeatured: boolean;

    createdAt?: Date;
    updatedAt?: Date;
}

interface PublishedBookCreationAttributes extends Omit<PublishedBookAttributes, 'id' | 'createdAt' | 'updatedAt'> { }

class PublishedBook extends Model<PublishedBookAttributes, PublishedBookCreationAttributes> implements PublishedBookAttributes {
    public id!: number;
    public submissionId!: number | null;
    public textBookSubmissionId!: number | null;
    public bookType!: BookType;
    public title!: string;
    public author!: string;
    public coAuthors!: string | null;
    public coverImage!: string | null;
    public category!: string;
    public description!: string;
    public isbn!: string;
    public publishedDate!: string;
    public pages!: number;
    public indexedIn!: string | null;
    public releaseDate!: string | null;
    public copyright!: string | null;
    public doi!: string | null;
    public synopsis!: Record<string, string> | null;
    public scope!: Record<string, string> | null;
    public tableContents!: Record<string, string> | null;
    public authorBiographies!: Record<string, { authorName: string; affiliation: string; email?: string; biography: string }> | null;
    public archives!: Record<string, string> | null;
    public pricing!: Record<string, number> | null;
    public googleLink!: string | null;
    public flipkartLink!: string | null;
    public amazonLink!: string | null;
    public isHidden!: boolean;
    public isFeatured!: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static initialize(sequelize: any) {
        PublishedBook.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                submissionId: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    field: 'submission_id',
                    references: {
                        model: 'book_chapter_submissions',
                        key: 'id',
                    },
                },
                textBookSubmissionId: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    // Note: this column was added as camelCase in migration 20260213060747
                    references: {
                        model: 'text_book_submissions',
                        key: 'id',
                    },
                },
                bookType: {
                    type: DataTypes.ENUM('CHAPTER', 'TEXTBOOK'),
                    allowNull: false,
                    defaultValue: 'CHAPTER'
                    // Note: this column was added as camelCase in migration 20260213060747
                },
                title: {
                    type: DataTypes.STRING(500),
                    allowNull: false,
                },
                author: {
                    type: DataTypes.STRING(500),
                    allowNull: false,
                },
                coAuthors: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                    field: 'co_authors',
                },
                coverImage: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                    field: 'cover_image',
                },
                category: {
                    type: DataTypes.STRING(200),
                    allowNull: false,
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
                    type: DataTypes.STRING(10),
                    allowNull: false,
                    field: 'published_date',
                },
                pages: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                indexedIn: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                    field: 'indexed_in',
                },
                releaseDate: {
                    type: DataTypes.STRING(20),
                    allowNull: true,
                    field: 'release_date',
                },
                copyright: {
                    type: DataTypes.STRING(100),
                    allowNull: true,
                },
                doi: {
                    type: DataTypes.STRING(200),
                    allowNull: true,
                },
                synopsis: {
                    type: DataTypes.JSON,
                    allowNull: true,
                },
                scope: {
                    type: DataTypes.JSON,
                    allowNull: true,
                },
                tableContents: {
                    type: DataTypes.JSON,
                    allowNull: true,
                    field: 'table_contents',
                },
                authorBiographies: {
                    type: DataTypes.JSON,
                    allowNull: true,
                    field: 'author_biographies',
                },
                archives: {
                    type: DataTypes.JSON,
                    allowNull: true,
                },
                pricing: {
                    type: DataTypes.JSON,
                    allowNull: true,
                },
                googleLink: {
                    type: DataTypes.STRING(500),
                    allowNull: true,
                },
                flipkartLink: {
                    type: DataTypes.STRING(500),
                    allowNull: true,
                },
                amazonLink: {
                    type: DataTypes.STRING(500),
                    allowNull: true,
                },
                isHidden: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
                    field: 'is_hidden',
                },
                isFeatured: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
                    field: 'is_featured',
                },
                createdAt: {
                    type: DataTypes.DATE,
                    field: 'created_at',
                },
                updatedAt: {
                    type: DataTypes.DATE,
                    field: 'updated_at',
                }
            },
            {
                sequelize,
                tableName: 'published_books',
                timestamps: true,
            }
        );

        return PublishedBook;
    }

    static associate(models: any) {
        PublishedBook.belongsTo(models.BookChapterSubmission, {
            foreignKey: 'submissionId',
            as: 'submission',
        });

        PublishedBook.belongsTo(models.TextBookSubmission, {
            foreignKey: 'textBookSubmissionId',
            as: 'textBookSubmission'
        });
    }
}

export default PublishedBook;

