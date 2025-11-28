// src/routes/index.ts

import { Router } from "express";
import { authRoutes } from "./auth.routes";
import { staffRoutes } from "./staff.routes";
import { attendanceRoutes } from "./attendance.routes";
import { shiftRoutes } from "./shift.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/staff", staffRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/shifts", shiftRoutes);

export const apiRouter = router;
