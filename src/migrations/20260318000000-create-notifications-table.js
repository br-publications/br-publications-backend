'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notifications', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      recipientId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      senderId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      type: {
        type: Sequelize.ENUM(
          'INFO',
          'SUCCESS',
          'WARNING',
          'ERROR',
          'ABSTRACT_ACCEPTED',
          'SUBMISSION_RECEIVED'
        ),
        allowNull: false,
        defaultValue: 'INFO',
      },
      category: {
        type: Sequelize.ENUM(
          'SUBMISSION',
          'REVIEW',
          'DISCUSSION',
          'SYSTEM',
          'SUBMISSION_UPDATE',
          'TEXTBOOK_SUBMISSION',
          'TEXTBOOK_REVISION',
          'TEXTBOOK_DECISION',
          'TEXTBOOK_PUBLISHING'
        ),
        allowNull: false,
        defaultValue: 'SYSTEM',
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      relatedEntityId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      relatedEntityType: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      isRead: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add indexes for common query patterns
    await queryInterface.addIndex('notifications', ['recipientId'], {
      name: 'notifications_recipientId_idx',
    });
    await queryInterface.addIndex('notifications', ['isRead'], {
      name: 'notifications_isRead_idx',
    });
    await queryInterface.addIndex('notifications', ['createdAt'], {
      name: 'notifications_createdAt_idx',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('notifications');
    // Drop the enum types created for this table
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_notifications_type";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_notifications_category";');
  },
};
