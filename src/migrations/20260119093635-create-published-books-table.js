'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { DataTypes } = Sequelize;

    // Drop table if it exists to handle partial migration states
    await queryInterface.dropTable('published_books');

    await queryInterface.createTable('published_books', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
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
      title: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      author: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      co_authors: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      cover_image: {
        type: DataTypes.TEXT, // Stores base64 data URL or file path
        allowNull: true,
      },
      category: {
        type: DataTypes.STRING(200),
        allowNull: false,
        defaultValue: 'General',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      isbn: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      published_date: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      pages: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      indexed_in: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      release_date: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      copyright: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      doi: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      synopsis: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      scope: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      table_contents: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      author_biographies: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      archives: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {},
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

    // Add indexes for better query performance
    await queryInterface.addIndex('published_books', ['submission_id'], {
      name: 'idx_published_books_submission_id',
    });

    await queryInterface.addIndex('published_books', ['category'], {
      name: 'idx_published_books_category',
    });

    await queryInterface.addIndex('published_books', ['isbn'], {
      name: 'idx_published_books_isbn',
      unique: true,
    });

    await queryInterface.addIndex('published_books', ['published_date'], {
      name: 'idx_published_books_published_date',
    });

    await queryInterface.addIndex('published_books', ['created_at'], {
      name: 'idx_published_books_created_at',
    });

    // Add full-text search index for title and author (PostgreSQL)
    await queryInterface.sequelize.query(`
            CREATE INDEX idx_published_books_search 
            ON published_books 
            USING gin(to_tsvector('english', title || ' ' || author || ' ' || COALESCE(description, '')));
        `);
  },

  down: async (queryInterface, Sequelize) => {
    // Drop indexes first
    await queryInterface.removeIndex('published_books', 'idx_published_books_search');
    await queryInterface.removeIndex('published_books', 'idx_published_books_created_at');
    await queryInterface.removeIndex('published_books', 'idx_published_books_published_date');
    await queryInterface.removeIndex('published_books', 'idx_published_books_isbn');
    await queryInterface.removeIndex('published_books', 'idx_published_books_category');
    await queryInterface.removeIndex('published_books', 'idx_published_books_submission_id');

    // Drop table
    await queryInterface.dropTable('published_books');
  },
};
