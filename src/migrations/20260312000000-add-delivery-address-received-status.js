'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // 1. Update enum_text_book_submissions_status in text_book_submissions
        const submissionsTable = 'text_book_submissions';
        const statusCol = 'status';
        const submissionsEnum = 'enum_text_book_submissions_status';
        const tempSubmissionsEnum = `${submissionsEnum}_new`;

        // Drop temp if exists
        await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "${tempSubmissionsEnum}";`);

        // Create new enum type including DELIVERY_ADDRESS_RECEIVED
        await queryInterface.sequelize.query(`
      CREATE TYPE "${tempSubmissionsEnum}" AS ENUM (
        'INITIAL_SUBMITTED',
        'PROPOSAL_UNDER_REVIEW',
        'PROPOSAL_REJECTED',
        'PROPOSAL_ACCEPTED',
        'REVISION_REQUESTED',
        'REVISION_SUBMITTED',
        'SUBMISSION_ACCEPTED',
        'SUBMISSION_REJECTED',
        'ISBN_APPLIED',
        'ISBN_RECEIVED',
        'AWAITING_DELIVERY_DETAILS',
        'DELIVERY_ADDRESS_RECEIVED',
        'PUBLICATION_IN_PROGRESS',
        'PUBLISHED',
        'WITHDRAWN'
      );
    `);

        // Drop default
        await queryInterface.sequelize.query(`ALTER TABLE "${submissionsTable}" ALTER COLUMN "${statusCol}" DROP DEFAULT;`);

        // Alter column with casting
        await queryInterface.sequelize.query(`
      ALTER TABLE "${submissionsTable}"
      ALTER COLUMN "${statusCol}" TYPE "${tempSubmissionsEnum}"
      USING ("${statusCol}"::text::"${tempSubmissionsEnum}");
    `);

        // Drop old enum
        await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "${submissionsEnum}";`);

        // Rename new to old
        await queryInterface.sequelize.query(`ALTER TYPE "${tempSubmissionsEnum}" RENAME TO "${submissionsEnum}";`);

        // Restore default
        await queryInterface.sequelize.query(`ALTER TABLE "${submissionsTable}" ALTER COLUMN "${statusCol}" SET DEFAULT 'INITIAL_SUBMITTED'::"${submissionsEnum}";`);


        // 2. Update status history table enums
        const historyTable = 'text_book_status_history';
        const historyEnums = [
            { col: 'previousStatus', name: 'enum_text_book_status_history_previousStatus' },
            { col: 'newStatus', name: 'enum_text_book_status_history_newStatus' }
        ];

        for (const en of historyEnums) {
            const tempName = `${en.name}_new`;
            await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "${tempName}";`);

            await queryInterface.sequelize.query(`
        CREATE TYPE "${tempName}" AS ENUM (
          'INITIAL_SUBMITTED',
          'PROPOSAL_UNDER_REVIEW',
          'PROPOSAL_REJECTED',
          'PROPOSAL_ACCEPTED',
          'REVISION_REQUESTED',
          'REVISION_SUBMITTED',
          'SUBMISSION_ACCEPTED',
          'SUBMISSION_REJECTED',
          'ISBN_APPLIED',
          'ISBN_RECEIVED',
          'AWAITING_DELIVERY_DETAILS',
          'DELIVERY_ADDRESS_RECEIVED',
          'PUBLICATION_IN_PROGRESS',
          'PUBLISHED',
          'WITHDRAWN'
        );
      `);

            await queryInterface.sequelize.query(`
        ALTER TABLE "${historyTable}"
        ALTER COLUMN "${en.col}" TYPE "${tempName}"
        USING ("${en.col}"::text::"${tempName}");
      `);

            await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "${en.name}";`);
            await queryInterface.sequelize.query(`ALTER TYPE "${tempName}" RENAME TO "${en.name}";`);
        }
    },

    down: async (queryInterface, Sequelize) => {
        // Skipping complex revert for now
    }
};
