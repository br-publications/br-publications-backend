import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import type BookChapterSubmission from './bookChapterSubmission';
import type BookChapterFile from './bookChapterFile';

// Enum for chapter status — NEW 10-status flow
export enum ChapterStatus {
    ABSTRACT_SUBMITTED = 'ABSTRACT_SUBMITTED',
    MANUSCRIPTS_PENDING = 'MANUSCRIPTS_PENDING',
    REVIEWER_ASSIGNMENT = 'REVIEWER_ASSIGNMENT',
    UNDER_REVIEW = 'UNDER_REVIEW',
    REVISION_REQUESTED = 'REVISION_REQUESTED',
    ADDITIONAL_REVISION_REQUESTED = 'ADDITIONAL_REVISION_REQUESTED',
    REVISION_SUBMITTED = 'REVISION_SUBMITTED',
    EDITORIAL_REVIEW = 'EDITORIAL_REVIEW',
    CHAPTER_APPROVED = 'CHAPTER_APPROVED',
    CHAPTER_REJECTED = 'CHAPTER_REJECTED',
}

interface IndividualChapterAttributes {
    id: number;
    submissionId: number;
    chapterTitle: string;
    chapterNumber: number;
    status: ChapterStatus;
    assignedReviewers: number[] | null;
    reviewDeadline: Date | null;
    manuscriptFileId: number | null;
    editorDecision: 'APPROVED' | 'REJECTED' | null;
    editorDecisionDate: Date | null;
    editorDecisionNotes: string | null;
    revisionCount: number;
    currentRevisionNumber: number;
    createdAt?: Date;
    updatedAt?: Date;
}

interface IndividualChapterCreationAttributes extends Optional<
    IndividualChapterAttributes,
    | 'id'
    | 'status'
    | 'assignedReviewers'
    | 'reviewDeadline'
    | 'manuscriptFileId'
    | 'editorDecision'
    | 'editorDecisionDate'
    | 'editorDecisionNotes'
    | 'revisionCount'
    | 'currentRevisionNumber'
> { }

class IndividualChapter extends Model<
    IndividualChapterAttributes,
    IndividualChapterCreationAttributes
