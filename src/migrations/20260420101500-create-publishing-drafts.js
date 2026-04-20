'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { DataTypes } = Sequelize;

    await queryInterface.createTable('publishing_drafts', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      submission_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'book_chapter_submissions',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      draft_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      wizard_type: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'PUBLISH_BOOK',
      },
      payload: {
        type: DataTypes.TEXT('long'),
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    // Indexes
    await queryInterface.addIndex('publishing_drafts', ['user_id']);
    await queryInterface.addIndex('publishing_drafts', ['submission_id']);
    await queryInterface.addIndex('publishing_drafts', ['updated_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('publishing_drafts');
  },
};
