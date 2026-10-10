import { z } from "zod";
import { objectId, paginationQuery } from "./commonValidation.js";

export const createTicketSchema = z.object({
  body: z.object({
    category: z.string().min(2).max(80),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
    subject: z.string().min(3).max(160),
    description: z.string().min(5).max(1000),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const updateTicketSchema = z.object({
  body: z.object({
    status: z.enum(["open", "assigned", "in_progress", "resolved", "closed"]).optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
    category: z.string().max(80).optional(),
    assignee: objectId.optional(),
    comment: z.string().max(1000).optional(),
    internal: z.boolean().optional(),
  }),
  params: z.object({ id: objectId }),
  query: z.object({}),
});

export const ticketListSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}),
  query: paginationQuery.extend({
    status: z.enum(["open", "assigned", "in_progress", "resolved", "closed"]).optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  }),
});
