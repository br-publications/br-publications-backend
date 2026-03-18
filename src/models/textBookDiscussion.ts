import { DataTypes, Model, Optional } from 'sequelize';

// Attributes interface
export interface TextBookDiscussionAttributes {
    id: number;
    submissionId: number;
    senderId: number;
    message: string;
    createdAt?: Date;
    updatedAt?: Date;
}

// Creation attributes
export interface TextBookDiscussionCreationAttributes
    extends Optional<TextBookDiscussionAttributes, 'id' | 'createdAt' | 'updatedAt'> { }

// Model class
class TextBookDiscussion
    extends Model<TextBookDiscussionAttributes, TextBookDiscussionCreationAttributes>
    implements TextBookDiscussionAttributes {
    public id!: number;
    public submissionId!: number;
    public senderId!: number;
    public message!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    // Associations
    public sender?: any;
    public submission?: any;

    // Instance methods
    public getTimeSince(): string {
        const now = new Date();
        const diff = now.getTime() - this.createdAt.getTime();
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    }

    // Static method to initialize the model
    static initialize(sequelize: any) {
        TextBookDiscussion.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true
                },
                submissionId: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'text_book_submissions',
                        key: 'id'
                    }
                },
                senderId: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'users',
                        key: 'id'
                    }
                },
                message: {
                    type: DataTypes.TEXT,
                    allowNull: false
                }
            },
            {
                sequelize,
                tableName: 'text_book_discussions',
                timestamps: true
            }
        );
        return TextBookDiscussion;
    }

    // Define associations
    static associate(models: any) {
        TextBookDiscussion.belongsTo(models.TextBookSubmission, {
            foreignKey: 'submissionId',
            as: 'submission'
        });

        TextBookDiscussion.belongsTo(models.User, {
            foreignKey: 'senderId',
            as: 'sender'
        });
    }
}

export default TextBookDiscussion;
