'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const { DataTypes } = Sequelize;

        await queryInterface.createTable('published_book_chapters', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },

            // FK to the originating book chapter submission
            book_chapter_submission_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'book_chapter_submissions',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
            },

            // Author info
            author: {
                type: DataTypes.STRING(500),
                allowNull: false,
            },
            co_authors: {
                type: DataTypes.TEXT,
                allowNull: true,
                comment: 'Comma-separated list of co-author names',
            },

            // Book metadata
            title: {
                type: DataTypes.STRING(500),
                allowNull: false,
            },
            category: {
                type: DataTypes.STRING(200),
                allowNull: false,
                defaultValue: 'General',
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
                comment: 'Short abstract / book description',
            },
            isbn: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },
            published_date: {
                type: DataTypes.STRING(50),
                allowNull: true,
                comment: 'Year string e.g. "2024"',
            },
            pages: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            indexed_in: {
                type: DataTypes.TEXT,
                allowNull: true,
                comment: 'Comma-separated indexing databases e.g. "Scopus, Google Scholar"',
            },
            release_date: {
                type: DataTypes.STRING(50),
                allowNull: true,
                comment: 'Full release date string DD/MM/YYYY',
            },
            copyright: {
                type: DataTypes.STRING(200),
                allowNull: true,
            },
            doi: {
                type: DataTypes.STRING(200),
                allowNull: true,
            },

            // Cover image (base64 data URL stored directly for simplicity)
            cover_image: {
                type: DataTypes.TEXT,
                allowNull: true,
            },

            // Rich JSONB content sections
            synopsis: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: null,
                comment: '{ "paragrapgh_1": "...", "paragrapgh_2": "..." }',
            },
            scope: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: null,
                comment: '{ "intro": "...", "item_1": "..." }',
            },
            table_contents: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: null,
                comment: '[{ "title": "...", "chapterNumber": "01", "pages": "1-20", "pdfFileName": "ch1.pdf" }]',
            },
            author_biographies: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: null,
                comment: '[{ "authorName": "...", "biography": "..." }]',
            },
            archives: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: null,
                comment: '{ "paragrapgh_1": "..." }',
            },
            pricing: {
                type: DataTypes.JSONB,
                allowNull: true,
                defaultValue: null,
                comment: '{ "softCopyPrice": 0, "hardCopyPrice": 0 }',
            },

            // Display control
            is_hidden: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            is_featured: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },

            // Timestamps
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
        await queryInterface.addIndex('published_book_chapters', ['book_chapter_submission_id'], {
            name: 'idx_pbc_submission_id',
        });
        await queryInterface.addIndex('published_book_chapters', ['isbn'], {
            name: 'idx_pbc_isbn',
        });
        await queryInterface.addIndex('published_book_chapters', ['category'], {
            name: 'idx_pbc_category',
        });
        await queryInterface.addIndex('published_book_chapters', ['is_hidden'], {
            name: 'idx_pbc_is_hidden',
        });
        await queryInterface.addIndex('published_book_chapters', ['is_featured'], {
            name: 'idx_pbc_is_featured',
        });

        // Full-text search index
        await queryInterface.sequelize.query(`
      CREATE INDEX idx_pbc_search
      ON published_book_chapters
      USING gin(to_tsvector('english', title || ' ' || author || ' ' || COALESCE(description, '')));
    `);
    },

    async down(queryInterface) {
        await queryInterface.removeIndex('published_book_chapters', 'idx_pbc_search');
        await queryInterface.removeIndex('published_book_chapters', 'idx_pbc_is_featured');
        await queryInterface.removeIndex('published_book_chapters', 'idx_pbc_is_hidden');
        await queryInterface.removeIndex('published_book_chapters', 'idx_pbc_category');
        await queryInterface.removeIndex('published_book_chapters', 'idx_pbc_isbn');
        await queryInterface.removeIndex('published_book_chapters', 'idx_pbc_submission_id');
        await queryInterface.dropTable('published_book_chapters');
    },
};
