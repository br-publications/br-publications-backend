'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Add editor_biographies to published_book_chapters
    await queryInterface.addColumn('published_book_chapters', 'editor_biographies', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: null
    });

    // 2. Create published_editors table
    await queryInterface.createTable('published_editors', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      affiliation: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      biography: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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

    // 3. Create published_book_editors join table (Relational)
    await queryInterface.createTable('published_book_editors', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        published_book_chapter_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'published_book_chapters',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        published_editor_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'published_editors',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
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

    // Add unique constraint for the join table
    await queryInterface.addConstraint('published_book_editors', {
        fields: ['published_book_chapter_id', 'published_editor_id'],
        type: 'unique',
        name: 'unique_book_editor_link'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('published_book_editors');
    await queryInterface.dropTable('published_editors');
    await queryInterface.removeColumn('published_book_chapters', 'editor_biographies');
  }
};
