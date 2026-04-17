import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USER as string,
  process.env.DB_PASSWORD as string,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
  }
);

async function checkColumn() {
  try {
    const [results]: any[] = await sequelize.query("DESCRIBE published_book_chapters");
    const col = results.find((r: any) => r.Field === 'cover_image');
    console.log('--- COVER_IMAGE COLUMN INFO ---');
    console.log(JSON.stringify(col, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
}

checkColumn();
