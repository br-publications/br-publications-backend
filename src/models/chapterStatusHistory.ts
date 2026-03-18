import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { ChapterStatus } from './individualChapter';

interface ChapterStatusHistoryAttributes {
    id: number;
    chapterId: number;
    previousStatus: ChapterStatus | null;
    newStatus: ChapterStatus;
    changedBy: number;
    action: string;
    notes: string | null;
    metadata: any;
    timestamp: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

interface ChapterStatusHistoryCreationAttributes extends Optional<
    ChapterStatusHistoryAttributes,
    | 'id'
    | 'previousStatus'
    | 'notes'
    | 'metadata'
    | 'timestamp'
> { }

class ChapterStatusHistory extends Model<
    ChapterStatusHistoryAttributes,
    ChapterStatusHistoryCreationAttributes
> implements ChapterStatusHistoryAttributes {
    public id!: number;
    public chapterId!: number;
    public previousStatus!: ChapterStatus | null;
    public newStatus!: ChapterStatus;
    public changedBy!: number;
    public action!: string;
    public notes!: string | null;
    public metadata!: any;
    public timestamp!: Date;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    // Helper method to get formatted action description
    public getActionDescription(): string {
        const statusDescriptions: { [key: string]: string } = {
            [ChapterStatus.ABSTRACT_SUBMITTED]: 'Abstract submitted',
            [ChapterStatus.MANUSCRIPTS_PENDING]: 'Manuscript upload pending',
            [ChapterStatus.REVIEWER_ASSIGNMENT]: 'Awaiting reviewer assignment',
            [ChapterStatus.UNDER_REVIEW]: 'Under review',
            [ChapterStatus.REVISION_REQUESTED]: 'Revision requested',
            [ChapterStatus.ADDITIONAL_REVISION_REQUESTED]: 'Additional revision requested',
            [ChapterStatus.REVISION_SUBMITTED]: 'Revision submitted',
            [ChapterStatus.EDITORIAL_REVIEW]: 'Editorial review',
            [ChapterStatus.CHAPTER_APPROVED]: 'Chapter approved',
            [ChapterStatus.CHAPTER_REJECTED]: 'Chapter rejected',
        };

        return statusDescriptions[this.newStatus] || this.action;
    }

    // Static method to initialize the model
    public static initModel(sequelize: any): typeof ChapterStatusHistory {
        ChapterStatusHistory.init(
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
                    onDelete: 'CASCADE',
                },
                previousStatus: {
                    type: DataTypes.ENUM(...Object.values(ChapterStatus)),
                    allowNull: true,
                    field: 'previous_status',
                },
                newStatus: {
                    type: DataTypes.ENUM(...Object.values(ChapterStatus)),
                    allowNull: false,
                    field: 'new_status',
                },
                changedBy: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    field: 'changed_by',
                    references: {
                        model: 'users',
                        key: 'id',
                    },
                },
                action: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                },
                notes: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                metadata: {
                    type: DataTypes.JSONB,
                    allowNull: true,
                },
                timestamp: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW,
                },
            },
            {
                sequelize,
                tableName: 'chapter_status_history',
                timestamps: true,
                underscored: true,
                hooks: {
                    beforeCreate: async (history: ChapterStatusHistory) => {
                        if (!history.timestamp) {
                            history.timestamp = new Date();
                        }
                    },
                },
            }
        );

        return ChapterStatusHistory;
    }

    // Static method to associate with other models
    public static associate(models: any) {
        ChapterStatusHistory.belongsTo(models.IndividualChapter, {
            foreignKey: 'chapterId',
            as: 'chapter',
        });

        ChapterStatusHistory.belongsTo(models.User, {
            foreignKey: 'changedBy',
            as: 'user',
        });
    }
}

export default ChapterStatusHistory;
