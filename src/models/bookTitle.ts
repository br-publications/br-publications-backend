import { DataTypes, Model, Optional } from 'sequelize';

interface BookTitleAttributes {
    id: number;
    title: string;
    description: string | null;
    isActive: boolean;
    createdBy: number;
    createdAt?: Date;
    updatedAt?: Date;
}

interface BookTitleCreationAttributes extends Optional<
    BookTitleAttributes,
    'id' | 'description' | 'isActive'
> { }

class BookTitle extends Model<
    BookTitleAttributes,
    BookTitleCreationAttributes
> implements BookTitleAttributes {
    public id!: number;
    public title!: string;
    public description!: string | null;
    public isActive!: boolean;
    public createdBy!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    // Associations
    public readonly chapters?: any[];
    public readonly editors?: any[];
    public readonly creator?: any;

    // Instance method to get active chapters
    public async getActiveChapters(): Promise<any[]> {
        const BookChapter = require('./bookChapter').default;
        return await BookChapter.findAll({
            where: {
                bookTitleId: this.id,
                isActive: true,
            },
            order: [['chapterNumber', 'ASC'], ['createdAt', 'ASC']],
        });
    }

    // Instance method to get assigned editors
    public async getAssignedEditors(): Promise<any[]> {
        const BookEditor = require('./bookEditor').default;
        const User = require('./user').default;

        const assignments = await BookEditor.findAll({
            where: { bookTitleId: this.id },
            include: [{
                model: User,
                as: 'editor',
                attributes: ['id', 'userId', 'fullName', 'email'],
            }],
        });

        return assignments.map((assignment: any) => assignment.editor);
    }

    // Instance method to check if book can be deleted
    public async canBeDeleted(): Promise<boolean> {
        const BookChapterSubmission = require('./bookChapterSubmission').default;

        // Check if there are any active submissions for this book
        const activeSubmissions = await BookChapterSubmission.count({
            where: {
                bookTitle: this.title,
                status: {
                    [require('sequelize').Op.notIn]: ['REJECTED', 'PUBLISHED'],
                },
            },
        });

        return activeSubmissions === 0;
    }

    // Instance method to get chapter count
    public async getChapterCount(): Promise<number> {
        const BookChapter = require('./bookChapter').default;
        return await BookChapter.count({
            where: {
                bookTitleId: this.id,
                isActive: true,
            },
        });
    }

    // Instance method to get editor count
    public async getEditorCount(): Promise<number> {
        const BookEditor = require('./bookEditor').default;
        return await BookEditor.count({
            where: { bookTitleId: this.id },
        });
    }

    // Static method to initialize the model
    static initialize(sequelize: any) {
        BookTitle.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                title: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                    unique: {
                        name: 'unique_book_title',
                        msg: 'Book title already exists',
                    },
                    validate: {
                        notEmpty: { msg: 'Book title is required' },
                        len: {
                            args: [3, 255],
                            msg: 'Book title must be between 3 and 255 characters',
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
                createdBy: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'users',
                        key: 'id',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'RESTRICT',
                },
            },
            {
                sequelize,
                tableName: 'book_titles',
                timestamps: true,
                indexes: [
                    {
                        unique: true,
                        fields: ['title'],
                    },
                    {
                        fields: ['isActive'],
                    },
                    {
                        fields: ['createdBy'],
                    },
                ],
            }
        );

        return BookTitle;
    }

    // Define associations
    static associate(models: any) {
        // Belongs to creator (User)
        BookTitle.belongsTo(models.User, {
            foreignKey: 'createdBy',
            as: 'creator',
        });

        // Has many chapters
        BookTitle.hasMany(models.BookChapter, {
            foreignKey: 'bookTitleId',
            as: 'chapters',
        });

        // Has many editor assignments
        BookTitle.hasMany(models.BookEditor, {
            foreignKey: 'bookTitleId',
            as: 'editorAssignments',
        });
    }
}

export default BookTitle;
