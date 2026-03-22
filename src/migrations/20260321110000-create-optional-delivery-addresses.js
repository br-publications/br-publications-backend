'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('optional_delivery_addresses', {
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
                allowNull: true,
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
                allowNull: true,
            },
            mobileNumber: {
                type: Sequelize.STRING(20),
                allowNull: true,
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
                allowNull: true,
            },
            addressLine1: {
                type: Sequelize.STRING(255),
                allowNull: true,
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
                allowNull: true,
            },
            state: {
                type: Sequelize.STRING(100),
                allowNull: true,
            },
            postalCode: {
                type: Sequelize.STRING(50),
                allowNull: true,
            },
            country: {
                type: Sequelize.STRING(100),
                allowNull: true,
            },
            isResidential: {
                type: Sequelize.BOOLEAN,
                allowNull: true,
                defaultValue: true
            },
            deliveryInstructions: {
                type: Sequelize.TEXT,
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
        await queryInterface.addIndex('optional_delivery_addresses', ['textBookSubmissionId']);
        await queryInterface.addIndex('optional_delivery_addresses', ['bookChapterSubmissionId']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('optional_delivery_addresses');
    }
};
