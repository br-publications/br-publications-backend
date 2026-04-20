import { DataTypes, Model, Optional } from 'sequelize';
import type User from './user';
import type BookChapterSubmission from './bookChapterSubmission';

export interface PublishingDraftAttributes {
    id: number;
    userId: number;
    submissionId: number | null;
    draftName: string | null;
    wizardType: string;
    payload: string; // Will store LONGTEXT
    createdAt?: Date;
    updatedAt?: Date;
}

export interface PublishingDraftCreationAttributes extends Optional<PublishingDraftAttributes, 'id' | 'submissionId' | 'draftName' | 'createdAt' | 'updatedAt'> { }

class PublishingDraft extends Model<PublishingDraftAttributes, PublishingDraftCreationAttributes> implements PublishingDraftAttributes {
    public id!: number;
    public userId!: number;
    public submissionId!: number | null;
    public draftName!: string | null;
    public wizardType!: string;
    public payload!: string;

    public readonly user?: User;
    public readonly submission?: BookChapterSubmission;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static initialize(sequelize: any) {
        PublishingDraft.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
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
                submissionId: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    field: 'submission_id',
                    references: {
                        model: 'book_chapter_submissions',
                        key: 'id',
                    },
                },
                draftName: {
                    type: DataTypes.STRING(255),
                    allowNull: true,
                    field: 'draft_name',
                },
                wizardType: {
                    type: DataTypes.STRING(50),
                    allowNull: false,
                    field: 'wizard_type',
                    defaultValue: 'PUBLISH_BOOK',
                },
                payload: {
                    type: DataTypes.TEXT('long'),
                    allowNull: false,
                },
            },
            {
                sequelize,
                tableName: 'publishing_drafts',
                timestamps: true,
                underscored: true,
            }
        );

        return PublishingDraft;
    }

    static associate(models: any) {
        PublishingDraft.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user',
        });
        PublishingDraft.belongsTo(models.BookChapterSubmission, {
            foreignKey: 'submissionId',
            as: 'submission',
        });
    }
}

export default PublishingDraft;
