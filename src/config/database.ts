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
      max: Number(process.env.DB_POOL_MAX) || 10,
      min: Number(process.env.DB_POOL_MIN) || 0,
      acquire: 60000, // Wait up to 60 seconds for a connection
      idle: 10000,
      evict: 1000,  // Periodically check for idle connections
    },
    // KeepAlive to prevent "Connection terminated unexpectedly"
    dialectOptions: {
      ...(process.env.NODE_ENV === 'production' && {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }),
      keepAlive: true,
    },
  }
);

export default sequelize;
