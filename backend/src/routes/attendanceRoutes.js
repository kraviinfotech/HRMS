import { Router } from "express";
import * as attendance from "../controllers/attendanceController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  attendanceListSchema,
  attendancePunchSchema,
  correctionRequestSchema,
  correctionReviewSchema,
} from "../validations/attendanceValidation.js";

export const attendanceRoutes = Router();

attendanceRoutes.get("/", requireAuth, validate(attendanceListSchema), attendance.index);
attendanceRoutes.get("/export", requireAuth, requireRole("admin"), validate(attendanceListSchema), attendance.exportReport);
attendanceRoutes.get("/today", requireAuth, requireRole("employee"), attendance.today);
attendanceRoutes.post("/check-in", requireAuth, requireRole("employee"), validate(attendancePunchSchema), attendance.punchIn);
attendanceRoutes.post("/check-out", requireAuth, requireRole("employee"), validate(attendancePunchSchema), attendance.punchOut);
attendanceRoutes.post("/:id/correction", requireAuth, requireRole("employee"), validate(correctionRequestSchema), attendance.correction);
attendanceRoutes.patch("/:id/correction", requireAuth, requireRole("admin"), validate(correctionReviewSchema), attendance.reviewCorrection);
