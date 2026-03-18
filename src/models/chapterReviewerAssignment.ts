import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// Enum for reviewer assignment status
export enum ReviewerAssignmentStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
}

// Enum for reviewer recommendation
export enum ReviewerRecommendation {
    ACCEPT = 'ACCEPT',
    REJECT = 'REJECT',
    MAJOR_REVISION = 'MAJOR_REVISION',
    MINOR_REVISION = 'MINOR_REVISION',
}

interface ChapterReviewerAssignmentAttributes {
    id: number;
    chapterId: number;
    reviewerId: number;
    assignedBy: number;
    status: ReviewerAssignmentStatus;
    assignedDate: Date;
    acceptanceDate: Date | null;
    rejectionDate: Date | null;
    rejectionReason: string | null;
    completionDate: Date | null;
    recommendation: ReviewerRecommendation | null;
    comments: string | null;
    confidentialComments: string | null;
    deadline: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
}

interface ChapterReviewerAssignmentCreationAttributes extends Optional<
    ChapterReviewerAssignmentAttributes,
    | 'id'
    | 'status'
    | 'acceptanceDate'
    | 'rejectionDate'
    | 'rejectionReason'
    | 'completionDate'
    | 'recommendation'
    | 'comments'
    | 'confidentialComments'
    | 'deadline'
> { }

class ChapterReviewerAssignment extends Model<
    ChapterReviewerAssignmentAttributes,
    ChapterReviewerAssignmentCreationAttributes
> implements ChapterReviewerAssignmentAttributes {
    public id!: number;
    public chapterId!: number;
    public reviewerId!: number;
    public assignedBy!: number;
    public status!: ReviewerAssignmentStatus;
    public assignedDate!: Date;
    public acceptanceDate!: Date | null;
    public rejectionDate!: Date | null;
    public rejectionReason!: string | null;
    public completionDate!: Date | null;
    public recommendation!: ReviewerRecommendation | null;
    public comments!: string | null;
    public confidentialComments!: string | null;
    public deadline!: Date | null;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public chapter?: import('./individualChapter').default;

    // Helper method to accept assignment
    public async accept(): Promise<void> {
        this.status = ReviewerAssignmentStatus.ACCEPTED;
        this.acceptanceDate = new Date();
        await this.save();
    }

    // Helper method to reject assignment
    public async reject(reason: string): Promise<void> {
        this.status = ReviewerAssignmentStatus.REJECTED;
        this.rejectionDate = new Date();
        this.rejectionReason = reason;
        await this.save();
    }

    // Helper method to submit review
    public async submitReview(
        recommendation: ReviewerRecommendation,
        comments: string,
        confidentialComments?: string
    ): Promise<void> {
        this.status = ReviewerAssignmentStatus.COMPLETED;
        this.completionDate = new Date();
        this.recommendation = recommendation;
        this.comments = comments;
        this.confidentialComments = confidentialComments || null;
        await this.save();
    }

    // Helper method to save review draft
    public async saveDraft(
        recommendation?: ReviewerRecommendation,
        comments?: string,
        confidentialComments?: string
    ): Promise<void> {
        this.status = ReviewerAssignmentStatus.IN_PROGRESS;
        this.recommendation = recommendation || this.recommendation;
        this.comments = comments || this.comments;
        this.confidentialComments = confidentialComments || this.confidentialComments;
        await this.save();
    }

    // Helper method to check if pending
    public isPending(): boolean {
        return this.status === ReviewerAssignmentStatus.PENDING;
    }

    // Helper method to check if accepted
    public isAccepted(): boolean {
        return this.status === ReviewerAssignmentStatus.ACCEPTED ||
            this.status === ReviewerAssignmentStatus.IN_PROGRESS;
    }

    // Helper method to check if completed
    public isCompleted(): boolean {
        return this.status === ReviewerAssignmentStatus.COMPLETED;
    }

    // Helper method to calculate days until deadline
    public getDaysUntilDeadline(): number | null {
        if (!this.deadline) return null;

        const now = new Date();
        const diff = this.deadline.getTime() - now.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }

    // Helper method to check if deadline is passed
    public isDeadlinePassed(): boolean {
        if (!this.deadline) return false;

        const now = new Date();
        return now > this.deadline;
    }

    // Static method to initialize the model
    public static initModel(sequelize: any): typeof ChapterReviewerAssignment {
        ChapterReviewerAssignment.init(
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
                reviewerId: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    field: 'reviewer_id',
                    references: {
                        model: 'users',
                        key: 'id',
                    },
                },
                assignedBy: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    field: 'assigned_by',
                    references: {
                        model: 'users',
                        key: 'id',
                    },
                },
                status: {
                    type: DataTypes.ENUM(...Object.values(ReviewerAssignmentStatus)),
                    allowNull: false,
                    defaultValue: ReviewerAssignmentStatus.PENDING,
                },
                assignedDate: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    field: 'assigned_date',
                    defaultValue: DataTypes.NOW,
                },
                acceptanceDate: {
                    type: DataTypes.DATE,
                    allowNull: true,
                    field: 'acceptance_date',
                },
                rejectionDate: {
                    type: DataTypes.DATE,
                    allowNull: true,
                    field: 'rejection_date',
                },
                rejectionReason: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                    field: 'rejection_reason',
                },
                completionDate: {
                    type: DataTypes.DATE,
                    allowNull: true,
                    field: 'completion_date',
                },
                recommendation: {
                    type: DataTypes.ENUM(...Object.values(ReviewerRecommendation)),
                    allowNull: true,
                },
                comments: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                confidentialComments: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                    field: 'confidential_comments',
                },
                deadline: {
                    type: DataTypes.DATE,
                    allowNull: true,
                },
            },
            {
                sequelize,
                tableName: 'chapter_reviewer_assignments',
                timestamps: true,
                underscored: true,
            }
        );

        return ChapterReviewerAssignment;
    }

    // Static method to associate with other models
    public static associate(models: any) {
        ChapterReviewerAssignment.belongsTo(models.IndividualChapter, {
            foreignKey: 'chapterId',
            as: 'chapter',
        });

        ChapterReviewerAssignment.belongsTo(models.User, {
            foreignKey: 'reviewerId',
            as: 'reviewer',
        });

        ChapterReviewerAssignment.belongsTo(models.User, {
            foreignKey: 'assignedBy',
            as: 'assigner',
        });
    }
}

export default ChapterReviewerAssignment;
