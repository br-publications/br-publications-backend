'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Add the column as nullable first
    await queryInterface.addColumn('book_chapter_reviewer_assignments', 'assignmentRef', {
      type: Sequelize.STRING(20),
      allowNull: true,
      unique: true,
    });

    // 2. Populate existing records with a unique ID based on their auto-increment ID
    // We use a raw query to ensure efficiency for existing rows
    const [results] = await queryInterface.sequelize.query(
      'SELECT id FROM book_chapter_reviewer_assignments WHERE "assignmentRef" IS NULL'
    );

    for (const row of results) {
      const ref = `BCR-${String(row.id).padStart(5, '0')}`;
      await queryInterface.sequelize.query(
        `UPDATE book_chapter_reviewer_assignments SET "assignmentRef" = '${ref}' WHERE id = ${row.id}`
      );
    }
    
    // Note: We don't make it NOT NULL here to avoid breaking any in-flight code 
    // that might not be aware of the column yet. The model hook will handle future ones.
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('book_chapter_reviewer_assignments', 'assignmentRef');
  },
};
