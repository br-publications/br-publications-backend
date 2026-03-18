import { DataTypes, Model, Optional } from 'sequelize';
import type User from './user';
import { BookChapterDiscussion } from './bookChapterDiscussion';
import type IndividualChapter from './individualChapter';
import type BookChapterFile from './bookChapterFile';
import type BookChapterReviewerAssignment from './bookChapterReviewerAssignment';
import type BookChapterStatusHistory from './bookChapterStatusHistory';

// Enum for submission status — NEW 10-status flow
export enum BookChapterStatus {
  ABSTRACT_SUBMITTED = 'ABSTRACT_SUBMITTED',
  MANUSCRIPTS_PENDING = 'MANUSCRIPTS_PENDING',
  REVIEWER_ASSIGNMENT = 'REVIEWER_ASSIGNMENT',
  UNDER_REVIEW = 'UNDER_REVIEW',
  EDITORIAL_REVIEW = 'EDITORIAL_REVIEW',
  APPROVED = 'APPROVED',
  ISBN_APPLIED = 'ISBN_APPLIED',
  PUBLICATION_IN_PROGRESS = 'PUBLICATION_IN_PROGRESS',
  PUBLISHED = 'PUBLISHED',
  REJECTED = 'REJECTED',
}

interface Author {
  firstName: string;
  lastName: string;
  designation: string;
  departmentName: string;
  instituteName: string;
  city: string;
  state: string;
  country: string;
  email: string;
  phoneNumber?: string;
  isCorrespondingAuthor: boolean;
  otherDesignation?: string;
}

