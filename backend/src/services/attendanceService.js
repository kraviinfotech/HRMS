import { Attendance } from "../models/Attendance.js";
import { assertOrThrow } from "../utils/httpError.js";
import { endOfLocalDay, minutesBetween, startOfLocalDay } from "../utils/dates.js";
import { getPagination, paginate } from "../utils/pagination.js";
import { ensureEmployeeForUser } from "./employeeService.js";

export async function getTodayAttendance(user) {
  const employee = await ensureEmployeeForUser(user);
  return Attendance.findOne({
    employee: employee._id,
    date: startOfLocalDay(),
  });
}

export async function checkIn(user, location) {
  const employee = await ensureEmployeeForUser(user);
  const date = startOfLocalDay();
  const existing = await Attendance.findOne({ employee: employee._id, date });
  assertOrThrow(!existing?.checkInAt, 409, "You have already checked in today");

  const now = new Date();
  const attendance =
    existing ||
    new Attendance({
      employee: employee._id,
      user: user._id,
      date,
      status: "present",
      auditTrail: [],
    });

  attendance.checkInAt = now;
  attendance.punches.push({ type: "check_in", at: now, location });
  attendance.auditTrail.push({ action: "check_in", actor: user._id, note: "Employee check-in" });
  await attendance.save();
  return attendance;
}

export async function checkOut(user, location) {
  const employee = await ensureEmployeeForUser(user);
  const attendance = await Attendance.findOne({ employee: employee._id, date: startOfLocalDay() });
  assertOrThrow(attendance?.checkInAt, 409, "Check-in is required before check-out");
  assertOrThrow(!attendance.checkOutAt, 409, "You have already checked out today");

  const now = new Date();
  attendance.checkOutAt = now;
  attendance.durationMinutes = minutesBetween(attendance.checkInAt, now);
  attendance.punches.push({ type: "check_out", at: now, location });
  attendance.auditTrail.push({ action: "check_out", actor: user._id, note: "Employee check-out" });
  await attendance.save();
  return attendance;
}

export async function listAttendance({ query, user }) {
  const { page, limit, skip } = getPagination(query);
  const filters = {};

  if (user.role !== "admin") {
    filters.employee = user.employee._id;
  } else if (query.employee) {
    filters.employee = query.employee;
  }

  if (query.status) filters.status = query.status;
  if (query.from || query.to) {
    filters.date = {};
    if (query.from) filters.date.$gte = startOfLocalDay(query.from);
    if (query.to) filters.date.$lte = endOfLocalDay(query.to);
  }

  return paginate(
    Attendance.find(filters).populate("employee", "firstName lastName employeeCode department").sort({ date: -1 }).skip(skip).limit(limit),
    Attendance.countDocuments(filters),
    { page, limit },
  );
}

export async function requestAttendanceCorrection({ user, id, reason }) {
  const attendance = await Attendance.findById(id);
  assertOrThrow(attendance, 404, "Attendance record not found");
  assertOrThrow(attendance.employee.toString() === user.employee._id.toString(), 403, "You can only correct your own attendance");

  attendance.correctionRequest = {
    status: "pending",
    requestedBy: user._id,
    requestedAt: new Date(),
    reason,
  };
  attendance.auditTrail.push({ action: "correction_requested", actor: user._id, note: reason });
  await attendance.save();
  return attendance;
}

export async function reviewAttendanceCorrection({ admin, id, status, note }) {
  const attendance = await Attendance.findById(id);
  assertOrThrow(attendance, 404, "Attendance record not found");
  assertOrThrow(attendance.correctionRequest?.status === "pending", 409, "No pending correction request exists");

  attendance.correctionRequest.status = status;
  attendance.correctionRequest.adminNote = note;
  attendance.auditTrail.push({ action: `correction_${status}`, actor: admin._id, note });
  await attendance.save();
  return attendance;
}
