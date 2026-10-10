import { Router } from "express";
import * as leaves from "../controllers/leaveController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { idParam } from "../validations/commonValidation.js";
import { applyLeaveSchema, leaveListSchema, reviewLeaveSchema } from "../validations/leaveValidation.js";

export const leaveRoutes = Router();

leaveRoutes.get("/", requireAuth, validate(leaveListSchema), leaves.index);
leaveRoutes.post("/", requireAuth, requireRole("employee"), validate(applyLeaveSchema), leaves.apply);
leaveRoutes.patch("/:id/review", requireAuth, requireRole("admin"), validate(reviewLeaveSchema), leaves.review);
leaveRoutes.post("/:id/cancel", requireAuth, requireRole("employee"), validate(idParam), leaves.cancel);
