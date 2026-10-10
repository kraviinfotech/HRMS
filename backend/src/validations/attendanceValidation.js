import { z } from "zod";
import { locationSchema, objectId, paginationQuery } from "./commonValidation.js";

export const attendancePunchSchema = z.object({
  body: z.object({ location: locationSchema }),
  params: z.object({}),
  query: z.object({}),
});

export const attendanceListSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}),
  query: paginationQuery.extend({
    employee: objectId.optional(),
    status: z.enum(["present", "absent", "late", "half_day", "on_leave", "missing_checkout"]).optional(),
    from: z.string().optional(),
    to: z.string().optional(),
  }),
});

export const correctionRequestSchema = z.object({
  body: z.object({ reason: z.string().min(5).max(500) }),
  params: z.object({ id: objectId }),
  query: z.object({}),
});

export const correctionReviewSchema = z.object({
  body: z.object({
    status: z.enum(["approved", "rejected"]),
    note: z.string().max(500).optional(),
  }),
  params: z.object({ id: objectId }),
  query: z.object({}),
});
