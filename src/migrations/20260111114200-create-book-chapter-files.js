'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('book_chapter_files', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      
      submissionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'book_chapter_submissions',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      
      fileType: {
        type: Sequelize.ENUM(
          'initial_manuscript',    // Optional manuscript with initial submission
          'full_chapter',          // Full chapter after editor acceptance
          'revision_1',            // First revision
          'revision_2',            // Second revision
          'revision_3',            // Third revision
          'final_approved'         // Final approved version
        ),
        allowNull: false,
      },
      
      fileName: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      
      fileUrl: {
        type: Sequelize.STRING(500),
        allowNull: false,
        comment: 'S3/Cloud storage URL',
      },
      
      fileSize: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: 'File size in bytes',
      },
      
      mimeType: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      
      uploadedBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      
      uploadDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        comment: 'Current active version for this type',
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

    // Add indexes - wrap in try-catch to handle if they already exist
    try {
      await queryInterface.addIndex('book_chapter_files', ['submissionId']).catch(() => {});
      await queryInterface.addIndex('book_chapter_files', ['uploadedBy']).catch(() => {});
      await queryInterface.addIndex('book_chapter_files', ['fileType']).catch(() => {});
      await queryInterface.addIndex('book_chapter_files', ['isActive']).catch(() => {});
      await queryInterface.addIndex('book_chapter_files', ['submissionId', 'fileType', 'isActive']).catch(() => {});
    } catch (err) {
      console.log('⚠️ Index creation warning (may already exist):', err.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('book_chapter_files');
  },
};
