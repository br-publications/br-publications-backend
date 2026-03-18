'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'published_books',
      'pricing',
      {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'JSON object storing pricing details: { softCopyPrice, hardCopyPrice, bundlePrice }'
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('published_books', 'pricing');
  }
};
