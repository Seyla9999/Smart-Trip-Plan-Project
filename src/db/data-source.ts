import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
<<<<<<< HEAD
  url: process.env.DATABASE_URL, 
  entities: ['dist/**/*.entity.js'], 
  migrations: ['dist/migrations/*.js'], 
  synchronize: true,
  logging: true,
=======
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['dist/**/*.entity.js'], // Use compiled JS files
  migrations: ['dist/migrations/*.js'], // Where compiled migrations live
  synchronize: false,
>>>>>>> 62905b1 (Authentication, Email Verrification)
});