'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('users', 'profilePicture', {
      type: Sequelize.TEXT('long'),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('users', 'profilePicture', {
      type: Sequelize.STRING(500),
      allowNull: true,
    });
  }
};
