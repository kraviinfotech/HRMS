import { z } from "zod";
import { objectId, paginationQuery } from "./commonValidation.js";

const attendanceLocationSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  accuracy: z.coerce.number().nonnegative().optional(),
  label: z.string().max(160).optional(),
});

export const attendancePunchSchema = z.object({
  body: z.object({ location: attendanceLocationSchema }),
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
