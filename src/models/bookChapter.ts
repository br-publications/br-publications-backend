import { DataTypes, Model, Optional } from 'sequelize';

interface BookChapterAttributes {
    id: number;
    bookTitleId: number;
    chapterTitle: string;
    chapterNumber: number | null;
    description: string | null;
    isActive: boolean;
    isPublished: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

interface BookChapterCreationAttributes extends Optional<
    BookChapterAttributes,
    'id' | 'chapterNumber' | 'description' | 'isActive' | 'isPublished'
> { }

class BookChapter extends Model<
    BookChapterAttributes,
    BookChapterCreationAttributes
> implements BookChapterAttributes {
    public id!: number;
    public bookTitleId!: number;
    public chapterTitle!: string;
    public chapterNumber!: number | null;
    public description!: string | null;
    public isActive!: boolean;
    public isPublished!: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    // Associations
    public readonly bookTitle?: any;

    // Instance method to get book title
    public async getBookTitleInfo(): Promise<any> {
        const BookTitle = require('./bookTitle').default;
        return await BookTitle.findByPk(this.bookTitleId);
    }

    // Instance method to check if chapter can be deleted
    public async canBeDeleted(): Promise<boolean> {
        const BookChapterSubmission = require('./bookChapterSubmission').default;
        const { Op } = require('sequelize');

        // Check if there are any submissions that include this chapter
        const submissions = await BookChapterSubmission.findAll({
            where: {
                bookChapterTitles: {
                    [Op.contains]: [this.chapterTitle],
                },
                status: {
                    [Op.notIn]: ['REJECTED', 'PUBLISHED'],
                },
            },
        });

        return submissions.length === 0;
    }

    // Static method to get next chapter number for a book
    static async getNextChapterNumber(bookTitleId: number): Promise<number> {
        const maxChapter = await BookChapter.findOne({
            where: { bookTitleId },
            order: [['chapterNumber', 'DESC']],
            attributes: ['chapterNumber'],
        });

        return maxChapter && maxChapter.chapterNumber
            ? maxChapter.chapterNumber + 1
            : 1;
    }

    // Static method to initialize the model
    static initialize(sequelize: any) {
        BookChapter.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                bookTitleId: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'book_titles',
                        key: 'id',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'RESTRICT',
                },
                chapterTitle: {
                    type: DataTypes.STRING(500),
                    allowNull: false,
                    validate: {
                        notEmpty: { msg: 'Chapter title is required' },
                        len: {
                            args: [3, 500],
                            msg: 'Chapter title must be between 3 and 500 characters',
                        },
                    },
                },
                chapterNumber: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    validate: {
                        min: {
                            args: [1],
                            msg: 'Chapter number must be at least 1',
                        },
                    },
                },
                description: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                isActive: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: true,
                    allowNull: false,
                },
                isPublished: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: false,
                    allowNull: false,
                },
            },
            {
                sequelize,
                tableName: 'book_chapters',
                timestamps: true,
                indexes: [
                    {
                        unique: true,
                        fields: ['bookTitleId', 'chapterTitle'],
                        name: 'unique_chapter_per_book',
                    },
                    {
                        fields: ['bookTitleId'],
                    },
                    {
                        fields: ['isActive'],
                    },
                    {
                        fields: ['chapterNumber'],
                    },
                ],
                hooks: {
                    beforeCreate: async (chapter: BookChapter) => {
                        // Auto-assign chapter number if not provided
                        if (!chapter.chapterNumber) {
                            chapter.chapterNumber = await BookChapter.getNextChapterNumber(
                                chapter.bookTitleId
                            );
                        }
                    },
                },
            }
        );

        return BookChapter;
    }

    // Define associations
    static associate(models: any) {
        // Belongs to book title
        BookChapter.belongsTo(models.BookTitle, {
            foreignKey: 'bookTitleId',
            as: 'bookTitle',
        });
    }
}

export default BookChapter;
