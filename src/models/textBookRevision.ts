import { DataTypes, Model, Optional } from 'sequelize';

// Attributes interface
export interface TextBookRevisionAttributes {
    id: number;
    submissionId: number;
    revisionNumber: number;
    requestedBy?: number;        // Admin who requested the revision
    requestComments?: string;    // Comments for the request
    submittedBy?: number;        // Author who submitted (nullable until submitted)
    submissionComments?: string | null; // Author's comments (renamed from notes)
    adminFeedback: string | null;
    status: string;              // PENDING, SUBMITTED, etc.
    submittedAt?: Date;          // Nullable until submitted
    reviewedAt: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
}

// Creation attributes
export interface TextBookRevisionCreationAttributes
    extends Optional<
        TextBookRevisionAttributes,
        'id' | 'submissionComments' | 'adminFeedback' | 'reviewedAt' | 'createdAt' | 'updatedAt' | 'submittedBy' | 'submittedAt' | 'requestedBy' | 'requestComments'
    > { }

// Model class
class TextBookRevision
    extends Model<TextBookRevisionAttributes, TextBookRevisionCreationAttributes>
    implements TextBookRevisionAttributes {
    public id!: number;
    public submissionId!: number;
    public revisionNumber!: number;
    public requestedBy!: number;
    public requestComments!: string;
    public submittedBy!: number;
    public submissionComments!: string | null;
    public adminFeedback!: string | null;
    public status!: string;
    public submittedAt!: Date;
    public reviewedAt!: Date | null;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    // Associations
    public files?: any[];

    // Instance methods
    public isReviewed(): boolean {
        return this.reviewedAt !== null;
    }

    public getDaysSinceSubmission(): number {
        if (!this.submittedAt) return 0;
        const now = new Date();
        const diff = now.getTime() - this.submittedAt.getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    }

    // Static method to initialize the model
    static initialize(sequelize: any) {
        TextBookRevision.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true
                },
                submissionId: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'text_book_submissions',
                        key: 'id'
                    }
                },
                revisionNumber: {
                    type: DataTypes.INTEGER,
                    allowNull: false
                },
                requestedBy: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    references: {
                        model: 'users',
                        key: 'id'
                    }
                },
                requestComments: {
                    type: DataTypes.TEXT,
                    allowNull: true
                },
                submittedBy: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    references: {
                        model: 'users',
                        key: 'id'
                    }
                },
                submissionComments: { // Renamed from notes
                    type: DataTypes.TEXT,
                    allowNull: true
                },
                adminFeedback: {
                    type: DataTypes.TEXT,
                    allowNull: true
                },
                status: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    defaultValue: 'PENDING'
                },
                submittedAt: {
                    type: DataTypes.DATE,
                    allowNull: true
                },
                reviewedAt: {
                    type: DataTypes.DATE,
                    allowNull: true
                }
            },
            {
                sequelize,
                tableName: 'text_book_revisions',
                timestamps: true
            }
        );
        return TextBookRevision;
    }

    // Define associations
    static associate(models: any) {
        TextBookRevision.belongsTo(models.TextBookSubmission, {
            foreignKey: 'submissionId',
            as: 'submission'
        });

        TextBookRevision.belongsTo(models.User, {
            foreignKey: 'submittedBy',
            as: 'submittedByUser'
        });

        TextBookRevision.belongsTo(models.User, {
            foreignKey: 'requestedBy',
            as: 'requester'
        });

        TextBookRevision.hasMany(models.TextBookFile, {
            foreignKey: 'revisionNumber',
            as: 'files',
            scope: {
                fileType: 'REVISION'
            }
        });
    }
}

export default TextBookRevision;
