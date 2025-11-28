import express from "express";
import { Staff } from "../models/Staff";
import ShiftAssignment from "../models/ShiftAssignment";
const shiftAssignment = express.Router();


shiftAssignment.post('/shiftAssignment', async (req, res) => {
    const assignment = await ShiftAssignment.create({
        staffId: req.body.staffId,
        shiftId: req.body.shiftId,
        entryTime: req.body.entry,
        exitTime: req.body.exit,
    });

    console.log("✔ Inserted:", assignment);
    res.status(201).json({ "status": "Created" });
});


shiftAssignment.get('/shiftAssignment', async (req, res) => {
    const assignments = await ShiftAssignment.findAll();
    res.status(200).json({ "data": assignments });
});


shiftAssignment.delete('/shiftAssignment:staffId', async (req, res) => {
    const response = await Staff.findOne({
        where: { contactNumber: req.params.staffId }
    });
    res.status(200).json({ "data": response });
});



shiftAssignment.delete('/shiftAssignment:staffId', async (req, res) => {
    const response = await Staff.destroy({
        where: { contactNumber: req.params.staffId }
    });
        console.log("🗑️ Staff deleted successfully");
    res.status(200).json({ "data": response });
});

export default shiftAssignment;