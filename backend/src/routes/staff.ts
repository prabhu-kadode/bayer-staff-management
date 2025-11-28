import express from "express";
import { Staff } from "../modal/staff";
const staff = express.Router();


staff.post('/staff', async (req, res) => {
  await Staff.create({
    staffName: "Rahul Sharma",
    contactNumber: "9876543210",
    email: null,
    preferredShift: "morning",
  });
  res.status(200).json({ "status": "Created" });
});


staff.get('/staff', async (req, res) => {
  const response = await Staff.findAll();
  res.status(200).json({ "data": response });
});


staff.get('/staff:staffNumber', async (req, res) => {
  const response = await Staff.findOne({
    where: { contactNumber: req.params.staffNumber }
  });
  res.status(200).json({ "data": response });
});



staff.delete('/staff:staffNumber', async (req, res) => {
  const response = await Staff.destroy({
    where: { contactNumber: req.params.staffNumber }
  });
  if (response === 0) {
    console.log("⚠️ No staff found with this contact number");
  } else {
    console.log("🗑️ Staff deleted successfully");
  }
  res.status(200).json({ "data": response });
});