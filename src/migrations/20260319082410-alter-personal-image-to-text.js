'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('recruitment_submissions', 'personalImage', {
      type: Sequelize.TEXT('long'),
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('recruitment_submissions', 'personalImage', {
      type: Sequelize.STRING(500),
      allowNull: true
    });
  }
};
