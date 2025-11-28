import express from "express";

const healthRoute = express.Router();

healthRoute.get("/health", (req: any, res: any) => {
  res.send("Hello from TypeScript + Express!");
});

export default healthRoute;