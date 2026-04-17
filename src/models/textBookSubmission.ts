import { DataTypes, Model, Optional } from 'sequelize';
import type User from './user';
// import sequelize from '../config/database'; // Removed to prevent circular dependency

// Status enum matching the new workflow
export enum TextBookStatus {
    INITIAL_SUBMITTED = 'INITIAL_SUBMITTED',
    PROPOSAL_UNDER_REVIEW = 'PROPOSAL_UNDER_REVIEW',
    PROPOSAL_REJECTED = 'PROPOSAL_REJECTED',
    PROPOSAL_ACCEPTED = 'PROPOSAL_ACCEPTED',
    REVISION_REQUESTED = 'REVISION_REQUESTED',
    REVISION_SUBMITTED = 'REVISION_SUBMITTED',
    SUBMISSION_ACCEPTED = 'SUBMISSION_ACCEPTED',
    SUBMISSION_REJECTED = 'SUBMISSION_REJECTED',
    ISBN_APPLIED = 'ISBN_APPLIED',
    ISBN_RECEIVED = 'ISBN_RECEIVED',
    AWAITING_DELIVERY_DETAILS = 'AWAITING_DELIVERY_DETAILS',
    DELIVERY_ADDRESS_RECEIVED = 'DELIVERY_ADDRESS_RECEIVED',
    PUBLICATION_IN_PROGRESS = 'PUBLICATION_IN_PROGRESS',
    PUBLISHED = 'PUBLISHED',
    WITHDRAWN = 'WITHDRAWN'
}

// Author interface (same as book chapter)
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
}

