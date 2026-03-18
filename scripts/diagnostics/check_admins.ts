
import { Sequelize } from 'sequelize';
import User from '../../src/models/user';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

async function checkAdmins() {
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

        // Initialize model
        User.initialize(sequelize);

        console.log('🔄 Connecting to database...');
        await sequelize.authenticate();
        console.log('✅ Connected.');

        console.log('🔍 Searching for admins...');
        const admins = await User.findAll({
            where: {
                role: 'admin',
            }
        });

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

checkAdmins();
