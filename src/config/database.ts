// config/database.ts
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Create and export the Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USER as string,
  process.env.DB_PASSWORD as string,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    // SSL connection for Render production environment
    ...(process.env.NODE_ENV === 'production' && {
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    }),
  }
);

export default sequelize;
