import { Router } from "express";
import * as dashboard from "../controllers/dashboardController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const dashboardRoutes = Router();

dashboardRoutes.get("/admin", requireAuth, requireRole("admin"), dashboard.adminDashboard);
dashboardRoutes.get("/employee", requireAuth, requireRole("employee"), dashboard.employeeDashboard);
