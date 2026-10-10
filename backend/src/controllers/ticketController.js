import { createTicket, listTickets, updateTicket } from "../services/ticketService.js";
import { writeAudit } from "../services/auditService.js";
import { sendCreated, sendSuccess } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const index = asyncHandler(async (req, res) => {
  const result = await listTickets({ user: req.user, query: req.validated.query });
  sendSuccess(res, result.items, "Tickets loaded", 200, result.meta);
});

export const create = asyncHandler(async (req, res) => {
  const ticket = await createTicket({ user: req.user, payload: req.validated.body });
  await writeAudit({ req, action: "create_ticket", entity: "Ticket", entityId: ticket._id });
  sendCreated(res, ticket, "Ticket created");
});

export const update = asyncHandler(async (req, res) => {
  const ticket = await updateTicket({ user: req.user, id: req.params.id, payload: req.validated.body });
  await writeAudit({ req, action: "update_ticket", entity: "Ticket", entityId: ticket._id });
  sendSuccess(res, ticket, "Ticket updated");
});