// Attributes interface
export interface TextBookSubmissionAttributes {
    id: number;
    submittedBy: number; // User ID
    mainAuthor: Author; // JSON field
    coAuthors: Author[] | null; // JSON field
    bookTitle: string;
    status: TextBookStatus;
    currentRevisionNumber: number; // Track revision count (max 5)
    adminNotes: string | null;
    isbnNumber: string | null;
    doiNumber: string | null;
    submissionDate: Date;
    proposalAcceptedDate: Date | null; // When admin accepts initial proposal
    approvalDate: Date | null; // When final submission is accepted
    isbnAppliedDate: Date | null; // When ISBN application is submitted
    isbnReceivedDate: Date | null; // When ISBN is received
    publicationStartDate: Date | null; // When publication process starts
    publishDate: Date | null; // When text book is published
    lastUpdatedBy: number | null;
    isDirectSubmission: boolean;
    isBulkSubmission: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

// Creation attributes (optional fields for creation)
export interface TextBookSubmissionCreationAttributes
    extends Optional<
        TextBookSubmissionAttributes,
        | 'id'
        | 'status'
        | 'currentRevisionNumber'
        | 'adminNotes'
        | 'isbnNumber'
        | 'doiNumber'
        | 'proposalAcceptedDate'
        | 'approvalDate'
        | 'isbnAppliedDate'
        | 'isbnReceivedDate'
        | 'publicationStartDate'
        | 'publishDate'
        | 'lastUpdatedBy'
        | 'isDirectSubmission'
        | 'createdAt'
        | 'updatedAt'
    > { }

// Model class
class TextBookSubmission
    extends Model<TextBookSubmissionAttributes, TextBookSubmissionCreationAttributes>
    implements TextBookSubmissionAttributes {
    public id!: number;
    public submittedBy!: number;
    public mainAuthor!: Author;
    public coAuthors!: Author[] | null;
    public bookTitle!: string;
    public status!: TextBookStatus;
    public currentRevisionNumber!: number;
    public adminNotes!: string | null;
    public isbnNumber!: string | null;
    public doiNumber!: string | null;
    public submissionDate!: Date;
    public proposalAcceptedDate!: Date | null;
    public approvalDate!: Date | null;
    public isbnAppliedDate!: Date | null;
    public isbnReceivedDate!: Date | null;
    public publicationStartDate!: Date | null;
    public publishDate!: Date | null;
    public lastUpdatedBy!: number | null;
    public isDirectSubmission!: boolean; // New field
    public isBulkSubmission!: boolean; // New field
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    // Associations
    public author?: User;
    public files?: any[];
    public revisions?: any[];
    public discussions?: any[];
    public statusHistory?: any[];

    // Instance methods
    public getMainAuthorName(): string {
        return `${this.mainAuthor.firstName} ${this.mainAuthor.lastName}`;
    }

    public getCorrespondingAuthor(): Author {
        if (this.mainAuthor.isCorrespondingAuthor) {
            return this.mainAuthor;
        }
        if (this.coAuthors && Array.isArray(this.coAuthors)) {
            const corresponding = this.coAuthors.find(a => a.isCorrespondingAuthor);
            if (corresponding) return corresponding;
        }
        return this.mainAuthor; // Fallback
    }

    public getTotalAuthorsCount(): number {
        return 1 + (Array.isArray(this.coAuthors) ? this.coAuthors.length : 0);
    }

    public canRequestRevision(): boolean {
        return this.currentRevisionNumber < 5;
    }

    public getRevisionStatus(): string {
        return `${this.currentRevisionNumber}/5 revisions used`;
    }

    public isActive(): boolean {
        return ![
            TextBookStatus.PROPOSAL_REJECTED,
            TextBookStatus.SUBMISSION_REJECTED,
            TextBookStatus.WITHDRAWN,
            TextBookStatus.PUBLISHED
        ].includes(this.status);
    }

    public canPublish(): boolean {
        return (
            (this.status === TextBookStatus.ISBN_RECEIVED ||
                this.status === TextBookStatus.AWAITING_DELIVERY_DETAILS ||
                this.status === TextBookStatus.PUBLICATION_IN_PROGRESS) &&
            this.isbnNumber !== null
        );
    }

    public getDaysSinceSubmission(): number {
        const now = new Date();
        const diff = now.getTime() - this.submissionDate.getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    }

    // Static method to initialize the model
    static initialize(sequelize: any) {
        TextBookSubmission.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true
                },
                submittedBy: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'users',
                        key: 'id'
                    }
                },
                mainAuthor: {
                    type: DataTypes.JSON,
                    allowNull: false,
                    validate: {
                        isValidAuthor(value: any) {
                            if (!value.firstName) {
                                throw new Error('Main author must have at least a first name');
                            }
                        }
                    }
                },
                coAuthors: {
                    type: DataTypes.JSON,
                    allowNull: true,
                    defaultValue: null
                },
                bookTitle: {
                    type: DataTypes.STRING(500),
                    allowNull: false
                },
                status: {
                    type: DataTypes.ENUM(...Object.values(TextBookStatus)),
                    allowNull: false,
                    defaultValue: TextBookStatus.INITIAL_SUBMITTED
                },
                currentRevisionNumber: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    defaultValue: 0,
                    validate: {
                        min: 0,
                        max: 5
                    }
                },
                adminNotes: {
                    type: DataTypes.TEXT,
                    allowNull: true
                },
                isbnNumber: {
                    type: DataTypes.STRING(50),
                    allowNull: true
                },
                doiNumber: {
                    type: DataTypes.STRING(100),
                    allowNull: true
                },
                submissionDate: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW
                },
                proposalAcceptedDate: {
                    type: DataTypes.DATE,
                    allowNull: true
                },
                approvalDate: {
                    type: DataTypes.DATE,
                    allowNull: true
                },
                isbnAppliedDate: {
                    type: DataTypes.DATE,
                    allowNull: true
                },
                isbnReceivedDate: {
                    type: DataTypes.DATE,
                    allowNull: true
                },
                publicationStartDate: {
                    type: DataTypes.DATE,
                    allowNull: true
                },
                publishDate: {
                    type: DataTypes.DATE,
                    allowNull: true
                },
                lastUpdatedBy: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    references: {
                        model: 'users',
                        key: 'id'
                    }
                },
                isDirectSubmission: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: false
                },
                isBulkSubmission: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: false
                }
            },
            {
                sequelize,
                tableName: 'text_book_submissions',
                timestamps: true,
                hooks: {
                    beforeCreate: (submission: TextBookSubmission) => {
                        if (!submission.submissionDate) {
                            submission.submissionDate = new Date();
                        }
                    }
                }
            }
        );
        return TextBookSubmission;
    }

    // Define associations
    static associate(models: any) {
        // Belongs to User (author)
        TextBookSubmission.belongsTo(models.User, {
            foreignKey: 'submittedBy',
            as: 'author'
        });

        // Has many files
        TextBookSubmission.hasMany(models.TextBookFile, {
            foreignKey: 'submissionId',
            as: 'files',
            onDelete: 'CASCADE'
        });

        // Has many revisions
        TextBookSubmission.hasMany(models.TextBookRevision, {
            foreignKey: 'submissionId',
            as: 'revisions',
            onDelete: 'CASCADE'
        });

        // Has many discussions
        TextBookSubmission.hasMany(models.TextBookDiscussion, {
            foreignKey: 'submissionId',
            as: 'discussions',
            onDelete: 'CASCADE'
        });

        // Has many status history entries
        TextBookSubmission.hasMany(models.TextBookStatusHistory, {
            foreignKey: 'submissionId',
            as: 'statusHistory',
            onDelete: 'CASCADE'
        });

        // Has one published book
        TextBookSubmission.hasOne(models.PublishedBook, {
            foreignKey: 'textBookSubmissionId',
            as: 'publishedBook',
            onDelete: 'SET NULL'
        });
        // Has one DeliveryAddress
        TextBookSubmission.hasOne(models.DeliveryAddress, {
            foreignKey: 'textBookSubmissionId',
            as: 'deliveryAddress',
            onDelete: 'CASCADE'
        });
    }
}

export default TextBookSubmission;
