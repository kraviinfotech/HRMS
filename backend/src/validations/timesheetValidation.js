import { z } from "zod";
import { objectId, paginationQuery } from "./commonValidation.js";

const entrySchema = z.object({
  task: objectId.optional().or(z.literal("")),
  description: z.string().min(2).max(500),
  startAt: z.coerce.date().optional(),
  endAt: z.coerce.date().optional(),
  minutes: z.coerce.number().int().positive().max(1440),
});

export const upsertTimesheetSchema = z.object({
  body: z.object({
    date: z.coerce.date(),
    entries: z.array(entrySchema).min(1),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const timesheetListSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}),
  query: paginationQuery.extend({
    employee: objectId.optional(),
    status: z.enum(["draft", "submitted", "approved", "rejected", "correction_requested"]).optional(),
  }),
});

export const timesheetReviewSchema = z.object({
  body: z.object({
    status: z.enum(["approved", "rejected", "correction_requested"]),
    note: z.string().max(500).optional(),
  }),
  params: z.object({ id: objectId }),
  query: z.object({}),
});
