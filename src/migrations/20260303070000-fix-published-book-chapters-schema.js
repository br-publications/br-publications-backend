'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const table = await queryInterface.describeTable('published_book_chapters');

        // Rename mistakenly added camelCase columns to snake_case (if they exist as camelCase)
        if (table.googleLink && !table.google_link) {
            await queryInterface.renameColumn('published_book_chapters', 'googleLink', 'google_link');
        }
        if (table.flipkartLink && !table.flipkart_link) {
            await queryInterface.renameColumn('published_book_chapters', 'flipkartLink', 'flipkart_link');
        }
        if (table.amazonLink && !table.amazon_link) {
            await queryInterface.renameColumn('published_book_chapters', 'amazonLink', 'amazon_link');
        }

        // Add missing columns as per model definition (if they don't exist)
        if (!table.main_author) {
            await queryInterface.addColumn('published_book_chapters', 'main_author', {
                type: Sequelize.JSONB,
                allowNull: true,
            });
        }
        if (!table.co_authors_data) {
            await queryInterface.addColumn('published_book_chapters', 'co_authors_data', {
                type: Sequelize.JSONB,
                allowNull: true,
            });
        }
        if (!table.frontmatter_pdfs) {
            await queryInterface.addColumn('published_book_chapters', 'frontmatter_pdfs', {
                type: Sequelize.JSONB,
                allowNull: true,
            });
        }
    },

    async down(queryInterface, Sequelize) {
        const table = await queryInterface.describeTable('published_book_chapters');

        // Remove added columns
        if (table.frontmatter_pdfs) await queryInterface.removeColumn('published_book_chapters', 'frontmatter_pdfs');
        if (table.co_authors_data) await queryInterface.removeColumn('published_book_chapters', 'co_authors_data');
        if (table.main_author) await queryInterface.removeColumn('published_book_chapters', 'main_author');

        // Rename columns back
        if (table.amazon_link && !table.amazonLink) {
            await queryInterface.renameColumn('published_book_chapters', 'amazon_link', 'amazonLink');
        }
        if (table.flipkart_link && !table.flipkartLink) {
            await queryInterface.renameColumn('published_book_chapters', 'flipkart_link', 'flipkartLink');
        }
        if (table.google_link && !table.googleLink) {
            await queryInterface.renameColumn('published_book_chapters', 'google_link', 'googleLink');
        }
    }
};
