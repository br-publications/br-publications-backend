'use strict';

/** MySQL-compatible rewrite: Add COVER_IMAGE to text_book_files.fileType ENUM.
 *  In MySQL, ENUM values are column-level, no named types.
 */
module.exports = {
    async up(queryInterface, Sequelize) {
        try {
            await queryInterface.changeColumn('text_book_files', 'fileType', {
                type: Sequelize.ENUM('CONTENT_FILE', 'FULL_TEXT', 'REVISION', 'COVER_IMAGE'),
                allowNull: false,
            });
        } catch (err) {
            console.log('⚠️ COVER_IMAGE enum migration skipped (column may not exist yet):', err.message);
        }
    },

    async down(queryInterface, Sequelize) {
        try {
            await queryInterface.changeColumn('text_book_files', 'fileType', {
                type: Sequelize.ENUM('CONTENT_FILE', 'FULL_TEXT', 'REVISION'),
                allowNull: false,
            });
        } catch (err) {
            // Ignore
        }
    }
};
