import express from "express";
import sequelize from './config/database';
import healthRoute from './routes/health';
import attendance from './routes/attendecne'; // double-check spelling
import shift from './routes/shifts'
import Shift from "./models/Shifts";
import staff from "./routes/staff";
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Routes
app.use('/', healthRoute);
app.use('/', attendance);
app.use('/',shift);
app.use('/',staff);
// Test DB connection before starting server
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL database connected successfully!');
    await Shift.sync(); 

    app.listen(PORT,'0.0.0.0',() => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
})();
