// GET /attendance
import express, { Request, Response } from "express";
import Shift from '../models/Shifts';

const shiftRouter = express.Router();

shiftRouter.post("/shifts",async (req,res)=>{
  try {
    const { shiftType } = req.body;
    if (!shiftType) return res.status(400).json({ error: 'shiftType is required' });

    const newShift = await Shift.create({ shiftType });
    res.status(201).json(newShift);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Failed to create shift' });
  }
})

shiftRouter.get("/shifts",async (req,res)=>{
  try {
    
    const shiftdata = await Shift.findAll();
    res.status(200).json(shiftdata);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Failed to create shift' });
  }
})

export default shiftRouter