interface BookChapterSubmissionAttributes {
  id: number;
  submittedBy: number;
  mainAuthor: Author;
  coAuthors: Author[] | null;
  bookTitle: string;
  editors: string[] | null;
  bookChapterTitles: string[];
  abstract: string;
  keywords: string[];
  status: BookChapterStatus;
  assignedEditorId: number | null;
  designatedEditorId: number | null;
  isbn: string | null;
  doi: string | null;
  revisionCount: number;
  currentRevisionNumber: number;
  reviewDeadline: Date | null;
  editorDecisionDate: Date | null;
  finalApprovalDate: Date | null;
  submissionDate: Date;
  lastUpdatedBy: number | null;
  notes: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface BookChapterSubmissionCreationAttributes extends Optional<
  BookChapterSubmissionAttributes,
  | 'id'
  | 'coAuthors'
  | 'status'
  | 'assignedEditorId'
  | 'designatedEditorId'
  | 'isbn'
  | 'doi'
  | 'revisionCount'
  | 'currentRevisionNumber'
  | 'reviewDeadline'
  | 'editorDecisionDate'
  | 'finalApprovalDate'
  | 'submissionDate'
  | 'lastUpdatedBy'
  | 'notes'
> { }

class BookChapterSubmission extends Model<
  BookChapterSubmissionAttributes,
  BookChapterSubmissionCreationAttributes
> implements BookChapterSubmissionAttributes {
  public id!: number;
  public submittedBy!: number;
  public mainAuthor!: Author;
  public coAuthors!: Author[] | null;
  public bookTitle!: string;
  public editors!: string[] | null;
  public bookChapterTitles!: string[];
  public abstract!: string;
  public keywords!: string[];
  public status!: BookChapterStatus;
  public assignedEditorId!: number | null;
  public designatedEditorId!: number | null;
  public isbn!: string | null;
  public doi!: string | null;
  public revisionCount!: number;
  public currentRevisionNumber!: number;
  public reviewDeadline!: Date | null;
  public editorDecisionDate!: Date | null;
  public finalApprovalDate!: Date | null;
  public submissionDate!: Date;
  public lastUpdatedBy!: number | null;
  public notes!: string | null;

  public readonly discussions?: BookChapterDiscussion[];
  public readonly individualChapters?: IndividualChapter[];

  public readonly submitter?: User;
  public readonly assignedEditor?: User;
  public readonly designatedEditor?: User;
  public readonly updater?: User;
  public readonly files?: BookChapterFile[];
  public readonly reviewerAssignments?: BookChapterReviewerAssignment[];
  public readonly statusHistory?: BookChapterStatusHistory[];

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Instance method to get main author full name
  public getMainAuthorName(): string {
    return `${this.mainAuthor.firstName} ${this.mainAuthor.lastName}`;
  }

  // Instance method to get corresponding author
  public getCorrespondingAuthor(): Author {
    const isMainCorresponding = this.mainAuthor.isCorrespondingAuthor === true ||
      (this.mainAuthor.isCorrespondingAuthor as any) === 'true';

    if (isMainCorresponding) {
      return this.mainAuthor;
    }

    if (this.coAuthors && Array.isArray(this.coAuthors)) {
      const corresponding = this.coAuthors.find(author =>
        author.isCorrespondingAuthor === true || (author.isCorrespondingAuthor as any) === 'true'
      );
      if (corresponding) return corresponding;
    }

    return this.mainAuthor; // Fallback to main author
  }

  // Instance method to get all authors count
  public getTotalAuthorsCount(): number {
    return 1 + (this.coAuthors?.length || 0);
  }

  // Instance method to check if can request revision
  public canRequestRevision(): boolean {
    return this.revisionCount < 3;
  }

  // Instance method to get revision status
  public getRevisionStatus(): string {
    return `${this.revisionCount}/3`;
  }

  // Instance method to check if reviewers can be assigned (chapter-level via editor)
  public canAssignReviewers(): boolean {
    return this.status === BookChapterStatus.REVIEWER_ASSIGNMENT ||
      this.status === BookChapterStatus.UNDER_REVIEW;
  }

  // Instance method to check if submission is in final stages
  public isFinalStage(): boolean {
    return [
      BookChapterStatus.APPROVED,
      BookChapterStatus.ISBN_APPLIED,
      BookChapterStatus.PUBLICATION_IN_PROGRESS,
      BookChapterStatus.PUBLISHED,
      BookChapterStatus.REJECTED,
    ].includes(this.status);
  }

  // Instance method to check if submission is active
  public isActive(): boolean {
    return ![
      BookChapterStatus.REJECTED,
      BookChapterStatus.PUBLISHED,
    ].includes(this.status);
  }

  // Instance method to check if manuscripts can be uploaded
  public canUploadManuscripts(): boolean {
    return this.status === BookChapterStatus.MANUSCRIPTS_PENDING;
  }

  // Instance method to get all chapter titles as string (legacy, returns what is saved in DB, which may be IDs)
  public getChapterTitlesString(): string {
    return this.bookChapterTitles.join(', ');
  }

  // Instance method to get resolved chapter titles mapping from associated IndividualChapter records
  public async getResolvedChapterTitlesString(): Promise<string> {
    try {
      const chapters = await this.getAllChapters();
      if (chapters && chapters.length > 0) {
        return chapters.map((c: any) => c.chapterTitle).join(', ');
      }
    } catch (error) {
      console.error('Error resolving chapter titles:', error);
    }
    return this.getChapterTitlesString(); // Fallback to raw DB IDs/Strings if no IndividualChapters exist yet
  }

  // Instance method to calculate days since submission
  public getDaysSinceSubmission(): number {
    const now = new Date();
    const diff = now.getTime() - this.submissionDate.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  // Instance method to calculate days until deadline
  public getDaysUntilDeadline(): number | null {
    if (!this.reviewDeadline) return null;

    const now = new Date();
    const diff = this.reviewDeadline.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  // Instance method to check if deadline is passed
  public isDeadlinePassed(): boolean {
    if (!this.reviewDeadline) return false;
    return new Date() > this.reviewDeadline;
  }

  // Instance method to get all chapters
  public async getAllChapters() {
    const IndividualChapter = require('./individualChapter').default;
    return await IndividualChapter.findAll({
      where: { submissionId: this.id },
      order: [['chapterNumber', 'ASC']],
    });
  }

  // Instance method to get chapter progress
  public async getChapterProgress() {
    const chapters = await this.getAllChapters();
    const ChapterStatus = require('./individualChapter').ChapterStatus;

    const total = chapters.length;
    const approved = chapters.filter((c: any) => c.status === ChapterStatus.CHAPTER_APPROVED).length;
    const rejected = chapters.filter((c: any) => c.status === ChapterStatus.CHAPTER_REJECTED).length;
    const inProgress = total - approved - rejected;

    return { total, approved, rejected, inProgress };
  }

  // Instance method to check if can publish
  public async canPublish(): Promise<boolean> {
    const chapters = await this.getAllChapters();
    if (chapters.length === 0) return false;

    const ChapterStatus = require('./individualChapter').ChapterStatus;
    return chapters.every((c: any) => c.status === ChapterStatus.CHAPTER_APPROVED);
  }

  // Instance method to get chapters by status
  public async getChaptersByStatus(status: string) {
    const IndividualChapter = require('./individualChapter').default;
    return await IndividualChapter.findAll({
      where: {
        submissionId: this.id,
        status: status,
      },
      order: [['chapterNumber', 'ASC']],
    });
  }

  // Static method to initialize the model
  static initialize(sequelize: any) {
    BookChapterSubmission.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        submittedBy: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        mainAuthor: {
          type: DataTypes.JSONB,
          allowNull: false,
          validate: {
            notEmpty: { msg: 'Main author information is required' },
          },
        },
        coAuthors: {
          type: DataTypes.JSONB,
          allowNull: true,
        },
        bookTitle: {
          type: DataTypes.STRING(255),
          allowNull: false,
          validate: {
            notEmpty: { msg: 'Book title is required' },
          },
        },
        editors: {
          type: DataTypes.JSONB,
          allowNull: true,
          defaultValue: null,
        },
        bookChapterTitles: {
          type: DataTypes.JSONB,
          allowNull: false,
          validate: {
            notEmpty: { msg: 'At least one chapter title is required' },
          },
        },
        abstract: {
          type: DataTypes.TEXT,
          allowNull: false,
          validate: {
            notEmpty: { msg: 'Abstract is required' },
          },
        },
        keywords: {
          type: DataTypes.JSONB,
          allowNull: false,
          validate: {
            notEmpty: { msg: 'Keywords are required' },
          },
        },
        status: {
          type: DataTypes.ENUM(...Object.values(BookChapterStatus)),
          defaultValue: BookChapterStatus.ABSTRACT_SUBMITTED,
          allowNull: false,
        },
        assignedEditorId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        designatedEditorId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        isbn: {
          type: DataTypes.STRING(30),
          allowNull: true,
        },
        doi: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        revisionCount: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
          validate: {
            min: {
              args: [0],
              msg: 'Revision count cannot be negative',
            },
            max: {
              args: [3],
              msg: 'Maximum 3 revisions allowed',
            },
          },
        },
        currentRevisionNumber: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        reviewDeadline: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        editorDecisionDate: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        finalApprovalDate: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        submissionDate: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        lastUpdatedBy: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        notes: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'book_chapter_submissions',
        timestamps: true,
        hooks: {
          beforeCreate: async (submission: BookChapterSubmission) => {
            if (!submission.submissionDate) {
              submission.submissionDate = new Date();
            }
          },
        },
      }
    );

    return BookChapterSubmission;
  }

