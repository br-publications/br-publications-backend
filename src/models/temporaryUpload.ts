import { DataTypes, Model } from 'sequelize';

export interface TemporaryUploadAttributes {
    id?: string; // UUID (optional because it's auto-generated)
    fileData: Buffer;
    mimeType: string;
    fileName: string;
    expiresAt: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

class TemporaryUpload extends Model<TemporaryUploadAttributes> implements TemporaryUploadAttributes {
    public id!: string;
    public fileData!: Buffer;
    public mimeType!: string;
    public fileName!: string;
    public expiresAt!: Date;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static initialize(sequelize: any) {
        TemporaryUpload.init(
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
                mimeType: {
                    type: DataTypes.STRING(100),
                    allowNull: false,
                },
                fileName: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                },
                expiresAt: {
                    type: DataTypes.DATE,
                    allowNull: false,
                },
            },
            {
                sequelize,
                tableName: 'temporary_uploads',
                timestamps: true,
                underscored: true,
            }
        );
        return TemporaryUpload;
    }
}

export default TemporaryUpload;
