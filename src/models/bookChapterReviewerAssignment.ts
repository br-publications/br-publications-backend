import { DataTypes, Model, Optional } from 'sequelize';
import type BookChapterSubmission from './bookChapterSubmission';
import type User from './user';

// Enum for assignment status
export enum ReviewerAssignmentStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
}

// Enum for recommendation
export enum ReviewerRecommendation {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  REVISION_NEEDED = 'REVISION_NEEDED',
}

interface BookChapterReviewerAssignmentAttributes {
  id: number;
  submissionId: number;
  reviewerId: number;
  assignedBy: number;
  status: ReviewerAssignmentStatus;
  assignedDate: Date;
  responseDate: Date | null;
  deadline: Date | null;
  completedDate: Date | null;
  recommendation: ReviewerRecommendation | null;
  reviewerComments: string | null;
  confidentialNotes: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface BookChapterReviewerAssignmentCreationAttributes extends Optional<
  BookChapterReviewerAssignmentAttributes,
  | 'id'
  | 'status'
  | 'assignedDate'
  | 'responseDate'
  | 'deadline'
  | 'completedDate'
  | 'recommendation'
  | 'reviewerComments'
  | 'confidentialNotes'
> { }

class BookChapterReviewerAssignment extends Model<
  BookChapterReviewerAssignmentAttributes,
  BookChapterReviewerAssignmentCreationAttributes
> implements BookChapterReviewerAssignmentAttributes {
  public id!: number;
  public submissionId!: number;
  public reviewerId!: number;
  public assignedBy!: number;
  public status!: ReviewerAssignmentStatus;
  public assignedDate!: Date;
  public responseDate!: Date | null;
  public deadline!: Date | null;
  public completedDate!: Date | null;
  public recommendation!: ReviewerRecommendation | null;
  public reviewerComments!: string | null;
  public confidentialNotes!: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly submission?: BookChapterSubmission;
  public readonly reviewer?: User;
  public readonly assigner?: User;

  // Instance method to check if deadline is passed
  public isDeadlinePassed(): boolean {
    if (!this.deadline) return false;
    return new Date() > this.deadline;
  }

  // Instance method to get days until deadline
  public getDaysUntilDeadline(): number | null {
    if (!this.deadline) return null;

    const now = new Date();
    const diff = this.deadline.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  // Instance method to get days since assignment
  public getDaysSinceAssignment(): number {
    const now = new Date();
    const diff = now.getTime() - this.assignedDate.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  // Instance method to check if response is pending
  public isPending(): boolean {
    return this.status === ReviewerAssignmentStatus.PENDING;
  }

  // Instance method to check if accepted
  public isAccepted(): boolean {
    return this.status === ReviewerAssignmentStatus.ACCEPTED ||
      this.status === ReviewerAssignmentStatus.IN_PROGRESS;
  }

  // Instance method to check if completed
  public isCompleted(): boolean {
    return this.status === ReviewerAssignmentStatus.COMPLETED;
  }

  // Instance method to calculate deadline (30 days from acceptance)
  public calculateDeadline(): Date {
    const acceptanceDate = this.responseDate || new Date();
    const deadline = new Date(acceptanceDate);
    deadline.setDate(deadline.getDate() + 30);
    return deadline;
  }

  // Static method to initialize the model
  static initialize(sequelize: any) {
    BookChapterReviewerAssignment.init(
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
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        reviewerId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        assignedBy: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        status: {
          type: DataTypes.ENUM(...Object.values(ReviewerAssignmentStatus)),
          defaultValue: ReviewerAssignmentStatus.PENDING,
          allowNull: false,
        },
        assignedDate: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        responseDate: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        deadline: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        completedDate: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        recommendation: {
          type: DataTypes.ENUM(...Object.values(ReviewerRecommendation)),
          allowNull: true,
        },
        reviewerComments: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        confidentialNotes: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'book_chapter_reviewer_assignments',
        timestamps: true,
        hooks: {
          beforeCreate: async (assignment: BookChapterReviewerAssignment) => {
            if (!assignment.assignedDate) {
              assignment.assignedDate = new Date();
            }
          },
        },
      }
    );

    return BookChapterReviewerAssignment;
  }

  // Define associations
  static associate(models: any) {
    // Assignment belongs to a submission
    BookChapterReviewerAssignment.belongsTo(models.BookChapterSubmission, {
      foreignKey: 'submissionId',
      as: 'submission',
    });

    // Assignment belongs to a reviewer
    BookChapterReviewerAssignment.belongsTo(models.User, {
      foreignKey: 'reviewerId',
      as: 'reviewer',
    });

    // Assignment belongs to user who assigned
    BookChapterReviewerAssignment.belongsTo(models.User, {
      foreignKey: 'assignedBy',
      as: 'assigner',
    });
  }
}

export default BookChapterReviewerAssignment;
