import { Sequelize, DataTypes } from 'sequelize';

const sequelize = new Sequelize(
    'br_publications_development',
    'postgres',
    'admin',
    {
        host: 'localhost',
        port: 5432,
        dialect: 'postgres',
        logging: true,
    }
);

async function createTable() {
    try {
        await sequelize.authenticate();
        console.log('Connected.');

        const queryInterface = sequelize.getQueryInterface();

        console.log('Creating delivery_addresses table...');
        await queryInterface.createTable('delivery_addresses', {
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
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            bookChapterSubmissionId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'book_chapter_submissions',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            fullName: {
                type: DataTypes.STRING(255),
                allowNull: false,
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
                allowNull: false,
            },
            mobileNumber: {
                type: DataTypes.STRING(20),
                allowNull: false,
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
                allowNull: false,
            },
            addressLine1: {
                type: DataTypes.STRING(255),
                allowNull: false,
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
                allowNull: false,
            },
            state: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            postalCode: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            country: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            isResidential: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
            customsConfirmed: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            deliveryInstructions: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            preferredCourier: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            shippingType: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            }
        });

        console.log('Adding indexes...');
        await queryInterface.addIndex('delivery_addresses', ['textBookSubmissionId']);
        await queryInterface.addIndex('delivery_addresses', ['bookChapterSubmissionId']);

        console.log('Table created successfully.');

        // Also insert the migration record if we want to mark it as done
        const migrationName = '20260302100000-create-delivery-addresses.js';
        await sequelize.query(
            `INSERT INTO "SequelizeMeta" (name) VALUES ('${migrationName}') ON CONFLICT (name) DO NOTHING`
        );

    } catch (error) {
        console.error('FAILED TO CREATE TABLE:', error);
    } finally {
        await sequelize.close();
    }
}

createTable();