> implements IndividualChapterAttributes {
    public id!: number;
    public submissionId!: number;
    public chapterTitle!: string;
    public chapterNumber!: number;
    public status!: ChapterStatus;
    public assignedReviewers!: number[] | null;
    public reviewDeadline!: Date | null;
    public manuscriptFileId!: number | null;
    public editorDecision!: 'APPROVED' | 'REJECTED' | null;
    public editorDecisionDate!: Date | null;
    public editorDecisionNotes!: string | null;
    public revisionCount!: number;
    public currentRevisionNumber!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public readonly submission?: BookChapterSubmission;
    public readonly manuscriptFile?: BookChapterFile;

    // Helper method to check if reviewers can be assigned
    public canAssignReviewers(): boolean {
        return this.status === ChapterStatus.REVIEWER_ASSIGNMENT ||
            this.status === ChapterStatus.UNDER_REVIEW ||
            this.status === ChapterStatus.REVISION_SUBMITTED ||
            this.status === ChapterStatus.EDITORIAL_REVIEW;
    }

    // Helper method to check if manuscript can be uploaded
    public canUploadManuscript(): boolean {
        return this.status === ChapterStatus.MANUSCRIPTS_PENDING ||
            this.status === ChapterStatus.REVISION_REQUESTED ||
            this.status === ChapterStatus.ADDITIONAL_REVISION_REQUESTED;
    }

    // Helper method to check if chapter is completed
    public isCompleted(): boolean {
        return [
            ChapterStatus.CHAPTER_APPROVED,
            ChapterStatus.CHAPTER_REJECTED,
        ].includes(this.status);
    }

    // Helper method to check if chapter is approved
    public isApproved(): boolean {
        return this.status === ChapterStatus.CHAPTER_APPROVED;
    }

    // Helper method to check if chapter is rejected
    public isRejected(): boolean {
        return this.status === ChapterStatus.CHAPTER_REJECTED;
    }

    // Helper method to check if can request revision
    public canRequestRevision(): boolean {
        const validStatuses = [
            ChapterStatus.REVIEWER_ASSIGNMENT,     // reviewer just accepted, chapter may not yet be UNDER_REVIEW
            ChapterStatus.UNDER_REVIEW,
            ChapterStatus.REVISION_REQUESTED,      // second reviewer can add to the same revision round
            ChapterStatus.ADDITIONAL_REVISION_REQUESTED,
            ChapterStatus.REVISION_SUBMITTED,
            ChapterStatus.EDITORIAL_REVIEW,
        ];
        // Limit to 3 revisions
        return this.revisionCount < 3 && validStatuses.includes(this.status);
    }

    // Helper method to get revision status
    public getRevisionStatus(): string {
        return `${this.revisionCount}/3`;
    }

    // Helper method to calculate days until deadline
    public getDaysUntilDeadline(): number | null {
        if (!this.reviewDeadline) return null;

        const now = new Date();
        const diff = this.reviewDeadline.getTime() - now.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }

    // Helper method to check if deadline is passed
    public isDeadlinePassed(): boolean {
        if (!this.reviewDeadline) return false;

        const now = new Date();
        return now > this.reviewDeadline;
    }

    // Static method to initialize the model
    public static initModel(sequelize: any): typeof IndividualChapter {
        IndividualChapter.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                submissionId: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    field: 'submission_id',
                    references: {
                        model: 'book_chapter_submissions',
                        key: 'id',
                    },
                    onDelete: 'CASCADE',
                },
                chapterTitle: {
                    type: DataTypes.STRING(500),
                    allowNull: false,
                    field: 'chapter_title',
                },
                chapterNumber: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    field: 'chapter_number',
                },
                status: {
                    type: DataTypes.ENUM(...Object.values(ChapterStatus)),
                    allowNull: false,
                    defaultValue: ChapterStatus.ABSTRACT_SUBMITTED,
                },
                assignedReviewers: {
                    type: DataTypes.JSON,
                    allowNull: true,
                    field: 'assigned_reviewers',
                },
                reviewDeadline: {
                    type: DataTypes.DATE,
                    allowNull: true,
                    field: 'review_deadline',
                },
                manuscriptFileId: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    field: 'manuscript_file_id',
                    references: {
                        model: 'book_chapter_files',
                        key: 'id',
                    },
                },
                editorDecision: {
                    type: DataTypes.ENUM('APPROVED', 'REJECTED'),
                    allowNull: true,
                    field: 'editor_decision',
                },
                editorDecisionDate: {
                    type: DataTypes.DATE,
                    allowNull: true,
                    field: 'editor_decision_date',
                },
                editorDecisionNotes: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                    field: 'editor_decision_notes',
                },
                revisionCount: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    defaultValue: 0,
                    field: 'revision_count',
                },
                currentRevisionNumber: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    defaultValue: 0,
                    field: 'current_revision_number',
                },
            },
            {
                sequelize,
                tableName: 'individual_chapters',
                timestamps: true,
                underscored: true,
            }
        );

        return IndividualChapter;
    }

    // Static method to associate with other models
    public static associate(models: any) {
        IndividualChapter.belongsTo(models.BookChapterSubmission, {
            foreignKey: 'submissionId',
            as: 'submission',
        });

        IndividualChapter.belongsTo(models.BookChapterFile, {
            foreignKey: 'manuscriptFileId',
            as: 'manuscriptFile',
        });

        IndividualChapter.hasMany(models.ChapterReviewerAssignment, {
            foreignKey: 'chapterId',
            as: 'reviewerAssignments',
        });

        IndividualChapter.hasMany(models.ChapterRevision, {
            foreignKey: 'chapterId',
            as: 'revisions',
        });

        IndividualChapter.hasMany(models.ChapterStatusHistory, {
            foreignKey: 'chapterId',
            as: 'statusHistory',
        });

        IndividualChapter.hasMany(models.ChapterDiscussion, {
            foreignKey: 'chapterId',
            as: 'discussions',
        });
    }
}

export default IndividualChapter;
