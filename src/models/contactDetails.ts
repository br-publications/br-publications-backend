import { DataTypes, Model, Optional } from 'sequelize';

interface ContactDetailsAttributes {
    id: number;
    phoneNumbers: string[];
    email: string;
    officeAddress: string;
    timings: string;
    whatsapp: string;
    facebook: string;
    twitter: string;
    linkedin: string;
    instagram: string;
    createdAt?: Date;
    updatedAt?: Date;
}

interface ContactDetailsCreationAttributes extends Optional<ContactDetailsAttributes, 'id'> { }

class ContactDetails extends Model<ContactDetailsAttributes, ContactDetailsCreationAttributes> implements ContactDetailsAttributes {
    public id!: number;
    public phoneNumbers!: string[];
    public email!: string;
    public officeAddress!: string;
    public timings!: string;
    public whatsapp!: string;
    public facebook!: string;
    public twitter!: string;
    public linkedin!: string;
    public instagram!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static initialize(sequelize: any) {
        ContactDetails.init({
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            phoneNumbers: {
                type: DataTypes.JSON, // Stores array of strings
                defaultValue: []
            },
            email: DataTypes.STRING,
            officeAddress: DataTypes.TEXT,
            timings: DataTypes.STRING,
            whatsapp: DataTypes.STRING,
            facebook: DataTypes.STRING,
            twitter: DataTypes.STRING,
            linkedin: DataTypes.STRING,
            instagram: DataTypes.STRING
        }, {
            sequelize,
            modelName: 'ContactDetails',
            tableName: 'ContactDetails',
            timestamps: true
        });
        return ContactDetails;
    }
}

export default ContactDetails;
