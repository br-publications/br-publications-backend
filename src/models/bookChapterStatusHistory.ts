import { DataTypes, Model, Optional } from 'sequelize';

interface BookChapterStatusHistoryAttributes {
  id: number;
  submissionId: number;
  previousStatus: string | null;
  newStatus: string;
  changedBy: number;
  action: string;
  notes: string | null;
  metadata: Record<string, any> | null;
  changedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface BookChapterStatusHistoryCreationAttributes extends Optional<
  BookChapterStatusHistoryAttributes,
  'id' | 'previousStatus' | 'notes' | 'metadata' | 'changedAt'
> { }

class BookChapterStatusHistory extends Model<
  BookChapterStatusHistoryAttributes,
  BookChapterStatusHistoryCreationAttributes
> implements BookChapterStatusHistoryAttributes {
  public id!: number;
  public submissionId!: number;
  public previousStatus!: string | null;
  public newStatus!: string;
  public changedBy!: number;
  public action!: string;
  public notes!: string | null;
  public metadata!: Record<string, any> | null;
  public changedAt!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Instance method to get formatted date
  public getFormattedDate(): string {
    return this.changedAt.toLocaleString();
  }

  // Instance method to check if status improved
  public isImprovement(): boolean {
    const positiveStatuses = [
      'MANUSCRIPTS_PENDING',
      'UNDER_REVIEW',
      'EDITORIAL_REVIEW',
      'APPROVED',
      'ISBN_APPLIED',
      'PUBLICATION_IN_PROGRESS',
      'PUBLISHED',
    ];

    return positiveStatuses.includes(this.newStatus);
  }

  // Instance method to check if status is negative
  public isNegative(): boolean {
    const negativeStatuses = ['REJECTED'];
    return negativeStatuses.includes(this.newStatus);
  }

  // Static method to initialize the model
  static initialize(sequelize: any) {
    BookChapterStatusHistory.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        submissionId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'book_chapter_submissions',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        previousStatus: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        newStatus: {
          type: DataTypes.STRING(50),
          allowNull: false,
          validate: {
            notEmpty: { msg: 'New status is required' },
          },
        },
        changedBy: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        action: {
          type: DataTypes.STRING(100),
          allowNull: false,
          validate: {
            notEmpty: { msg: 'Action is required' },
          },
        },
        notes: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        metadata: {
          type: DataTypes.JSON,
          allowNull: true,
        },
        changedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        tableName: 'book_chapter_status_history',
        timestamps: true,
        hooks: {
          beforeCreate: async (history: BookChapterStatusHistory) => {
            if (!history.changedAt) {
              history.changedAt = new Date();
            }
          },
        },
      }
    );

    return BookChapterStatusHistory;
  }

  // Define associations
  static associate(models: any) {
    // History belongs to a submission
    BookChapterStatusHistory.belongsTo(models.BookChapterSubmission, {
      foreignKey: 'submissionId',
      as: 'submission',
    });

    // History belongs to a user who made the change
    BookChapterStatusHistory.belongsTo(models.User, {
      foreignKey: 'changedBy',
      as: 'changedByUser',
    });
  }
}

export default BookChapterStatusHistory;
