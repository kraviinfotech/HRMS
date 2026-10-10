import { Leave } from "../models/Leave.js";
import { assertOrThrow } from "../utils/httpError.js";
import { getPagination, paginate } from "../utils/pagination.js";
import { ensureEmployeeForUser } from "./employeeService.js";

export function calculateLeaveDays(startDate, endDate, halfDay = false) {
  if (halfDay) return 0.5;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const ms = end.setHours(0, 0, 0, 0) - start.setHours(0, 0, 0, 0);
  return Math.max(Math.floor(ms / 86400000) + 1, 1);
}

async function assertNoOverlap(employeeId, startDate, endDate) {
  const overlapping = await Leave.exists({
    employee: employeeId,
    status: { $in: ["pending", "approved"] },
    startDate: { $lte: endDate },
    endDate: { $gte: startDate },
  });
  assertOrThrow(!overlapping, 409, "Leave request overlaps an existing pending or approved leave");
}

export async function applyLeave({ user, payload }) {
  const employee = await ensureEmployeeForUser(user);
  const startDate = new Date(payload.startDate);
  const endDate = new Date(payload.endDate);
  assertOrThrow(endDate >= startDate, 400, "Leave end date cannot be before start date");
  await assertNoOverlap(employee._id, startDate, endDate);

  return Leave.create({
    employee: employee._id,
    user: user._id,
    ...payload,
    startDate,
    endDate,
    days: calculateLeaveDays(startDate, endDate, payload.halfDay),
    history: [{ action: "applied", actor: user._id, note: payload.reason }],
  });
}

export async function reviewLeave({ admin, id, status, note }) {
  const leave = await Leave.findById(id);
  assertOrThrow(leave, 404, "Leave request not found");
  assertOrThrow(leave.status === "pending", 409, "Only pending leave requests can be reviewed");

  leave.status = status;
  leave.reviewedBy = admin._id;
  leave.reviewedAt = new Date();
  leave.reviewNote = note;
  leave.history.push({ action: status, actor: admin._id, note });
  await leave.save();
  return leave;
}

export async function cancelLeave({ user, id }) {
  const leave = await Leave.findById(id);
  assertOrThrow(leave, 404, "Leave request not found");
  assertOrThrow(leave.user.toString() === user._id.toString(), 403, "You can only cancel your own leave requests");
  assertOrThrow(leave.status === "pending", 409, "Only pending leave requests can be cancelled");

  leave.status = "cancelled";
  leave.history.push({ action: "cancelled", actor: user._id, note: "Cancelled by employee" });
  await leave.save();
  return leave;
}

export async function listLeaves({ user, query }) {
  const { page, limit, skip } = getPagination(query);
  const filters = {};
  if (user.role === "employee") filters.employee = user.employee._id;
  if (user.role === "admin" && query.employee) filters.employee = query.employee;
  if (query.status) filters.status = query.status;

  return paginate(
    Leave.find(filters).populate("employee", "firstName lastName employeeCode department").sort({ createdAt: -1 }).skip(skip).limit(limit),
    Leave.countDocuments(filters),
    { page, limit },
  );
}
