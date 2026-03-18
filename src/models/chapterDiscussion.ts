import { DataTypes, Model, Optional } from 'sequelize';
import User from './user';
import IndividualChapter from './individualChapter';

interface ChapterDiscussionAttributes {
    id: number;
    chapterId: number;
    userId: number;
    message: string;
    isInternal: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

interface ChapterDiscussionCreationAttributes
    extends Optional<ChapterDiscussionAttributes, 'id' | 'isInternal' | 'createdAt' | 'updatedAt'> { }

export class ChapterDiscussion
    extends Model<ChapterDiscussionAttributes, ChapterDiscussionCreationAttributes>
    implements ChapterDiscussionAttributes {
    public id!: number;
    public chapterId!: number;
    public userId!: number;
    public message!: string;
    public isInternal!: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    // Associations
    public readonly user?: User;
    public readonly chapter?: IndividualChapter;

    static associate(models: any) {
        ChapterDiscussion.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user',
        });
        ChapterDiscussion.belongsTo(models.IndividualChapter, {
            foreignKey: 'chapterId',
            as: 'chapter',
        });
    }

    static initialize(sequelize: any) {
        ChapterDiscussion.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                chapterId: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    field: 'chapter_id',
                    references: {
                        model: 'individual_chapters',
                        key: 'id',
                    },
                },
                userId: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    field: 'user_id',
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
                    field: 'is_internal',
                    comment: 'If true, only visible to editors/reviewers/admins',
                },
            },
            {
                sequelize,
                tableName: 'chapter_discussions',
                timestamps: true,
                underscored: true,
                indexes: [
                    {
                        fields: ['chapter_id'],
                    },
                    {
                        fields: ['user_id'],
                    },
                ],
            }
        );

        return ChapterDiscussion;
    }
}

export default ChapterDiscussion;
