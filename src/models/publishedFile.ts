import { DataTypes, Model, Optional } from 'sequelize';

export interface PublishedFileAttributes {
    id: string; // UUID
    fileData: Buffer;
    fileName: string;
    mimeType: string;
    fileSize: number;
    category: string; // 'CHAPTER', 'FRONTMATTER', 'COVER', etc.
    createdAt?: Date;
    updatedAt?: Date;
}

export interface PublishedFileCreationAttributes extends Optional<PublishedFileAttributes, 'id'> { }

class PublishedFile extends Model<PublishedFileAttributes, PublishedFileCreationAttributes> implements PublishedFileAttributes {
    public id!: string;
    public fileData!: Buffer;
    public fileName!: string;
    public mimeType!: string;
    public fileSize!: number;
    public category!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static initialize(sequelize: any) {
        PublishedFile.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    primaryKey: true,
                },
                fileData: {
                    type: DataTypes.BLOB('long'),
                    allowNull: false,
                },
                fileName: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                    field: 'file_name',
                },
                mimeType: {
                    type: DataTypes.STRING(100),
                    allowNull: false,
                    field: 'mime_type',
                },
                fileSize: {
                    type: DataTypes.BIGINT,
                    allowNull: false,
                    field: 'file_size',
                },
                category: {
                    type: DataTypes.STRING(50),
                    allowNull: false,
                    defaultValue: 'GENERAL',
                },
            },
            {
                sequelize,
                tableName: 'published_files',
                timestamps: true,
                underscored: true,
            }
        );
        return PublishedFile;
    }
}

export default PublishedFile;
