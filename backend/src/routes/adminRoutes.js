import { Router } from "express";
import * as admin from "../controllers/adminController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { idParam } from "../validations/commonValidation.js";
import {
  announcementSchema,
  holidaySchema,
  joiningLetterSchema,
  listSchema,
  notificationCreateSchema,
  settingsSchema,
} from "../validations/adminValidation.js";

export const adminRoutes = Router();

adminRoutes.get("/announcements", requireAuth, validate(listSchema), admin.listAnnouncements);
adminRoutes.post("/announcements", requireAuth, requireRole("admin"), validate(announcementSchema), admin.createAnnouncement);
adminRoutes.patch("/announcements/:id", requireAuth, requireRole("admin"), validate(announcementSchema), admin.updateAnnouncement);
adminRoutes.delete("/announcements/:id", requireAuth, requireRole("admin"), validate(idParam), admin.deleteAnnouncement);

adminRoutes.get("/holidays", requireAuth, admin.listHolidays);
adminRoutes.post("/holidays", requireAuth, requireRole("admin"), validate(holidaySchema), admin.createHoliday);
adminRoutes.patch("/holidays/:id", requireAuth, requireRole("admin"), validate(holidaySchema), admin.updateHoliday);
adminRoutes.delete("/holidays/:id", requireAuth, requireRole("admin"), validate(idParam), admin.deleteHoliday);

adminRoutes.get("/settings", requireAuth, requireRole("admin"), admin.getSettings);
adminRoutes.patch("/settings", requireAuth, requireRole("admin"), validate(settingsSchema), admin.updateSettings);
adminRoutes.get("/audit-logs", requireAuth, requireRole("admin"), admin.listAuditLogs);
adminRoutes.get("/reports", requireAuth, requireRole("admin"), admin.reports);
adminRoutes.get("/birthdays", requireAuth, admin.birthdays);
adminRoutes.post("/notifications", requireAuth, requireRole("admin"), validate(notificationCreateSchema), admin.createNotification);
adminRoutes.post("/joining-letters", requireAuth, requireRole("admin"), validate(joiningLetterSchema), admin.generateJoiningLetter);
