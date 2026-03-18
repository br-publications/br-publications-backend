'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('recruitment_submissions', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            submittedBy: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            firstName: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            lastName: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            designation: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            department: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            instituteName: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            email: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            phoneNumber: {
                type: Sequelize.STRING(20),
                allowNull: false
            },
            city: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            state: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            country: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            highestQualification: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            scopusId: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            biography: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            personalImage: {
                type: Sequelize.STRING(500),
                allowNull: true
            },
            appliedRole: {
                type: Sequelize.ENUM('editor', 'reviewer'),
                allowNull: false
            },
            status: {
                type: Sequelize.ENUM('PENDING', 'ACCEPTED', 'REJECTED'),
                allowNull: false,
                defaultValue: 'PENDING'
            },
            reviewedBy: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            adminNotes: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Add indexes for common searches
        await queryInterface.addIndex('recruitment_submissions', ['submittedBy']);
        await queryInterface.addIndex('recruitment_submissions', ['status']);
        await queryInterface.addIndex('recruitment_submissions', ['appliedRole']);
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('recruitment_submissions');
        // Enums are usually dropped automatically if they are bound to a table, 
        // but sometimes need manual cleanup in Postgres if not using type names.
    }
};
