import { DataTypes, Model, Optional } from 'sequelize';

export interface OptionalDeliveryAddressAttributes {
    id: number;
    textBookSubmissionId: number | null;
    bookChapterSubmissionId: number | null;
    fullName: string;
    companyName: string | null;
    contactPersonName: string | null;
    countryCode: string;
    mobileNumber: string;
    altCountryCode: string | null;
    altMobileNumber: string | null;
    email: string;
    addressLine1: string;
    buildingName: string | null;
    streetName: string | null;
    area: string | null;
    landmark: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isResidential: boolean;
    deliveryInstructions: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface OptionalDeliveryAddressCreationAttributes extends Optional<OptionalDeliveryAddressAttributes, 'id' | 'companyName' | 'contactPersonName' | 'altCountryCode' | 'altMobileNumber' | 'buildingName' | 'streetName' | 'area' | 'landmark' | 'deliveryInstructions' | 'textBookSubmissionId' | 'bookChapterSubmissionId' | 'createdAt' | 'updatedAt'> { }

class OptionalDeliveryAddress extends Model<OptionalDeliveryAddressAttributes, OptionalDeliveryAddressCreationAttributes> implements OptionalDeliveryAddressAttributes {
    public id!: number;
    public textBookSubmissionId!: number | null;
    public bookChapterSubmissionId!: number | null;
    public fullName!: string;
    public companyName!: string | null;
    public contactPersonName!: string | null;
    public countryCode!: string;
    public mobileNumber!: string;
    public altCountryCode!: string | null;
    public altMobileNumber!: string | null;
    public email!: string;
    public addressLine1!: string;
    public buildingName!: string | null;
    public streetName!: string | null;
    public area!: string | null;
    public landmark!: string | null;
    public city!: string;
    public state!: string;
    public postalCode!: string;
    public country!: string;
    public isResidential!: boolean;
    public deliveryInstructions!: string | null;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static initialize(sequelize: any) {
        OptionalDeliveryAddress.init({
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            textBookSubmissionId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'text_book_submissions',
                    key: 'id',
                }
            },
            bookChapterSubmissionId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'book_chapter_submissions',
                    key: 'id',
                }
            },
            fullName: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            companyName: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            contactPersonName: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            countryCode: {
                type: DataTypes.STRING(10),
                allowNull: true,
            },
            mobileNumber: {
                type: DataTypes.STRING(20),
                allowNull: true,
            },
            altCountryCode: {
                type: DataTypes.STRING(10),
                allowNull: true,
            },
            altMobileNumber: {
                type: DataTypes.STRING(20),
                allowNull: true,
            },
            email: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            addressLine1: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            buildingName: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            streetName: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            area: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            landmark: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            city: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            state: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            postalCode: {
                type: DataTypes.STRING(50),
                allowNull: true,
            },
            country: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            isResidential: {
                type: DataTypes.BOOLEAN,
                allowNull: true,
                defaultValue: true
            },
            deliveryInstructions: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
        }, {
            sequelize,
            tableName: 'optional_delivery_addresses',
            timestamps: true,
        });
        return OptionalDeliveryAddress;
    }

    static associate(models: any) {
        OptionalDeliveryAddress.belongsTo(models.TextBookSubmission, {
            foreignKey: 'textBookSubmissionId',
            as: 'textBookSubmission',
        });
        OptionalDeliveryAddress.belongsTo(models.BookChapterSubmission, {
            foreignKey: 'bookChapterSubmissionId',
            as: 'bookChapterSubmission',
        });
    }
}

export default OptionalDeliveryAddress;
