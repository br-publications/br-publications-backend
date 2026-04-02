import { DataTypes, Model, Optional } from 'sequelize';
import BookChapterSubmission from './bookChapterSubmission';
import User from './user';

// Enum for file types
export enum BookChapterFileType {
  INITIAL_MANUSCRIPT = 'initial_manuscript',
  FULL_CHAPTER = 'full_chapter',
  REVISION_1 = 'revision_1',
  REVISION_2 = 'revision_2',
  REVISION_3 = 'revision_3',
  FINAL_APPROVED = 'final_approved',
  PROOF_DOCUMENT = 'proof_document',
}

interface BookChapterFileAttributes {
  id: number;
  submissionId: number;
  fileType: BookChapterFileType;
  fileName: string;
  fileData: Buffer; // Store file directly in database
  fileUrl: string | null; // Optional URL for external storage
  fileSize: number; // in bytes
  mimeType: string;
  uploadedBy: number;
  uploadDate: Date;
  description: string | null;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface BookChapterFileCreationAttributes extends Optional<
  BookChapterFileAttributes,
  'id' | 'uploadDate' | 'description' | 'isActive' | 'fileUrl'
> {}

class BookChapterFile extends Model<
  BookChapterFileAttributes,
  BookChapterFileCreationAttributes
> implements BookChapterFileAttributes {
  public id!: number;
  public submissionId!: number;
  public fileType!: BookChapterFileType;
  public fileName!: string;
  public fileData!: Buffer;
  public fileUrl!: string | null;
  public fileSize!: number;
  public mimeType!: string;
  public uploadedBy!: number;
  public uploadDate!: Date;
  public description!: string | null;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association properties - added by Sequelize
  public readonly submission?: BookChapterSubmission;
  public readonly uploader?: User;

  // Instance method to get human-readable file size
  public getFormattedFileSize(): string {
    const bytes = this.fileSize;
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  // Instance method to check if file is PDF
  public isPDF(): boolean {
    return this.mimeType === 'application/pdf';
  }

  // Instance method to check if file is Word document
  public isWordDocument(): boolean {
    const wordMimeTypes = [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    return wordMimeTypes.includes(this.mimeType);
  }

  // Instance method to get file extension
  public getFileExtension(): string {
    return this.fileName.split('.').pop()?.toLowerCase() || '';
  }

  // Instance method to get display name
  public getDisplayName(): string {
    const typeNames: Record<BookChapterFileType, string> = {
      [BookChapterFileType.INITIAL_MANUSCRIPT]: 'Initial Manuscript',
      [BookChapterFileType.FULL_CHAPTER]: 'Full Chapter',
      [BookChapterFileType.REVISION_1]: 'Revision 1',
      [BookChapterFileType.REVISION_2]: 'Revision 2',
      [BookChapterFileType.REVISION_3]: 'Revision 3',
      [BookChapterFileType.FINAL_APPROVED]: 'Final Approved Version',
      [BookChapterFileType.PROOF_DOCUMENT]: 'Proof Document',
    };
    return typeNames[this.fileType] || this.fileType;
  }

  // Instance method to get file as base64 for download
  public getBase64(): string {
    return this.fileData.toString('base64');
  }

  // Static method to initialize the model
  static initialize(sequelize: any) {
    BookChapterFile.init(
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
        fileType: {
          type: DataTypes.ENUM(...Object.values(BookChapterFileType)),
          allowNull: false,
          validate: {
            notEmpty: { msg: 'File type is required' },
          },
        },
        fileName: {
          type: DataTypes.STRING(255),
          allowNull: false,
          validate: {
            notEmpty: { msg: 'File name is required' },
          },
        },
        fileData: {
          type: DataTypes.BLOB('long'), // Store binary data
          allowNull: false,
          validate: {
            notEmpty: { msg: 'File data is required' },
          },
        },
        fileUrl: {
          type: DataTypes.STRING(500),
          allowNull: true, // Optional if using database storage
        },
        fileSize: {
          type: DataTypes.BIGINT,
          allowNull: false,
          validate: {
            min: {
              args: [0],
              msg: 'File size cannot be negative',
            },
          },
        },
        mimeType: {
          type: DataTypes.STRING(100),
          allowNull: false,
          validate: {
            notEmpty: { msg: 'MIME type is required' },
          },
        },
        uploadedBy: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        uploadDate: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        isActive: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'book_chapter_files',
        timestamps: true,
        hooks: {
          beforeCreate: async (file: BookChapterFile) => {
            if (!file.uploadDate) {
              file.uploadDate = new Date();
            }
          },
        },
      }
    );

    return BookChapterFile;
  }

  // Define associations
  static associate(models: any) {
    // File belongs to a submission
    BookChapterFile.belongsTo(models.BookChapterSubmission, {
      foreignKey: 'submissionId',
      as: 'submission',
    });

    // File belongs to a user who uploaded it
    BookChapterFile.belongsTo(models.User, {
      foreignKey: 'uploadedBy',
      as: 'uploader',
    });
  }
}

export default BookChapterFile;
