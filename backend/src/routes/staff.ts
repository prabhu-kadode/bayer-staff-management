import express from "express";
import { Staff } from "../models/Staff";
const staff = express.Router();


staff.post('/staff', async (req, res) => {
  try {
  await Staff.create({
    staffName: req.body.staffName,
    contactNumber: req.body.contactNumber,
    email: req.body.email,
    role: req.body.role,
    preferredShift: req.body.preferredShift,
  });
  res.status(200).json({ "status": "Created" });
} catch(e){
  console.log(e)
  res.status(500).json("internal server error")
}
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

export default staff;