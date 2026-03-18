
import dotenv from 'dotenv';
import { Sequelize, DataTypes } from 'sequelize';

dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME as string,
    process.env.DB_USER as string,
    process.env.DB_PASSWORD as string,
    {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 5432,
        dialect: 'postgres',
        logging: false,
    }
);

// Minimal Notification model definition for verification
const Notification = sequelize.define('notification', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    recipientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM('INFO', 'SUCCESS', 'WARNING', 'ERROR', 'ABSTRACT_ACCEPTED', 'SUBMISSION_RECEIVED'),
        allowNull: false,
    },
    category: {
        type: DataTypes.ENUM('SUBMISSION', 'REVIEW', 'DISCUSSION', 'SYSTEM', 'SUBMISSION_UPDATE', 'TEXTBOOK_SUBMISSION', 'TEXTBOOK_REVISION', 'TEXTBOOK_DECISION', 'TEXTBOOK_PUBLISHING'),
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    }
}, {
    tableName: 'notifications',
    timestamps: true
});

async function verify() {
    try {
        await sequelize.authenticate();
        

        // Find a valid user ID to use as recipient (assuming ID 1 exists, or we can query one)
        const [users]: any = await sequelize.query("SELECT id FROM users LIMIT 1");
        if (users.length === 0) {
            
            return;
        }
        const recipientId = users[0].id;

        

        const notification: any = await Notification.create({
            recipientId: recipientId,
            type: 'INFO',
            category: 'SUBMISSION_UPDATE',
            title: 'Verification Test',
            message: 'This is a test notification to verify SUBMISSION_UPDATE enum value.'
        });

        
        
        

        // Cleanup
        await notification.destroy();
        

    } catch (error) {
        console.error('❌ Verification Failed:', error);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

verify();
