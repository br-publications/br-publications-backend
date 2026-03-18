import { DataTypes, Model, Optional } from 'sequelize';
// import { TextBookFileType } from './textBookFile';

// File type enum
export enum TextBookFileType {
    CONTENT_FILE = 'CONTENT_FILE',
    FULL_TEXT = 'FULL_TEXT',
    REVISION = 'REVISION',
    COVER_IMAGE = 'COVER_IMAGE'
}

// Attributes interface
export interface TextBookFileAttributes {
    id: number;
    submissionId: number;
    fileType: TextBookFileType;
    fileName: string;
    filePath?: string;
    fileData: Buffer;
    fileSize: number;
    mimeType: string;
    revisionNumber: number | null; // For revision files
    uploadedBy: number;
    uploadedAt: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

// Creation attributes
export interface TextBookFileCreationAttributes
    extends Optional<TextBookFileAttributes, 'id' | 'revisionNumber' | 'createdAt' | 'updatedAt'> { }

// Model class
class TextBookFile
    extends Model<TextBookFileAttributes, TextBookFileCreationAttributes>
    implements TextBookFileAttributes {
    public id!: number;
    public submissionId!: number;
    public fileType!: TextBookFileType;
    public fileName!: string;
    public filePath!: string;
    public fileData!: Buffer;
    public fileSize!: number;
    public mimeType!: string;
    public revisionNumber!: number | null;
    public uploadedBy!: number;
    public uploadedAt!: Date;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    // Instance methods
    public getFileSizeInMB(): string {
        return (this.fileSize / (1024 * 1024)).toFixed(2) + ' MB';
    }

    public isRevisionFile(): boolean {
        return this.fileType === TextBookFileType.REVISION;
    }

    // Static method to initialize the model
    static initialize(sequelize: any) {
        TextBookFile.init(
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
                fileType: {
                    type: DataTypes.ENUM(...Object.values(TextBookFileType)),
                    allowNull: false
                },
                fileName: {
                    type: DataTypes.STRING(255),
                    allowNull: false
                },
                filePath: {
                    type: DataTypes.STRING(500),
                    allowNull: true // Made optional as we store in DB
                },
                fileData: {
                    type: DataTypes.BLOB('long'), // Store binary data
                    allowNull: false
                },
                fileSize: {
                    type: DataTypes.INTEGER,
                    allowNull: false
                },
                mimeType: {
                    type: DataTypes.STRING(100),
                    allowNull: false
                },
                revisionNumber: {
                    type: DataTypes.INTEGER,
                    allowNull: true
                },
                uploadedBy: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'users',
                        key: 'id'
                    }
                },
                uploadedAt: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW
                }
            },
            {
                sequelize,
                tableName: 'text_book_files',
                timestamps: true
            }
        );
        return TextBookFile;
    }

    // Define associations
    static associate(models: any) {
        TextBookFile.belongsTo(models.TextBookSubmission, {
            foreignKey: 'submissionId',
            as: 'submission'
        });

        TextBookFile.belongsTo(models.User, {
            foreignKey: 'uploadedBy',
            as: 'uploader'
        });
    }
}

export default TextBookFile;