  // Define associations
  static associate(models: any) {
    // Belongs to submitter (User)
    BookChapterSubmission.belongsTo(models.User, {
      foreignKey: 'submittedBy',
      as: 'submitter',
    });

    // Belongs to assigned editor (User)
    BookChapterSubmission.belongsTo(models.User, {
      foreignKey: 'assignedEditorId',
      as: 'assignedEditor',
    });

    // Belongs to designated editor (User)
    BookChapterSubmission.belongsTo(models.User, {
      foreignKey: 'designatedEditorId',
      as: 'designatedEditor',
    });

    // Belongs to last updated by (User)
    BookChapterSubmission.belongsTo(models.User, {
      foreignKey: 'lastUpdatedBy',
      as: 'updater',
    });

    // Has many files
    BookChapterSubmission.hasMany(models.BookChapterFile, {
      foreignKey: 'submissionId',
      as: 'files',
    });

    // Has many status history records
    BookChapterSubmission.hasMany(models.BookChapterStatusHistory, {
      foreignKey: 'submissionId',
      as: 'statusHistory',
    });

    // Has many reviewer assignments (legacy — kept for backward compat)
    BookChapterSubmission.hasMany(models.BookChapterReviewerAssignment, {
      foreignKey: 'submissionId',
      as: 'reviewerAssignments',
    });

    // Has many individual chapters
    BookChapterSubmission.hasMany(models.IndividualChapter, {
      foreignKey: 'submissionId',
      as: 'individualChapters',
    });

    // Has many discussions
    BookChapterSubmission.hasMany(models.BookChapterDiscussion, {
      foreignKey: 'submissionId',
      as: 'discussions',
    });

    // Has one DeliveryAddress
    BookChapterSubmission.hasOne(models.DeliveryAddress, {
      foreignKey: 'bookChapterSubmissionId',
      as: 'deliveryAddress',
      onDelete: 'CASCADE'
    });
  }
}

export default BookChapterSubmission;
