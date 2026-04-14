'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('published_books');
    if (!table.pricing) {
      return queryInterface.addColumn(
        'published_books',
        'pricing',
        {
          type: Sequelize.JSON,
          allowNull: true,
          comment: 'JSON object storing pricing details: { softCopyPrice, hardCopyPrice, bundlePrice }'
        }
      );
    }
    return Promise.resolve();
  },

  down: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('published_books');
    if (table.pricing) {
      return queryInterface.removeColumn('published_books', 'pricing');
    }
    return Promise.resolve();
  }
};
