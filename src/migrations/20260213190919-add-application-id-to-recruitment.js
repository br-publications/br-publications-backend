'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('recruitment_submissions', 'applicationId', {
      type: Sequelize.STRING(20),
      allowNull: true, // Initially true for existing records if any
      unique: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('recruitment_submissions', 'applicationId');
  }
};
