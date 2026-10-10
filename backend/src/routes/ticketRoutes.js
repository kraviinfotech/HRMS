import { Router } from "express";
import * as tickets from "../controllers/ticketController.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createTicketSchema, ticketListSchema, updateTicketSchema } from "../validations/ticketValidation.js";

export const ticketRoutes = Router();

ticketRoutes.get("/", requireAuth, validate(ticketListSchema), tickets.index);
ticketRoutes.post("/", requireAuth, validate(createTicketSchema), tickets.create);
ticketRoutes.patch("/:id", requireAuth, validate(updateTicketSchema), tickets.update);
