// GET /attendance
import express, { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
const attendenece = express.Router();


attendenece.get("/attendenece",(req:Request,res:Response)=>{
    res.status(200).json("hiiii")
})

export default attendenece