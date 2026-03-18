'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('users', 'phoneNumber', {
            type: Sequelize.STRING(20),
            allowNull: true,
        });
        await queryInterface.addColumn('users', 'gender', {
            type: Sequelize.STRING(20),
            allowNull: true,
        });
        await queryInterface.addColumn('users', 'nationality', {
            type: Sequelize.STRING(50),
            allowNull: true,
        });
        await queryInterface.addColumn('users', 'dateOfBirth', {
            type: Sequelize.DATE,
            allowNull: true,
        });
        await queryInterface.addColumn('users', 'streetAddress', {
            type: Sequelize.STRING(255),
            allowNull: true,
        });
        await queryInterface.addColumn('users', 'city', {
            type: Sequelize.STRING(100),
            allowNull: true,
        });
        await queryInterface.addColumn('users', 'state', {
            type: Sequelize.STRING(100),
            allowNull: true,
        });
        await queryInterface.addColumn('users', 'country', {
            type: Sequelize.STRING(100),
            allowNull: true,
        });
        await queryInterface.addColumn('users', 'zipCode', {
            type: Sequelize.STRING(20),
            allowNull: true,
        });
        await queryInterface.addColumn('users', 'bio', {
            type: Sequelize.TEXT,
            allowNull: true,
        });
        await queryInterface.addColumn('users', 'designation', {
            type: Sequelize.STRING(100),
            allowNull: true,
        });
        await queryInterface.addColumn('users', 'organization', {
            type: Sequelize.STRING(255),
            allowNull: true,
        });
        await queryInterface.addColumn('users', 'department', {
            type: Sequelize.STRING(100),
            allowNull: true,
        });
        await queryInterface.addColumn('users', 'orcidId', {
            type: Sequelize.STRING(50),
            allowNull: true,
        });
        await queryInterface.addColumn('users', 'experienceYears', {
            type: Sequelize.INTEGER,
            allowNull: true,
        });
        await queryInterface.addColumn('users', 'qualification', {
            type: Sequelize.STRING(100),
            allowNull: true,
        });
        await queryInterface.addColumn('users', 'specialization', {
            type: Sequelize.STRING(100),
            allowNull: true,
        });
        await queryInterface.addColumn('users', 'researchInterests', {
            type: Sequelize.JSON,
            allowNull: true,
        });
        await queryInterface.addColumn('users', 'linkedinProfile', {
            type: Sequelize.STRING(255),
            allowNull: true,
        });
        await queryInterface.addColumn('users', 'twitterProfile', {
            type: Sequelize.STRING(255),
            allowNull: true,
        });
        await queryInterface.addColumn('users', 'website', {
            type: Sequelize.STRING(255),
            allowNull: true,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('users', 'phoneNumber');
        await queryInterface.removeColumn('users', 'gender');
        await queryInterface.removeColumn('users', 'nationality');
        await queryInterface.removeColumn('users', 'dateOfBirth');
        await queryInterface.removeColumn('users', 'streetAddress');
        await queryInterface.removeColumn('users', 'city');
        await queryInterface.removeColumn('users', 'state');
        await queryInterface.removeColumn('users', 'country');
        await queryInterface.removeColumn('users', 'zipCode');
        await queryInterface.removeColumn('users', 'bio');
        await queryInterface.removeColumn('users', 'designation');
        await queryInterface.removeColumn('users', 'organization');
        await queryInterface.removeColumn('users', 'department');
        await queryInterface.removeColumn('users', 'orcidId');
        await queryInterface.removeColumn('users', 'experienceYears');
        await queryInterface.removeColumn('users', 'qualification');
        await queryInterface.removeColumn('users', 'specialization');
        await queryInterface.removeColumn('users', 'researchInterests');
        await queryInterface.removeColumn('users', 'linkedinProfile');
        await queryInterface.removeColumn('users', 'twitterProfile');
        await queryInterface.removeColumn('users', 'website');
    }
};
