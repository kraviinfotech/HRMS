import { z } from "zod";
import { objectId, paginationQuery } from "./commonValidation.js";

const salaryStructureSchema = z.object({
  basic: z.coerce.number().nonnegative(),
  hra: z.coerce.number().nonnegative().optional(),
  specialAllowance: z.coerce.number().nonnegative().optional(),
  reimbursements: z.coerce.number().nonnegative().optional(),
});

export const createPayrollDraftSchema = z.object({
  body: z.object({
    employee: objectId,
    month: z.string().regex(/^\d{4}-\d{2}$/),
    salaryStructure: salaryStructureSchema,
    unpaidLeaveDays: z.coerce.number().nonnegative().optional(),
    effectiveDate: z.coerce.date().optional(),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const payrollListSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}),
  query: paginationQuery.extend({
    employee: objectId.optional(),
    month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
    status: z.enum(["draft", "approved", "finalized", "paid"]).optional(),
  }),
});
