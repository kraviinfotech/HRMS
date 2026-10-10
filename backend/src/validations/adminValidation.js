import { z } from "zod";
import { objectId, paginationQuery } from "./commonValidation.js";

export const announcementSchema = z.object({
  body: z.object({
    title: z.string().min(2).max(160),
    body: z.string().min(5).max(2000),
    audience: z.enum(["all", "admins", "employees"]).optional(),
    publishAt: z.coerce.date().optional(),
    expiresAt: z.coerce.date().optional(),
  }),
  params: z.object({ id: objectId }).partial(),
  query: z.object({}),
});

export const holidaySchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120),
    date: z.coerce.date(),
    type: z.enum(["public", "company", "optional"]).optional(),
    active: z.boolean().optional(),
  }),
  params: z.object({ id: objectId }).partial(),
  query: z.object({}),
});

export const settingsSchema = z.object({
  body: z.object({}).passthrough(),
  params: z.object({}),
  query: z.object({}),
});

export const notificationCreateSchema = z.object({
  body: z.object({
    user: objectId,
    title: z.string().min(2).max(160),
    message: z.string().min(2).max(500),
    type: z.string().max(40).optional(),
    link: z.string().max(250).optional(),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const joiningLetterSchema = z.object({
  body: z.object({ employee: objectId }),
  params: z.object({}),
  query: z.object({}),
});

export const listSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).partial(),
  query: paginationQuery.passthrough(),
});
