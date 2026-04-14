import { DataTypes, Model, Optional } from 'sequelize';

export interface ConferenceArticleAttributes {
    id: number;
    conferenceId: number;
    title: string;
    authors: string[];
    year: number | null;
    pages: string | null;
    abstract: string | null;
    doi: string | null;
    keywords: string[] | null;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

interface ConferenceArticleCreationAttributes extends Optional<
    ConferenceArticleAttributes,
    'id' | 'year' | 'pages' | 'abstract' | 'doi' | 'keywords' | 'isActive'
> { }

class ConferenceArticle extends Model<ConferenceArticleAttributes, ConferenceArticleCreationAttributes>
    implements ConferenceArticleAttributes {
    public id!: number;
    public conferenceId!: number;
    public title!: string;
    public authors!: string[];
    public year!: number | null;
    public pages!: string | null;
    public abstract!: string | null;
    public doi!: string | null;
    public keywords!: string[] | null;
    public isActive!: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    // Associations
    public readonly conference?: any;

    static initialize(sequelize: any) {
        ConferenceArticle.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                conferenceId: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'conferences',
                        key: 'id',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                },
                title: {
                    type: DataTypes.STRING(600),
                    allowNull: false,
                },
                authors: {
                    type: DataTypes.JSON,
                    allowNull: false,
                    defaultValue: [],
                },
                year: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                },
                pages: {
                    type: DataTypes.STRING(20),
                    allowNull: true,
                },
                abstract: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                doi: {
                    type: DataTypes.STRING(200),
                    allowNull: true,
                },
                keywords: {
                    type: DataTypes.JSON,
                    allowNull: true,
                    defaultValue: null,
                },
                isActive: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: true,
                },
            },
            {
                sequelize,
                tableName: 'conference_articles',
                timestamps: true,
                indexes: [
                    { fields: ['conferenceId'] },
                    { fields: ['isActive'] },
                    { fields: ['year'] },
                ],
            }
        );

        return ConferenceArticle;
    }

    static associate(models: any) {
        ConferenceArticle.belongsTo(models.Conference, {
            foreignKey: 'conferenceId',
            as: 'conference',
        });
    }
}

export default ConferenceArticle;
