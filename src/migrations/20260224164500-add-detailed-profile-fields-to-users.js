'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const table = await queryInterface.describeTable('users');

        if (!table.phoneNumber) {
            await queryInterface.addColumn('users', 'phoneNumber', {
                type: Sequelize.STRING(20),
                allowNull: true,
            });
        }
        if (!table.gender) {
            await queryInterface.addColumn('users', 'gender', {
                type: Sequelize.STRING(20),
                allowNull: true,
            });
        }
        if (!table.nationality) {
            await queryInterface.addColumn('users', 'nationality', {
                type: Sequelize.STRING(50),
                allowNull: true,
            });
        }
        if (!table.dateOfBirth) {
            await queryInterface.addColumn('users', 'dateOfBirth', {
                type: Sequelize.DATE,
                allowNull: true,
            });
        }
        if (!table.streetAddress) {
            await queryInterface.addColumn('users', 'streetAddress', {
                type: Sequelize.STRING(255),
                allowNull: true,
            });
        }
        if (!table.city) {
            await queryInterface.addColumn('users', 'city', {
                type: Sequelize.STRING(100),
                allowNull: true,
            });
        }
        if (!table.state) {
            await queryInterface.addColumn('users', 'state', {
                type: Sequelize.STRING(100),
                allowNull: true,
            });
        }
        if (!table.country) {
            await queryInterface.addColumn('users', 'country', {
                type: Sequelize.STRING(100),
                allowNull: true,
            });
        }
        if (!table.zipCode) {
            await queryInterface.addColumn('users', 'zipCode', {
                type: Sequelize.STRING(20),
                allowNull: true,
            });
        }
        if (!table.bio) {
            await queryInterface.addColumn('users', 'bio', {
                type: Sequelize.TEXT,
                allowNull: true,
            });
        }
        if (!table.designation) {
            await queryInterface.addColumn('users', 'designation', {
                type: Sequelize.STRING(100),
                allowNull: true,
            });
        }
        if (!table.organization) {
            await queryInterface.addColumn('users', 'organization', {
                type: Sequelize.STRING(255),
                allowNull: true,
            });
        }
        if (!table.department) {
            await queryInterface.addColumn('users', 'department', {
                type: Sequelize.STRING(100),
                allowNull: true,
            });
        }
        if (!table.orcidId) {
            await queryInterface.addColumn('users', 'orcidId', {
                type: Sequelize.STRING(50),
                allowNull: true,
            });
        }
        if (!table.experienceYears) {
            await queryInterface.addColumn('users', 'experienceYears', {
                type: Sequelize.INTEGER,
                allowNull: true,
            });
        }
        if (!table.qualification) {
            await queryInterface.addColumn('users', 'qualification', {
                type: Sequelize.STRING(100),
                allowNull: true,
            });
        }
        if (!table.specialization) {
            await queryInterface.addColumn('users', 'specialization', {
                type: Sequelize.STRING(100),
                allowNull: true,
            });
        }
        if (!table.researchInterests) {
            await queryInterface.addColumn('users', 'researchInterests', {
                type: Sequelize.JSON,
                allowNull: true,
            });
        }
        if (!table.linkedinProfile) {
            await queryInterface.addColumn('users', 'linkedinProfile', {
                type: Sequelize.STRING(255),
                allowNull: true,
            });
        }
        if (!table.twitterProfile) {
            await queryInterface.addColumn('users', 'twitterProfile', {
                type: Sequelize.STRING(255),
                allowNull: true,
            });
        }
        if (!table.website) {
            await queryInterface.addColumn('users', 'website', {
                type: Sequelize.STRING(255),
                allowNull: true,
            });
        }
    },

    down: async (queryInterface, Sequelize) => {
        const table = await queryInterface.describeTable('users');

        if (table.phoneNumber) {
            await queryInterface.removeColumn('users', 'phoneNumber');
        }
        if (table.gender) {
            await queryInterface.removeColumn('users', 'gender');
        }
        if (table.nationality) {
            await queryInterface.removeColumn('users', 'nationality');
        }
        if (table.dateOfBirth) {
            await queryInterface.removeColumn('users', 'dateOfBirth');
        }
        if (table.streetAddress) {
            await queryInterface.removeColumn('users', 'streetAddress');
        }
        if (table.city) {
            await queryInterface.removeColumn('users', 'city');
        }
        if (table.state) {
            await queryInterface.removeColumn('users', 'state');
        }
        if (table.country) {
            await queryInterface.removeColumn('users', 'country');
        }
        if (table.zipCode) {
            await queryInterface.removeColumn('users', 'zipCode');
        }
        if (table.bio) {
            await queryInterface.removeColumn('users', 'bio');
        }
        if (table.designation) {
            await queryInterface.removeColumn('users', 'designation');
        }
        if (table.organization) {
            await queryInterface.removeColumn('users', 'organization');
        }
        if (table.department) {
            await queryInterface.removeColumn('users', 'department');
        }
        if (table.orcidId) {
            await queryInterface.removeColumn('users', 'orcidId');
        }
        if (table.experienceYears) {
            await queryInterface.removeColumn('users', 'experienceYears');
        }
        if (table.qualification) {
            await queryInterface.removeColumn('users', 'qualification');
        }
        if (table.specialization) {
            await queryInterface.removeColumn('users', 'specialization');
        }
        if (table.researchInterests) {
            await queryInterface.removeColumn('users', 'researchInterests');
        }
        if (table.linkedinProfile) {
            await queryInterface.removeColumn('users', 'linkedinProfile');
        }
        if (table.twitterProfile) {
            await queryInterface.removeColumn('users', 'twitterProfile');
        }
        if (table.website) {
            await queryInterface.removeColumn('users', 'website');
        }
    }
};
