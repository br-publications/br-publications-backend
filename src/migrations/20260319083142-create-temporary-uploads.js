'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('temporary_uploads', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      file_data: {
        type: Sequelize.BLOB('long'),
        allowNull: false,
      },
      mime_type: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      file_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add index on expires_at for easier cleanup
    await queryInterface.addIndex('temporary_uploads', ['expires_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('temporary_uploads');
  }
};
