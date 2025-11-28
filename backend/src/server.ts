import express from "express";
import healthRoute from './routes/health'
import attendenece from './routes/attendecne'
const app = express();
const PORT = 3000;

app.use(express.json()); // it is middleware to handle request

app.use('/', healthRoute) ;
app.use("/",attendenece)
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
