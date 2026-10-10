import { Router } from "express";
import * as timesheets from "../controllers/timesheetController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { idParam } from "../validations/commonValidation.js";
import { timesheetListSchema, timesheetReviewSchema, upsertTimesheetSchema } from "../validations/timesheetValidation.js";

export const timesheetRoutes = Router();

timesheetRoutes.get("/", requireAuth, validate(timesheetListSchema), timesheets.index);
timesheetRoutes.post("/", requireAuth, requireRole("employee"), validate(upsertTimesheetSchema), timesheets.save);
timesheetRoutes.post("/:id/submit", requireAuth, requireRole("employee"), validate(idParam), timesheets.submit);
timesheetRoutes.patch("/:id/review", requireAuth, requireRole("admin"), validate(timesheetReviewSchema), timesheets.review);
