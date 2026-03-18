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
    authorBiographies: Record<string, { authorName: string; biography: string }> | null;
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
    public authorBiographies!: Record<string, { authorName: string; biography: string }> | null;
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
                    references: {
                        model: 'book_chapter_submissions',
                        key: 'id',
                    },
                },
                textBookSubmissionId: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    references: {
                        model: 'text_book_submissions',
                        key: 'id',
                    },
                },
                bookType: {
                    type: DataTypes.ENUM('CHAPTER', 'TEXTBOOK'),
                    allowNull: false,
                    defaultValue: 'CHAPTER'
                },
                title: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                },
                author: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                },
                coAuthors: {
                    type: DataTypes.STRING(1000), // Comma separated
                    allowNull: true,
                },
                coverImage: {
                    type: DataTypes.STRING(255),
                    allowNull: true,
                },
                category: {
                    type: DataTypes.STRING(100),
                    allowNull: false,
                },
                description: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                isbn: {
                    type: DataTypes.STRING(50),
                    allowNull: false,
                },
                publishedDate: {
                    type: DataTypes.STRING(10), // Year "2024"
                    allowNull: false,
                },
                pages: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                indexedIn: {
                    type: DataTypes.STRING(255),
                    allowNull: true,
                },
                releaseDate: {
                    type: DataTypes.STRING(20),
                    allowNull: true,
                },
                copyright: {
                    type: DataTypes.STRING(100),
                    allowNull: true,
                },
                doi: {
                    type: DataTypes.STRING(100),
                    allowNull: true,
                },
                synopsis: {
                    type: DataTypes.JSONB,
                    allowNull: true,
                },
                scope: {
                    type: DataTypes.JSONB,
                    allowNull: true,
                },
                tableContents: {
                    type: DataTypes.JSONB,
                    allowNull: true,
                },
                authorBiographies: {
                    type: DataTypes.JSONB,
                    allowNull: true,
                },
                archives: {
                    type: DataTypes.JSONB,
                    allowNull: true,
                },
                pricing: {
                    type: DataTypes.JSONB,
                    allowNull: true, // "softCopyPrice, hardCopyPrice, bundlePrice"
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
                    defaultValue: false
                },
                isFeatured: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: false
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

