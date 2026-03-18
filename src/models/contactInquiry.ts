import { DataTypes, Model, Optional } from 'sequelize';

export enum InquiryStatus {
    PENDING = 'PENDING',
    ACKNOWLEDGED = 'ACKNOWLEDGED'
}

export interface ContactInquiryAttributes {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    message: string;
    status: InquiryStatus;
    adminNotes: string | null;
    reviewedBy: number | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ContactInquiryCreationAttributes
    extends Optional<
        ContactInquiryAttributes,
        'id' | 'phone' | 'status' | 'adminNotes' | 'reviewedBy' | 'createdAt' | 'updatedAt'
    > { }

class ContactInquiry
    extends Model<ContactInquiryAttributes, ContactInquiryCreationAttributes>
    implements ContactInquiryAttributes {
    public id!: number;
    public name!: string;
    public email!: string;
    public phone!: string | null;
    public message!: string;
    public status!: InquiryStatus;
    public adminNotes!: string | null;
    public reviewedBy!: number | null;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static initialize(sequelize: any) {
        ContactInquiry.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                name: {
                    type: DataTypes.STRING(200),
                    allowNull: false,
                },
                email: {
                    type: DataTypes.STRING(255),
                    allowNull: false,
                },
                phone: {
                    type: DataTypes.STRING(50),
                    allowNull: true,
                },
                message: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                status: {
                    type: DataTypes.ENUM(...Object.values(InquiryStatus)),
                    allowNull: false,
                    defaultValue: InquiryStatus.PENDING,
                },
                adminNotes: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                reviewedBy: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    references: {
                        model: 'users',
                        key: 'id',
                    },
                    onDelete: 'SET NULL',
                },
            },
            {
                sequelize,
                tableName: 'contact_inquiries',
                timestamps: true,
                underscored: true,
            }
        );
        return ContactInquiry;
    }

    static associate(models: any) {
        ContactInquiry.belongsTo(models.User, {
            foreignKey: 'reviewedBy',
            as: 'reviewer',
        });
    }
}

export default ContactInquiry;
