import 'dotenv/config';
import express from "express";
import cors from 'cors';
import healthRoute from './routes/health'
import attendenece from './routes/attendecne'
import authRoute from './routes/auth'
const app = express();
const PORT = 5000;

app.use(express.json()); // it is middleware to handle request
app.use(cors());

app.use('/', healthRoute) ;
app.use("/",attendenece)
app.use('/', authRoute)
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
