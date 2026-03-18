import { DataTypes, Model, Optional } from 'sequelize';

export interface ConferenceAttributes {
    id: number;
    title: string;
    publisher: string;
    publishedDate: string | null;
    dateRange: string | null;
    location: string | null;
    issn: string | null;
    doi: string | null;
    articleCount: number;
    type: string;
    code: string | null;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

interface ConferenceCreationAttributes extends Optional<
    ConferenceAttributes,
    'id' | 'publishedDate' | 'dateRange' | 'location' | 'issn' | 'doi' | 'articleCount' | 'type' | 'code' | 'isActive'
> { }

class Conference extends Model<ConferenceAttributes, ConferenceCreationAttributes>
    implements ConferenceAttributes {
    public id!: number;
    public title!: string;
    public publisher!: string;
    public publishedDate!: string | null;
    public dateRange!: string | null;
    public location!: string | null;
    public issn!: string | null;
    public doi!: string | null;
    public articleCount!: number;
    public type!: string;
    public code!: string | null;
    public isActive!: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    // Associations
    public readonly articles?: any[];

    static initialize(sequelize: any) {
        Conference.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                title: {
                    type: DataTypes.STRING(600),
                    allowNull: false,
                },
                publisher: {
                    type: DataTypes.STRING(200),
                    allowNull: false,
                },
                publishedDate: {
                    type: DataTypes.STRING(50),
                    allowNull: true,
                },
                dateRange: {
                    type: DataTypes.STRING(100),
                    allowNull: true,
                },
                location: {
                    type: DataTypes.STRING(300),
                    allowNull: true,
                },
                issn: {
                    type: DataTypes.STRING(30),
                    allowNull: true,
                },
                doi: {
                    type: DataTypes.STRING(200),
                    allowNull: true,
                },
                articleCount: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    defaultValue: 0,
                },
                type: {
                    type: DataTypes.STRING(50),
                    allowNull: false,
                    defaultValue: 'Conference',
                },
                code: {
                    type: DataTypes.STRING(100),
                    allowNull: true,
                },
                isActive: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: true,
                },
            },
            {
                sequelize,
                tableName: 'conferences',
                timestamps: true,
                indexes: [
                    { fields: ['isActive'] },
                    { fields: ['publisher'] },
                ],
            }
        );

        return Conference;
    }

    static associate(models: any) {
        Conference.hasMany(models.ConferenceArticle, {
            foreignKey: 'conferenceId',
            as: 'articles',
        });
    }
}

export default Conference;
