
import { Sequelize } from 'sequelize';
import Notification, { NotificationType, NotificationCategory } from './src/models/notification';
import User from './src/models/user';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

async function checkNotifications() {
    try {
        const sequelize = new Sequelize(
            process.env.DB_NAME || 'br_publications_v2',
            process.env.DB_USER || 'postgres',
            process.env.DB_PASSWORD || 'postgres',
            {
                host: process.env.DB_HOST || 'localhost',
                dialect: 'postgres',
                logging: false,
            }
        );

        // Initialize models
        User.initialize(sequelize);
        Notification.initialize(sequelize);

        console.log('🔄 Connecting to database...');
        await sequelize.authenticate();
        console.log('✅ Connected.');

        console.log('🔍 Searching for notifications for Admin (ID: 1)...');
        const notifications = await Notification.findAll({
            where: {
                recipientId: 1,
            },
            order: [['createdAt', 'DESC']],
            limit: 5
        });

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

checkNotifications();
