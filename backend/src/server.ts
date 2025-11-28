import express from "express";
import healthApp from './routes/health'
const app = express();
const PORT = 3000;

app.use(express.json()); // it is middleware to handle request

app.use('/', healthApp) ;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
