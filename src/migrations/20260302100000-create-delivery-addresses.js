'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('delivery_addresses', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            textBookSubmissionId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'text_book_submissions',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            bookChapterSubmissionId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'book_chapter_submissions',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            fullName: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },
            companyName: {
                type: Sequelize.STRING(255),
                allowNull: true,
            },
            contactPersonName: {
                type: Sequelize.STRING(255),
                allowNull: true,
            },
            countryCode: {
                type: Sequelize.STRING(10),
                allowNull: false,
            },
            mobileNumber: {
                type: Sequelize.STRING(20),
                allowNull: false,
            },
            altCountryCode: {
                type: Sequelize.STRING(10),
                allowNull: true,
            },
            altMobileNumber: {
                type: Sequelize.STRING(20),
                allowNull: true,
            },
            email: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },
            addressLine1: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },
            buildingName: {
                type: Sequelize.STRING(255),
                allowNull: true,
            },
            streetName: {
                type: Sequelize.STRING(255),
                allowNull: true,
            },
            area: {
                type: Sequelize.STRING(255),
                allowNull: true,
            },
            landmark: {
                type: Sequelize.STRING(255),
                allowNull: true,
            },
            city: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },
            state: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },
            postalCode: {
                type: Sequelize.STRING(50),
                allowNull: false,
            },
            country: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },
            isResidential: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
            customsConfirmed: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            deliveryInstructions: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            preferredCourier: {
                type: Sequelize.STRING(100),
                allowNull: true,
            },
            shippingType: {
                type: Sequelize.STRING(100),
                allowNull: true,
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
            }
        });

        // Add indexes
        await queryInterface.addIndex('delivery_addresses', ['textBookSubmissionId']);
        await queryInterface.addIndex('delivery_addresses', ['bookChapterSubmissionId']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('delivery_addresses');
    }
};
