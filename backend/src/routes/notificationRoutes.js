import { Router } from "express";
import * as notifications from "../controllers/notificationController.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { idParam } from "../validations/commonValidation.js";

export const notificationRoutes = Router();

notificationRoutes.get("/", requireAuth, notifications.index);
notificationRoutes.patch("/:id/read", requireAuth, validate(idParam), notifications.markRead);
