import { z } from "zod";
import { objectId, paginationQuery } from "./commonValidation.js";

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(2).max(160),
    description: z.string().max(1000).optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
    assignee: objectId,
    startDate: z.coerce.date().optional(),
    deadline: z.coerce.date().optional(),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(2).max(160).optional(),
    description: z.string().max(1000).optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
    assignee: objectId.optional(),
    startDate: z.coerce.date().optional(),
    deadline: z.coerce.date().optional(),
    status: z.enum(["todo", "in_progress", "blocked", "completed", "cancelled"]).optional(),
    progress: z.coerce.number().min(0).max(100).optional(),
    comment: z.string().max(500).optional(),
  }),
  params: z.object({ id: objectId }),
  query: z.object({}),
});

export const taskListSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}),
  query: paginationQuery.extend({
    assignee: objectId.optional(),
    status: z.enum(["todo", "in_progress", "blocked", "completed", "cancelled"]).optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  }),
});
