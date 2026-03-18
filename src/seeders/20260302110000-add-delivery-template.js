'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const template = {
            code: 'TEXTBOOK_DELIVERY_DETAILS_REQUESTED',
            type: 'EMAIL',
            subject: 'Delivery Details Required: {{bookTitle}}',
            content: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
  <h2>Hello {{name}},</h2>
  <p>Your textbook <strong>{{bookTitle}}</strong> has had its ISBN and DOI recorded successfully.</p>
  <div style="background:#fff3cd;border-left:4px solid #ffc107;padding:20px;margin:20px 0;">
    <h3 style="margin-top:0;">Action Required: Delivery Address</h3>
    <p>To proceed with the publication and shipping of your book copies, we require your delivery address.</p>
    <p><strong>ISBN:</strong> {{isbnNumber}}</p>
    <p><strong>DOI:</strong> {{doiNumber}}</p>
  </div>
  <p>Please log in to your dashboard and submit your delivery details via the "Author Actions" tab.</p>
  <p><a href="{{frontendUrl}}/dashboard" style="background:#1e5292;color:white;padding:12px 24px;text-decoration:none;border-radius:4px;display:inline-block;">Submit Delivery Address</a></p>
  <p style="color:#666;font-size:14px;">If you have any questions, please contact our support team.</p>
  <p>Best regards,<br>BR Publications Team</p>
</div>`,
            variables: JSON.stringify(['name', 'bookTitle', 'isbnNumber', 'doiNumber', 'frontendUrl']),
            description: 'Sent to Author when ISBN is recorded, requesting delivery address',
            is_active: true,
            created_at: new Date(),
            updated_at: new Date()
        };

        const exists = await queryInterface.rawSelect('communication_templates', {
            where: { code: template.code },
        }, ['id']);

        if (!exists) {
            await queryInterface.bulkInsert('communication_templates', [template]);
        } else {
            console.log(`Template already exists: ${template.code}`);
        }
    },

    down: async (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete('communication_templates', {
            code: 'TEXTBOOK_DELIVERY_DETAILS_REQUESTED'
        });
    }
};
