import express from "express";
import sequelize from './config/database';
import healthRoute from './routes/health';
import attendance from './routes/attendecne'; // double-check spelling
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Routes
app.use('/', healthRoute);
app.use('/', attendance);

// Test DB connection before starting server
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL database connected successfully!');

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
})();
