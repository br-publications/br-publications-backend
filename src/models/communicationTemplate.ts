import { Model, DataTypes, Sequelize } from 'sequelize';

export enum CommunicationType {
    EMAIL = 'EMAIL',
    NOTIFICATION = 'NOTIFICATION'
}

interface CommunicationTemplateAttributes {
    id?: number;
    code: string;
    type: CommunicationType;
    subject: string;
    content: string;
    htmlContent?: string | null;
    contentMode?: 'rich' | 'html';
    variables?: string[];
    description?: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

class CommunicationTemplate extends Model<CommunicationTemplateAttributes> implements CommunicationTemplateAttributes {
    public id!: number;
    public code!: string;
    public type!: CommunicationType;
    public subject!: string;
    public content!: string;
    public htmlContent!: string | null;
    public contentMode!: 'rich' | 'html';
    public variables!: string[];
    public description!: string;
    public isActive!: boolean;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    // Static method to initialize the model (deferred init pattern)
    static initialize(sequelize: Sequelize) {
        CommunicationTemplate.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                code: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    unique: true,
                },
                type: {
                    type: DataTypes.ENUM(...Object.values(CommunicationType)),
                    allowNull: false,
                },
                subject: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                content: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                htmlContent: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                contentMode: {
                    type: DataTypes.STRING(10),
                    allowNull: false,
                    defaultValue: 'rich',
                },
                variables: {
                    type: DataTypes.JSON,
                    allowNull: true,
                },
                description: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                isActive: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: true,
                },
            },
            {
                sequelize,
                tableName: 'communication_templates',
                timestamps: true,
            }
        );

        return CommunicationTemplate;
    }
}

export default CommunicationTemplate;
