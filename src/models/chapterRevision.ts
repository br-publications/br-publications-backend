import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ChapterRevisionAttributes {
    id: number;
    chapterId: number;
    revisionNumber: number;
    requestedBy: number;
    requestedDate: Date;
    submittedDate: Date | null;
    fileId: number | null;
    reviewerComments: string | null;
    authorResponse: string | null;
    status: 'PENDING' | 'SUBMITTED' | 'APPROVED';
    createdAt?: Date;
    updatedAt?: Date;
}

interface ChapterRevisionCreationAttributes extends Optional<
    ChapterRevisionAttributes,
    | 'id'
    | 'submittedDate'
    | 'fileId'
    | 'reviewerComments'
    | 'authorResponse'
    | 'status'
> { }

class ChapterRevision extends Model<
    ChapterRevisionAttributes,
    ChapterRevisionCreationAttributes
> implements ChapterRevisionAttributes {
    public id!: number;
    public chapterId!: number;
    public revisionNumber!: number;
    public requestedBy!: number;
    public requestedDate!: Date;
    public submittedDate!: Date | null;
    public fileId!: number | null;
    public reviewerComments!: string | null;
    public authorResponse!: string | null;
    public status!: 'PENDING' | 'SUBMITTED' | 'APPROVED';

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    // Helper method to check if pending
    public isPending(): boolean {
        return this.status === 'PENDING';
    }

    // Helper method to check if submitted
    public isSubmitted(): boolean {
        return this.status === 'SUBMITTED';
    }

    // Helper method to check if approved
    public isApproved(): boolean {
        return this.status === 'APPROVED';
    }

    // Helper method to submit revision
    public async submit(fileId: number, authorResponse?: string): Promise<void> {
        this.status = 'SUBMITTED';
        this.submittedDate = new Date();
        this.fileId = fileId;
        this.authorResponse = authorResponse || null;
        await this.save();
    }

    // Helper method to approve revision
    public async approve(): Promise<void> {
        this.status = 'APPROVED';
        await this.save();
    }

    // Helper method to calculate days since request
    public getDaysSinceRequest(): number {
        const now = new Date();
        const diff = now.getTime() - this.requestedDate.getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    }

    // Static method to initialize the model
    public static initModel(sequelize: any): typeof ChapterRevision {
        ChapterRevision.init(
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
                revisionNumber: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    field: 'revision_number',
                },
                requestedBy: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    field: 'requested_by',
                    references: {
                        model: 'users',
                        key: 'id',
                    },
                },
                requestedDate: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    field: 'requested_date',
                    defaultValue: DataTypes.NOW,
                },
                submittedDate: {
                    type: DataTypes.DATE,
                    allowNull: true,
                    field: 'submitted_date',
                },
                fileId: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    field: 'file_id',
                    references: {
                        model: 'book_chapter_files',
                        key: 'id',
                    },
                },
                reviewerComments: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                    field: 'reviewer_comments',
                },
                authorResponse: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                    field: 'author_response',
                },
                status: {
                    type: DataTypes.ENUM('PENDING', 'SUBMITTED', 'APPROVED'),
                    allowNull: false,
                    defaultValue: 'PENDING',
                },
            },
            {
                sequelize,
                tableName: 'chapter_revisions',
                timestamps: true,
                underscored: true,
            }
        );

        return ChapterRevision;
    }

    // Static method to associate with other models
    public static associate(models: any) {
        ChapterRevision.belongsTo(models.IndividualChapter, {
            foreignKey: 'chapterId',
            as: 'chapter',
        });

        ChapterRevision.belongsTo(models.User, {
            foreignKey: 'requestedBy',
            as: 'requester',
        });

        ChapterRevision.belongsTo(models.BookChapterFile, {
            foreignKey: 'fileId',
            as: 'file',
        });
    }
}

export default ChapterRevision;
