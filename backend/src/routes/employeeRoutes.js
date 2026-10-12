import { Router } from "express";
import * as employees from "../controllers/employeeController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { idParam } from "../validations/commonValidation.js";
import {
  createEmployeeSchema,
  employeeListSchema,
  employeeStatusSchema,
  updateEmployeeSchema,
} from "../validations/employeeValidation.js";

export const employeeRoutes = Router();

employeeRoutes.get("/", requireAuth, requireRole("admin"), validate(employeeListSchema), employees.index);
employeeRoutes.get("/export", requireAuth, requireRole("admin"), employees.exportCsv);
employeeRoutes.post("/", requireAuth, requireRole("admin"), validate(createEmployeeSchema), employees.create);
employeeRoutes.get("/:id", requireAuth, validate(idParam), employees.show);
employeeRoutes.patch("/:id", requireAuth, requireRole("admin"), validate(updateEmployeeSchema), employees.update);
employeeRoutes.patch("/:id/status", requireAuth, requireRole("admin"), validate(employeeStatusSchema), employees.status);
employeeRoutes.delete("/:id", requireAuth, requireRole("admin"), validate(idParam), employees.destroy);
