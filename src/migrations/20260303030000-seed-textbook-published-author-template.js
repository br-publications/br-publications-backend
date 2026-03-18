'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        return queryInterface.bulkInsert('communication_templates', [
            {
                code: 'TEXTBOOK_PUBLISHED_AUTHOR',
                type: 'EMAIL',
                subject: 'Congratulations! Your Textbook is Published: {{bookTitle}}',
                content: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <h2>Hello {{name}},</h2>
  <p style="font-size:18px;">🎉 Congratulations! Your textbook has been officially published.</p>
  <div style="background:#f9f9f9;border-left:4px solid #4CAF50;padding:20px;margin:20px 0;">
    <h3 style="margin-top:0;">{{bookTitle}}</h3>
    <p><strong>Published Date:</strong> {{publishDate}}</p>
    <p><strong>ISBN:</strong> {{isbn}}</p>
    <p><strong>DOI:</strong> {{doi}}</p>
    <p><strong>Status:</strong> PUBLISHED</p>
  </div>
  <p>Your book is now available for readers. You can view the publication details and share the link from your dashboard.</p>
  <p><a href="{{frontendUrl}}/dashboard" style="background:#4CAF50;color:white;padding:12px 24px;text-decoration:none;border-radius:4px;display:inline-block;">View in Dashboard</a></p>
  <p style="color:#666;font-size:14px;">This is an automated notification from BR Publications.</p>
</div>`,
                variables: JSON.stringify(['name', 'bookTitle', 'publishDate', 'isbn', 'doi', 'frontendUrl']),
                description: 'Sent to Author when their textbook is published',
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            }
        ]);
    },

    down: async (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('communication_templates', {
            code: 'TEXTBOOK_PUBLISHED_AUTHOR'
        });
    }
};
