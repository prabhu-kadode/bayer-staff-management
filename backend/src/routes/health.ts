import express from "express";

const healthApp = express();

healthApp.get("/health", (req: any, res: any) => {
  res.send("Hello from TypeScript + Express!");
});

export default healthApp;
