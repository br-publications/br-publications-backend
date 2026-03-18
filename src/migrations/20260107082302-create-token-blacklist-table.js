'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('token_blacklist', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      token: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Add indexes
    await queryInterface.addIndex('token_blacklist', ['token']);
    await queryInterface.addIndex('token_blacklist', ['userId']);
    await queryInterface.addIndex('token_blacklist', ['expiresAt']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('token_blacklist');
  },
};
