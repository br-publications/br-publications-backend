import { DataTypes, Model, Optional } from 'sequelize';

export enum SubmissionType {
    WEB = 'WEB',
    MOBILE = 'MOBILE',
    INTERNSHIP = 'INTERNSHIP'
}

export enum SubmissionStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED'
}

export interface ProjectInternshipSubmissionAttributes {
    id: number;
    submittedBy: number;
    submissionType: SubmissionType;
    status: SubmissionStatus;
    data: any; // JSON field for form-specific data
    adminNotes: string | null;
    applicationId: string | null;
    reviewedBy: number | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ProjectInternshipSubmissionCreationAttributes
    extends Optional<
        ProjectInternshipSubmissionAttributes,
        'id' | 'status' | 'adminNotes' | 'applicationId' | 'reviewedBy' | 'createdAt' | 'updatedAt'
    > { }

class ProjectInternshipSubmission
    extends Model<ProjectInternshipSubmissionAttributes, ProjectInternshipSubmissionCreationAttributes>
    implements ProjectInternshipSubmissionAttributes {
    public id!: number;
    public submittedBy!: number;
    public submissionType!: SubmissionType;
    public status!: SubmissionStatus;
    public data!: any;
    public adminNotes!: string | null;
    public applicationId!: string | null;
    public reviewedBy!: number | null;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static initialize(sequelize: any) {
        ProjectInternshipSubmission.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                submittedBy: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'users',
                        key: 'id',
                    },
                },
                submissionType: {
                    type: DataTypes.ENUM(...Object.values(SubmissionType)),
                    allowNull: false,
                },
                status: {
                    type: DataTypes.ENUM(...Object.values(SubmissionStatus)),
                    allowNull: false,
                    defaultValue: SubmissionStatus.PENDING,
                },
                data: {
                    type: DataTypes.JSON,
                    allowNull: false,
                },
                adminNotes: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                applicationId: {
                    type: DataTypes.STRING(20),
                    allowNull: true,
                    unique: true,
                },
                reviewedBy: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    references: {
                        model: 'users',
                        key: 'id',
                    },
                },
            },
            {
                sequelize,
                tableName: 'project_internship_submissions',
                timestamps: true,
            }
        );
        return ProjectInternshipSubmission;
    }

    static associate(models: any) {
        ProjectInternshipSubmission.belongsTo(models.User, {
            foreignKey: 'submittedBy',
            as: 'applicant',
        });
        ProjectInternshipSubmission.belongsTo(models.User, {
            foreignKey: 'reviewedBy',
            as: 'reviewer',
        });
    }
}

export default ProjectInternshipSubmission;
