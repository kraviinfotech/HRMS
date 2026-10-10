import { z } from "zod";
import { objectId, paginationQuery } from "./commonValidation.js";

export const applyLeaveSchema = z.object({
  body: z.object({
    type: z.string().min(2).max(80),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    halfDay: z.boolean().optional(),
    reason: z.string().min(5).max(500),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const reviewLeaveSchema = z.object({
  body: z.object({
    status: z.enum(["approved", "rejected"]),
    note: z.string().max(500).optional(),
  }),
  params: z.object({ id: objectId }),
  query: z.object({}),
});

export const leaveListSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}),
  query: paginationQuery.extend({
    employee: objectId.optional(),
    status: z.enum(["pending", "approved", "rejected", "cancelled"]).optional(),
  }),
});
