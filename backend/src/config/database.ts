import { Sequelize } from 'sequelize';

// Hardcoded PostgreSQL connection
const sequelize = new Sequelize('mydb', 'prabhuling', '', {
  host: 'localhost',
  port: 5432,
  dialect: 'postgres',
  logging: false, // optional: shows SQL queries
});

export default sequelize;
