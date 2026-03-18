'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.STRING(8),
        allowNull: true,
        unique: true,
        comment: 'Auto-generated unique user ID (6-8 digits based on timestamp)',
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Unique username for login',
      },
      fullName: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM('user', 'author', 'student', 'admin', 'editor', 'reviewer', 'developer'),
        allowNull: false,
        defaultValue: 'user',
        comment: 'User role - defaults to "user"',
      },
      emailVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      emailOtp: {
        type: Sequelize.STRING(8),
        allowNull: true,
      },
      emailOtpExpiry: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      otpAttempts: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      lastLogin: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      resetPasswordToken: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      resetPasswordExpiry: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      googleId: {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: true,
        comment: 'Google OAuth ID for linked accounts',
      },
      profilePicture: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'URL to user profile picture',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('users', ['userId']);
    await queryInterface.addIndex('users', ['username']);
    await queryInterface.addIndex('users', ['email']);
    await queryInterface.addIndex('users', ['googleId']);
    await queryInterface.addIndex('users', ['role']);
    await queryInterface.addIndex('users', ['isActive']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  },
};
