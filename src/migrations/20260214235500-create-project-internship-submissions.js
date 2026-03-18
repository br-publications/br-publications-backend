'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('project_internship_submissions', {
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
            submissionType: {
                type: Sequelize.ENUM('WEB', 'MOBILE', 'INTERNSHIP'),
                allowNull: false
            },
            status: {
                type: Sequelize.ENUM('PENDING', 'ACCEPTED', 'REJECTED'),
                allowNull: false,
                defaultValue: 'PENDING'
            },
            data: {
                type: Sequelize.JSON,
                allowNull: false
            },
            adminNotes: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            applicationId: {
                type: Sequelize.STRING(20),
                allowNull: true,
                unique: true
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
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        // Add index for faster lookups
        await queryInterface.addIndex('project_internship_submissions', ['submittedBy']);
        await queryInterface.addIndex('project_internship_submissions', ['status']);
        await queryInterface.addIndex('project_internship_submissions', ['submissionType']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('project_internship_submissions');
    }
};
