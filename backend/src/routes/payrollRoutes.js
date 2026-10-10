import { Router } from "express";
import * as payroll from "../controllers/payrollController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { idParam } from "../validations/commonValidation.js";
import { createPayrollDraftSchema, payrollListSchema } from "../validations/payrollValidation.js";

export const payrollRoutes = Router();

payrollRoutes.get("/", requireAuth, validate(payrollListSchema), payroll.index);
payrollRoutes.post("/drafts", requireAuth, requireRole("admin"), validate(createPayrollDraftSchema), payroll.draft);
payrollRoutes.patch("/:id/finalize", requireAuth, requireRole("admin"), validate(idParam), payroll.finalize);
payrollRoutes.get("/:id/payslip", requireAuth, validate(idParam), payroll.payslip);
