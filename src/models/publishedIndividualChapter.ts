import { DataTypes, Model, Optional } from 'sequelize';

export interface PublishedIndividualChapterAttributes {
    id: number;
    publishedBookChapterId: number;
    title: string;
    chapterNumber: string | null;
    authors: string | null;
    pagesFrom: string | null;
    pagesTo: string | null;
    pdfKey: string | null;
    pdfName: string | null;
    publishedFileId: string | null;
    abstract: string | null;
    doi?: string | null;
    views: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface PublishedIndividualChapterCreationAttributes extends Optional<PublishedIndividualChapterAttributes, 'id' | 'views'> { }

class PublishedIndividualChapter extends Model<PublishedIndividualChapterAttributes, PublishedIndividualChapterCreationAttributes> implements PublishedIndividualChapterAttributes {
    public id!: number;
    public publishedBookChapterId!: number;
    public title!: string;
    public chapterNumber!: string | null;
    public authors!: string | null;
    public pagesFrom!: string | null;
    public pagesTo!: string | null;
    public pdfKey!: string | null;
    public pdfName!: string | null;
    public publishedFileId!: string | null;
    public abstract!: string | null;
    public doi!: string | null;
    public views!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static initialize(sequelize: any) {
        PublishedIndividualChapter.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                publishedBookChapterId: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    field: 'published_book_chapter_id',
                    references: {
                        model: 'published_book_chapters',
                        key: 'id',
                    },
                },
                title: {
                    type: DataTypes.STRING(500),
                    allowNull: false,
                },
                chapterNumber: {
                    type: DataTypes.STRING(50),
                    allowNull: true,
                    field: 'chapter_number',
                },
                authors: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                pagesFrom: {
                    type: DataTypes.STRING(20),
                    allowNull: true,
                    field: 'pages_from',
                },
                pagesTo: {
                    type: DataTypes.STRING(20),
                    allowNull: true,
                    field: 'pages_to',
                },
                pdfKey: {
                    type: DataTypes.STRING(255),
                    allowNull: true,
                    field: 'pdf_key',
                },
                pdfName: {
                    type: DataTypes.STRING(255),
                    allowNull: true,
                    field: 'pdf_name',
                },
                publishedFileId: {
                    type: DataTypes.UUID,
                    allowNull: true,
                    field: 'published_file_id',
                    references: {
                        model: 'published_files',
                        key: 'id',
                    },
                },
                abstract: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                doi: {
                    type: DataTypes.STRING(255),
                    allowNull: true,
                },
                views: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    defaultValue: 0,
                },
            },
            {
                sequelize,
                tableName: 'published_individual_chapters',
                timestamps: true,
                underscored: true,
            }
        );
        return PublishedIndividualChapter;
    }

    static associate(models: any) {
        if (models.PublishedBookChapter) {
            PublishedIndividualChapter.belongsTo(models.PublishedBookChapter, {
                foreignKey: 'publishedBookChapterId',
                as: 'book',
            });
        }
        if (models.PublishedAuthor) {
            PublishedIndividualChapter.belongsToMany(models.PublishedAuthor, {
                through: 'published_chapter_authors',
                foreignKey: 'published_individual_chapter_id',
                otherKey: 'published_author_id',
                as: 'authorDetails',
                timestamps: true
            });
        }
        if (models.PublishedFile) {
            PublishedIndividualChapter.belongsTo(models.PublishedFile, {
                foreignKey: 'publishedFileId',
                as: 'file',
            });
        }
    }
}

export default PublishedIndividualChapter;
