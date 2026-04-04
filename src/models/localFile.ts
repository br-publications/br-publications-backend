import { DataTypes, Model, Optional } from 'sequelize';

export interface LocalFileAttributes {
    id: string; // UUID
    submissionId: number | null;
    fileName: string;
    originalName: string;
    mimeType: string;
    fileSize: number;
    expiresAt: Date | null;
    extraMetadata: any;
    filePath: string;
    uploadedBy: number;
    createdAt?: Date;
    updatedAt?: Date;
}

interface LocalFileCreationAttributes extends Optional<LocalFileAttributes, 'id' | 'submissionId' | 'expiresAt' | 'extraMetadata'> {}

class LocalFile extends Model<LocalFileAttributes, LocalFileCreationAttributes> implements LocalFileAttributes {
    public id!: string;
    public submissionId!: number | null;
    public fileName!: string;
    public originalName!: string;
    public mimeType!: string;
    public fileSize!: number;
    public expiresAt!: Date | null;
    public extraMetadata!: any;
    public filePath!: string;
    public uploadedBy!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static initialize(sequelize: any) {
        LocalFile.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    primaryKey: true,
                },
                submissionId: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    references: {
                        model: 'book_chapter_submissions',
                        key: 'id',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'SET NULL',
                },
                fileName: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                },
                originalName: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                },
                mimeType: {
                    type: DataTypes.STRING(100),
                    allowNull: false,
                },
                fileSize: {
                    type: DataTypes.BIGINT,
                    allowNull: false,
                },
                expiresAt: {
                    type: DataTypes.DATE,
                    allowNull: true,
                },
                extraMetadata: {
                    type: DataTypes.JSONB,
                    allowNull: true,
                },
                filePath: {
                    type: DataTypes.STRING(500),
                    allowNull: false,
                },
                uploadedBy: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'users',
                        key: 'id',
                    },
                },
            },
            {
                sequelize,
                tableName: 'local_files',
                timestamps: true,
                underscored: true,
            }
        );
        return LocalFile;
    }

    static associate(models: any) {
        LocalFile.belongsTo(models.BookChapterSubmission, {
            foreignKey: 'submissionId',
            as: 'submission',
        });
        LocalFile.belongsTo(models.User, {
            foreignKey: 'uploadedBy',
            as: 'uploader',
        });
    }
}

export default LocalFile;
