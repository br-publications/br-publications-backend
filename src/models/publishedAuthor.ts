import { DataTypes, Model, Optional } from 'sequelize';

export interface PublishedAuthorAttributes {
    id: number;
    name: string;
    email: string | null;
    affiliation: string | null;
    biography: string | null;
    userId: number | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface PublishedAuthorCreationAttributes extends Optional<PublishedAuthorAttributes, 'id'> {}

class PublishedAuthor extends Model<PublishedAuthorAttributes, PublishedAuthorCreationAttributes> implements PublishedAuthorAttributes {
    public id!: number;
    public name!: string;
    public email!: string | null;
    public affiliation!: string | null;
    public biography!: string | null;
    public userId!: number | null;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static initialize(sequelize: any) {
        PublishedAuthor.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                name: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                },
                email: {
                    type: DataTypes.STRING(255),
                    allowNull: true,
                },
                affiliation: {
                    type: DataTypes.STRING(500),
                    allowNull: true,
                },
                biography: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                userId: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    field: 'user_id',
                    references: {
                        model: 'users',
                        key: 'id',
                    },
                },
            },
            {
                sequelize,
                tableName: 'published_authors',
                timestamps: true,
                underscored: true,
            }
        );
        return PublishedAuthor;
    }

    static associate(models: any) {
        if (models.User) {
            PublishedAuthor.belongsTo(models.User, {
                foreignKey: 'userId',
                as: 'user',
            });
        }
        if (models.PublishedIndividualChapter) {
            PublishedAuthor.belongsToMany(models.PublishedIndividualChapter, {
                through: 'published_chapter_authors',
                foreignKey: 'published_author_id',
                otherKey: 'published_individual_chapter_id',
                as: 'chapters',
                timestamps: true
            });
        }
    }
}

export default PublishedAuthor;
