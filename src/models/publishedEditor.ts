import { DataTypes, Model, Optional } from 'sequelize';

export interface PublishedEditorAttributes {
    id: number;
    name: string;
    email: string | null;
    affiliation: string | null;
    biography: string | null;
    userId: number | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface PublishedEditorCreationAttributes extends Optional<PublishedEditorAttributes, 'id'> {}

class PublishedEditor extends Model<PublishedEditorAttributes, PublishedEditorCreationAttributes> implements PublishedEditorAttributes {
    public id!: number;
    public name!: string;
    public email!: string | null;
    public affiliation!: string | null;
    public biography!: string | null;
    public userId!: number | null;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static initialize(sequelize: any) {
        PublishedEditor.init(
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
                tableName: 'published_editors',
                timestamps: true,
                underscored: true,
            }
        );
        return PublishedEditor;
    }

    static associate(models: any) {
        if (models.User) {
            PublishedEditor.belongsTo(models.User, {
                foreignKey: 'userId',
                as: 'user',
            });
        }
        if (models.PublishedBookChapter) {
            PublishedEditor.belongsToMany(models.PublishedBookChapter, {
                through: 'published_book_editors',
                foreignKey: 'published_editor_id',
                otherKey: 'published_book_chapter_id',
                as: 'books',
                timestamps: true
            });
        }
    }
}

export default PublishedEditor;
