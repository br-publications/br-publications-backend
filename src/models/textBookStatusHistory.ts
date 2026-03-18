import { DataTypes, Model, Optional } from 'sequelize';
import { TextBookStatus } from './textBookSubmission';

// Attributes interface
export interface TextBookStatusHistoryAttributes {
    id: number;
    submissionId: number;
    previousStatus: TextBookStatus | null;
    newStatus: TextBookStatus;
    changedBy: number;
    notes: string | null;
    changedAt: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

// Creation attributes
export interface TextBookStatusHistoryCreationAttributes
    extends Optional<
        TextBookStatusHistoryAttributes,
        'id' | 'previousStatus' | 'notes' | 'createdAt' | 'updatedAt'
    > { }

// Model class
class TextBookStatusHistory
    extends Model<TextBookStatusHistoryAttributes, TextBookStatusHistoryCreationAttributes>
    implements TextBookStatusHistoryAttributes {
    public id!: number;
    public submissionId!: number;
    public previousStatus!: TextBookStatus | null;
    public newStatus!: TextBookStatus;
    public changedBy!: number;
    public notes!: string | null;
    public changedAt!: Date;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    // Associations
    public user?: any;

    // Instance methods
    public getStatusChange(): string {
        const prev = this.previousStatus || 'None';
        return `${prev} → ${this.newStatus}`;
    }

    // Static method to initialize the model
    static initialize(sequelize: any) {
        TextBookStatusHistory.init(
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
                previousStatus: {
                    type: DataTypes.ENUM(...Object.values(TextBookStatus)),
                    allowNull: true
                },
                newStatus: {
                    type: DataTypes.ENUM(...Object.values(TextBookStatus)),
                    allowNull: false
                },
                changedBy: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'users',
                        key: 'id'
                    }
                },
                notes: {
                    type: DataTypes.TEXT,
                    allowNull: true
                },
                changedAt: {
                    type: DataTypes.DATE,
                    allowNull: false,
                    defaultValue: DataTypes.NOW
                }
            },
            {
                sequelize,
                tableName: 'text_book_status_history',
                timestamps: true
            }
        );
        return TextBookStatusHistory;
    }

    // Define associations
    static associate(models: any) {
        TextBookStatusHistory.belongsTo(models.TextBookSubmission, {
            foreignKey: 'submissionId',
            as: 'submission'
        });

        TextBookStatusHistory.belongsTo(models.User, {
            foreignKey: 'changedBy',
            as: 'changedByUser'
        });
    }
}

export default TextBookStatusHistory;
