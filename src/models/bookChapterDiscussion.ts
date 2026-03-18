import { DataTypes, Model, Optional } from 'sequelize';
import User from './user';
import BookChapterSubmission from './bookChapterSubmission';

interface BookChapterDiscussionAttributes {
    id: number;
    submissionId: number;
    userId: number;
    message: string;
    isInternal: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

interface BookChapterDiscussionCreationAttributes
    extends Optional<BookChapterDiscussionAttributes, 'id' | 'isInternal' | 'createdAt' | 'updatedAt'> { }

export class BookChapterDiscussion
    extends Model<BookChapterDiscussionAttributes, BookChapterDiscussionCreationAttributes>
    implements BookChapterDiscussionAttributes {
    public id!: number;
    public submissionId!: number;
    public userId!: number;
    public message!: string;
    public isInternal!: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    // Associations
    public readonly user?: User;
    public readonly submission?: BookChapterSubmission;

    static associate(models: any) {
        BookChapterDiscussion.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user',
        });
        BookChapterDiscussion.belongsTo(models.BookChapterSubmission, {
            foreignKey: 'submissionId',
            as: 'submission',
        });
    }

    static initialize(sequelize: any) {
        BookChapterDiscussion.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                submissionId: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'book_chapter_submissions',
                        key: 'id',
                    },
                },
                userId: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'users',
                        key: 'id',
                    },
                },
                message: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                isInternal: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: false,
                    comment: 'If true, only visible to editors/admins',
                },
            },
            {
                sequelize,
                tableName: 'book_chapter_discussions',
                timestamps: true,
                indexes: [
                    {
                        fields: ['submissionId'],
                    },
                ],
            }
        );

        return BookChapterDiscussion;
    }
}

export default BookChapterDiscussion;
