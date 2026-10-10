import { Ticket } from "../models/Ticket.js";
import { assertOrThrow } from "../utils/httpError.js";
import { getPagination, paginate } from "../utils/pagination.js";

async function nextTicketNo() {
  const prefix = `KHR-${new Date().getFullYear()}-`;
  const latest = await Ticket.findOne({ ticketNo: new RegExp(`^${prefix}`) }).sort({ ticketNo: -1 });
  const next = latest ? Number.parseInt(latest.ticketNo.slice(prefix.length), 10) + 1 : 1;
  return `${prefix}${String(next).padStart(4, "0")}`;
}

export async function createTicket({ user, payload }) {
  return Ticket.create({
    ...payload,
    ticketNo: await nextTicketNo(),
    createdBy: user._id,
    employee: user.employee?._id,
    history: [{ action: "created", actor: user._id, note: payload.subject }],
  });
}

export async function listTickets({ user, query }) {
  const { page, limit, skip } = getPagination(query);
  const filters = {};
  if (user.role === "employee") filters.createdBy = user._id;
  if (query.status) filters.status = query.status;
  if (query.priority) filters.priority = query.priority;
  if (query.search) filters.$text = { $search: query.search };

  return paginate(
    Ticket.find(filters).populate("employee", "firstName lastName employeeCode").sort({ createdAt: -1 }).skip(skip).limit(limit),
    Ticket.countDocuments(filters),
    { page, limit },
  );
}

export async function updateTicket({ user, id, payload }) {
  const ticket = await Ticket.findById(id);
  assertOrThrow(ticket, 404, "Ticket not found");
  if (user.role !== "admin") {
    assertOrThrow(ticket.createdBy.toString() === user._id.toString(), 403, "You can only update your own tickets");
  }

  if (payload.comment) {
    ticket.comments.push({ author: user._id, message: payload.comment, internal: payload.internal && user.role === "admin" });
  }
  if (user.role === "admin") {
    ["status", "priority", "assignee", "category"].forEach((field) => {
      if (payload[field] !== undefined) ticket[field] = payload[field];
    });
  }
  ticket.history.push({ action: payload.status || "commented", actor: user._id, note: payload.comment });
  await ticket.save();
  return ticket;
}
