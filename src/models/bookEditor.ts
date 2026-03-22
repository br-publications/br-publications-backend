import { DataTypes, Model, Optional } from 'sequelize';

interface BookEditorAttributes {
    id: number;
    bookTitleId: number;
    editorId: number;
    assignedBy: number;
    assignedAt: Date;
    isPrimary: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

interface BookEditorCreationAttributes extends Optional<
    BookEditorAttributes,
    'id' | 'assignedAt' | 'isPrimary'
> { }

class BookEditor extends Model<
    BookEditorAttributes,
    BookEditorCreationAttributes
> implements BookEditorAttributes {
    public id!: number;
    public bookTitleId!: number;
    public editorId!: number;
    public assignedBy!: number;
    public assignedAt!: Date;
    public isPrimary!: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    // Associations
    public readonly bookTitle?: any;
    public readonly editor?: any;
    public readonly assigner?: any;

    // Instance method to get assignment details
    public async getAssignmentDetails(): Promise<any> {
        const BookTitle = require('./bookTitle').default;
        const User = require('./user').default;

        const bookTitle = await BookTitle.findByPk(this.bookTitleId);
        const editor = await User.findByPk(this.editorId);
        const assigner = await User.findByPk(this.assignedBy);

        return {
            id: this.id,
            bookTitle: bookTitle?.title,
            editor: {
                id: editor?.id,
                userId: editor?.userId,
                fullName: editor?.fullName,
                email: editor?.email,
            },
            assignedBy: {
                id: assigner?.id,
                fullName: assigner?.fullName,
            },
            assignedAt: this.assignedAt,
        };
    }

    // Static method to check if editor is already assigned to book
    static async isEditorAssigned(
        bookTitleId: number,
        editorId: number
    ): Promise<boolean> {
        const assignment = await BookEditor.findOne({
            where: { bookTitleId, editorId },
        });
        return assignment !== null;
    }

    // Static method to validate editor role
    static async validateEditor(editorId: number): Promise<boolean> {
        const User = require('./user').default;
        const { UserRole } = require('./user');

        const user = await User.findByPk(editorId);
        return user && user.role === UserRole.EDITOR;
    }

    // Static method to initialize the model
    static initialize(sequelize: any) {
        BookEditor.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                bookTitleId: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'book_titles',
                        key: 'id',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                },
                editorId: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'users',
                        key: 'id',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                },
                assignedBy: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'users',
                        key: 'id',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'RESTRICT',
                },
                assignedAt: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW,
                },
                isPrimary: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
                },
            },
            {
                sequelize,
                tableName: 'book_editors',
                timestamps: true,
                indexes: [
                    {
                        unique: true,
                        fields: ['bookTitleId', 'editorId'],
                        name: 'unique_editor_per_book',
                    },
                    {
                        fields: ['bookTitleId'],
                    },
                    {
                        fields: ['editorId'],
                    },
                    {
                        fields: ['assignedBy'],
                    },
                ],
                hooks: {
                    beforeCreate: async (assignment: BookEditor) => {
                        // Validate that the user has editor role
                        const isValidEditor = await BookEditor.validateEditor(
                            assignment.editorId
                        );
                        if (!isValidEditor) {
                            throw new Error('User must have editor role to be assigned');
                        }

                        // Check for duplicate assignment
                        const isDuplicate = await BookEditor.isEditorAssigned(
                            assignment.bookTitleId,
                            assignment.editorId
                        );
                        if (isDuplicate) {
                            throw new Error('Editor is already assigned to this book');
                        }
                    },
                },
            }
        );

        return BookEditor;
    }

    // Define associations
    static associate(models: any) {
        // Belongs to book title
        BookEditor.belongsTo(models.BookTitle, {
            foreignKey: 'bookTitleId',
            as: 'bookTitle',
        });

        // Belongs to editor (User)
        BookEditor.belongsTo(models.User, {
            foreignKey: 'editorId',
            as: 'editor',
        });

        // Belongs to assigner (User)
        BookEditor.belongsTo(models.User, {
            foreignKey: 'assignedBy',
            as: 'assigner',
        });
    }
}

export default BookEditor;
