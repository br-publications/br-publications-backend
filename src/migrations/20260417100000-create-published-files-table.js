'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    // 1. Create published_files table
    await queryInterface.createTable('published_files', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      file_data: {
        type: DataTypes.BLOB('long'),
        allowNull: false,
      },
      file_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      mime_type: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      file_size: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      category: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'GENERAL',
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

    // 2. Add published_file_id column to published_individual_chapters (Normalized TOC)
    const table = await queryInterface.describeTable('published_individual_chapters');
    if (!table.published_file_id) {
      await queryInterface.addColumn('published_individual_chapters', 'published_file_id', {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'published_files',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // 1. Remove column from published_individual_chapters
    const table = await queryInterface.describeTable('published_individual_chapters');
    if (table.published_file_id) {
      await queryInterface.removeColumn('published_individual_chapters', 'published_file_id');
    }

    // 2. Drop published_files table
    await queryInterface.dropTable('published_files');
  },
};
