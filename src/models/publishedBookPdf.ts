import { DataTypes, Model } from 'sequelize';
import PublishedBook from './publishedBook';

export interface PublishedBookPdfAttributes {
    id: number;
    bookId: number;
    pdfData: Buffer;
    createdAt?: Date;
    updatedAt?: Date;
}

interface PublishedBookPdfCreationAttributes extends Omit<PublishedBookPdfAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class PublishedBookPdf extends Model<PublishedBookPdfAttributes, PublishedBookPdfCreationAttributes> implements PublishedBookPdfAttributes {
    public id!: number;
    public bookId!: number;
    public pdfData!: Buffer;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static initialize(sequelize: any) {
        PublishedBookPdf.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                bookId: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    field: 'book_id',
                    references: {
                        model: 'published_books',
                        key: 'id',
                    },
                    onDelete: 'CASCADE',
                    onUpdate: 'CASCADE'
                },
                pdfData: {
                    type: DataTypes.BLOB('long'),
                    allowNull: false,
                    field: 'pdf_data',
                },
                createdAt: {
                    type: DataTypes.DATE,
                    field: 'created_at',
                },
                updatedAt: {
                    type: DataTypes.DATE,
                    field: 'updated_at',
                }
            },
            {
                sequelize,
                tableName: 'published_book_pdfs',
                timestamps: true,
            }
        );

        return PublishedBookPdf;
    }

    static associate(models: any) {
        PublishedBookPdf.belongsTo(models.PublishedBook, {
            foreignKey: 'bookId',
            as: 'publishedBook',
        });
        
        // Also add the reverse association in PublishedBook (if we need it, though mostly we query PublishedBookPdf directly)
        // models.PublishedBook.hasOne(PublishedBookPdf, {
        //     foreignKey: 'bookId',
        //     as: 'pdf',
        // });
    }
}

export default PublishedBookPdf;
