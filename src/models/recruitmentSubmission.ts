import { DataTypes, Model, Optional } from 'sequelize';

export enum RecruitmentStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED'
}

export enum AppliedRole {
    EDITOR = 'editor',
    REVIEWER = 'reviewer'
}

export interface RecruitmentSubmissionAttributes {
    id: number;
    submittedBy: number;
    firstName: string;
    lastName: string;
    designation: string;
    department: string;
    instituteName: string;
    email: string;
    phoneNumber: string;
    city: string;
    state: string;
    country: string;
    highestQualification: string;
    scopusId: string | null;
    biography: string | null;
    personalImage: string | null;
    appliedRole: AppliedRole;
    status: RecruitmentStatus;
    reviewedBy: number | null;
    adminNotes: string | null;
    applicationId: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface RecruitmentSubmissionCreationAttributes
    extends Optional<
        RecruitmentSubmissionAttributes,
        'id' | 'status' | 'reviewedBy' | 'adminNotes' | 'personalImage' | 'applicationId' | 'scopusId' | 'biography' | 'createdAt' | 'updatedAt'
    > { }

class RecruitmentSubmission
    extends Model<RecruitmentSubmissionAttributes, RecruitmentSubmissionCreationAttributes>
    implements RecruitmentSubmissionAttributes {
    public id!: number;
    public submittedBy!: number;
    public firstName!: string;
    public lastName!: string;
    public designation!: string;
    public department!: string;
    public instituteName!: string;
    public email!: string;
    public phoneNumber!: string;
    public city!: string;
    public state!: string;
    public country!: string;
    public highestQualification!: string;
    public scopusId!: string | null;
    public biography!: string | null;
    public personalImage!: string | null;
    public appliedRole!: AppliedRole;
    public status!: RecruitmentStatus;
    public reviewedBy!: number | null;
    public adminNotes!: string | null;
    public applicationId!: string | null;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static initialize(sequelize: any) {
        RecruitmentSubmission.init(
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
                firstName: {
                    type: DataTypes.STRING(100),
                    allowNull: false,
                },
                lastName: {
                    type: DataTypes.STRING(100),
                    allowNull: false,
                },
                designation: {
                    type: DataTypes.STRING(100),
                    allowNull: false,
                },
                department: {
                    type: DataTypes.STRING(100),
                    allowNull: false,
                },
                instituteName: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                },
                email: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                },
                phoneNumber: {
                    type: DataTypes.STRING(20),
                    allowNull: false,
                },
                city: {
                    type: DataTypes.STRING(100),
                    allowNull: false,
                },
                state: {
                    type: DataTypes.STRING(100),
                    allowNull: false,
                },
                country: {
                    type: DataTypes.STRING(100),
                    allowNull: false,
                },
                highestQualification: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                },
                scopusId: {
                    type: DataTypes.STRING(255),
                    allowNull: true,
                },
                biography: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                personalImage: {
                    type: DataTypes.TEXT('long'),
                    allowNull: true,
                },
                appliedRole: {
                    type: DataTypes.ENUM(...Object.values(AppliedRole)),
                    allowNull: false,
                },
                status: {
                    type: DataTypes.ENUM(...Object.values(RecruitmentStatus)),
                    allowNull: false,
                    defaultValue: RecruitmentStatus.PENDING,
                },
                reviewedBy: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    references: {
                        model: 'users',
                        key: 'id',
                    },
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
            },
            {
                sequelize,
                tableName: 'recruitment_submissions',
                timestamps: true,
            }
        );
        return RecruitmentSubmission;
    }

    static associate(models: any) {
        RecruitmentSubmission.belongsTo(models.User, {
            foreignKey: 'submittedBy',
            as: 'applicant',
        });
        RecruitmentSubmission.belongsTo(models.User, {
            foreignKey: 'reviewedBy',
            as: 'reviewer',
        });
    }
}

export default RecruitmentSubmission;
