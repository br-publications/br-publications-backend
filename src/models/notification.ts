import { DataTypes, Model, Optional } from 'sequelize';

export enum NotificationType {
    INFO = 'INFO',
    SUCCESS = 'SUCCESS',
    WARNING = 'WARNING',
    ERROR = 'ERROR',
    ABSTRACT_ACCEPTED = 'ABSTRACT_ACCEPTED',
    SUBMISSION_RECEIVED = 'SUBMISSION_RECEIVED'
}

export enum NotificationCategory {
    SUBMISSION = 'SUBMISSION',
    REVIEW = 'REVIEW',
    DISCUSSION = 'DISCUSSION',
    SYSTEM = 'SYSTEM',
    SUBMISSION_UPDATE = 'SUBMISSION_UPDATE',
    TEXTBOOK_SUBMISSION = 'TEXTBOOK_SUBMISSION',
    TEXTBOOK_REVISION = 'TEXTBOOK_REVISION',
    TEXTBOOK_DECISION = 'TEXTBOOK_DECISION',
    TEXTBOOK_PUBLISHING = 'TEXTBOOK_PUBLISHING'
}

interface NotificationAttributes {
    id: number;
    recipientId: number;
    senderId?: number; // Optional, null for system notifications
    type: NotificationType;
    category: NotificationCategory;
    title: string;
    message: string;
    relatedEntityId?: number; // e.g., Submission ID
    relatedEntityType?: string; // 'BookChapterSubmission', 'Discussion', etc.
    isRead: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

interface NotificationCreationAttributes extends Optional<NotificationAttributes, 'id' | 'senderId' | 'relatedEntityId' | 'relatedEntityType' | 'isRead' | 'createdAt' | 'updatedAt'> { }

class Notification extends Model<NotificationAttributes, NotificationCreationAttributes> implements NotificationAttributes {
    public id!: number;
    public recipientId!: number;
    public senderId?: number;
    public type!: NotificationType;
    public category!: NotificationCategory;
    public title!: string;
    public message!: string;
    public relatedEntityId?: number;
    public relatedEntityType?: string;
    public isRead!: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static initialize(sequelize: any) {
        Notification.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                recipientId: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'users',
                        key: 'id',
                    },
                    onDelete: 'CASCADE',
                },
                senderId: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    references: {
                        model: 'users',
                        key: 'id',
                    },
                    onDelete: 'SET NULL',
                },
                type: {
                    type: DataTypes.ENUM(...Object.values(NotificationType)),
                    allowNull: false,
                    defaultValue: NotificationType.INFO,
                },
                category: {
                    type: DataTypes.ENUM(...Object.values(NotificationCategory)),
                    allowNull: false,
                    defaultValue: NotificationCategory.SYSTEM,
                },
                title: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                message: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                relatedEntityId: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                },
                relatedEntityType: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                isRead: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
                },
            },
            {
                sequelize,
                tableName: 'notifications',
                timestamps: true,
            }
        );

        return Notification;
    }

    static associate(models: any) {
        // Belongs to recipient (User)
        Notification.belongsTo(models.User, {
            foreignKey: 'recipientId',
            as: 'recipient',
        });

        // Belongs to sender (User)
        Notification.belongsTo(models.User, {
            foreignKey: 'senderId',
            as: 'sender',
        });
    }
}

export default Notification;
