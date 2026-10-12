import { Attendance } from "../models/Attendance.js";
import { assertOrThrow } from "../utils/httpError.js";
import { endOfLocalDay, minutesBetween, startOfLocalDay } from "../utils/dates.js";
import { getPagination, paginate } from "../utils/pagination.js";
import { ensureEmployeeForUser } from "./employeeService.js";

const DEFAULT_SHIFT_START = "09:00";
const DEFAULT_SHIFT_END = "18:00";
const MAX_OPEN_ATTENDANCE_MINUTES = 24 * 60;

function timeOnDate(date, time) {
  const [hours, minutes] = String(time).split(":").map(Number);
  const value = new Date(date);
  value.setHours(hours, minutes, 0, 0);
  return value;
}

function shiftWindowFor(attendance) {
  const start = timeOnDate(attendance.date, attendance.shiftStartTime || DEFAULT_SHIFT_START);
  const end = timeOnDate(attendance.date, attendance.shiftEndTime || DEFAULT_SHIFT_END);
  if (end <= start) {
    end.setDate(end.getDate() + 1);
  }
  return { start, end };
}

function latestPunch(attendance) {
  const punches = attendance?.punches || [];
  return punches[punches.length - 1] || null;
}

function openSessionStartedAt(attendance, now = new Date()) {
  const punch = latestPunch(attendance);
  if (punch?.type !== "check_in" || !punch.at) return null;

  const startedAt = new Date(punch.at);
  return minutesBetween(startedAt, now) < MAX_OPEN_ATTENDANCE_MINUTES ? startedAt : null;
}

function hasStaleOpenSession(attendance, now = new Date()) {
  const punch = latestPunch(attendance);
  if (punch?.type !== "check_in" || !punch.at) return false;
  return minutesBetween(punch.at, now) >= MAX_OPEN_ATTENDANCE_MINUTES;
}

function completedDurationMinutes(punches = []) {
  let openPunchAt = null;
  let totalMinutes = 0;

  for (const punch of punches) {
    if (punch.type === "check_in") {
      openPunchAt = punch.at;
    } else if (punch.type === "check_out" && openPunchAt) {
      totalMinutes += minutesBetween(openPunchAt, punch.at);
      openPunchAt = null;
    }
  }

  return totalMinutes;
}

function applyCheckoutSummary(attendance, checkoutAt) {
  const { start, end } = shiftWindowFor(attendance);
  attendance.durationMinutes = completedDurationMinutes(attendance.punches);
  attendance.lateMinutes = Math.max(minutesBetween(start, attendance.checkInAt), 0);
  attendance.overtimeMinutes = checkoutAt > end ? minutesBetween(end, checkoutAt) : 0;
  attendance.status = "present";
}

async function expireStaleOpenAttendances(employeeId) {
  const now = new Date();
  const filter = {
    status: { $ne: "absent" },
    "punches.type": "check_in",
  };

  if (employeeId) {
    filter.employee = employeeId;
  }

  const candidates = await Attendance.find(filter);
  await Promise.all(
    candidates.map(async (attendance) => {
      if (!hasStaleOpenSession(attendance, now)) return;

      const punch = latestPunch(attendance);
      const staleNote = `Marked absent because checkout was not completed within 24 hours for check-in at ${new Date(punch.at).toISOString()}.`;
      const alreadyMarked = attendance.auditTrail.some((entry) => entry.action === "auto_absent" && entry.note === staleNote);
      if (alreadyMarked) return;

      const completedMinutes = completedDurationMinutes(attendance.punches);
      attendance.status = completedMinutes > 0 ? "present" : "absent";
      attendance.durationMinutes = completedMinutes;
      attendance.auditTrail.push({
        action: "auto_absent",
        at: now,
        note: staleNote,
      });
      await attendance.save();
    }),
  );
}

async function findOpenAttendance(employeeId) {
  const now = new Date();
  const cutoff = new Date(now.getTime() - MAX_OPEN_ATTENDANCE_MINUTES * 60 * 1000);
  const candidates = await Attendance.find({
    employee: employeeId,
    date: { $gte: startOfLocalDay(cutoff) },
    status: { $ne: "absent" },
    "punches.type": "check_in",
  }).sort({ checkInAt: -1 });

  return candidates.find((attendance) => openSessionStartedAt(attendance, now)) || null;
}

function attendanceFilters({ query, user }) {
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

  return filters;
}

export async function getTodayAttendance(user) {
  const employee = await ensureEmployeeForUser(user);
  await expireStaleOpenAttendances(employee._id);
  const openAttendance = await findOpenAttendance(employee._id);
  if (openAttendance) {
    return openAttendance;
  }
  return Attendance.findOne({
    employee: employee._id,
    date: startOfLocalDay(),
  });
}

export async function checkIn(user, location) {
  const employee = await ensureEmployeeForUser(user);
  await expireStaleOpenAttendances(employee._id);
  const openAttendance = await findOpenAttendance(employee._id);
  assertOrThrow(!openAttendance, 409, "You already have an active check-in. Please check out first.");

  const date = startOfLocalDay();
  const existing = await Attendance.findOne({ employee: employee._id, date });

  const now = new Date();
  const attendance =
    existing ||
    new Attendance({
      employee: employee._id,
      user: user._id,
      date,
      status: "present",
      shiftStartTime: employee.shiftStartTime || DEFAULT_SHIFT_START,
      shiftEndTime: employee.shiftEndTime || DEFAULT_SHIFT_END,
      auditTrail: [],
    });

  attendance.checkInAt ||= now;
  attendance.checkOutAt = null;
  attendance.status = "present";
  attendance.punches.push({ type: "check_in", at: now, location });
  attendance.auditTrail.push({ action: "check_in", actor: user._id, note: "Employee check-in" });
  await attendance.save();
  return attendance;
}

export async function checkOut(user, location) {
  const employee = await ensureEmployeeForUser(user);
  await expireStaleOpenAttendances(employee._id);
  const attendance = await findOpenAttendance(employee._id);
  assertOrThrow(attendance && openSessionStartedAt(attendance), 409, "Check-in is required before check-out");

  const now = new Date();
  attendance.punches.push({ type: "check_out", at: now, location });
  attendance.checkOutAt = now;
  applyCheckoutSummary(attendance, now);
  attendance.auditTrail.push({ action: "check_out", actor: user._id, note: "Employee check-out" });
  await attendance.save();
  return attendance;
}

export async function listAttendance({ query, user }) {
  await expireStaleOpenAttendances(user.role !== "admin" ? user.employee._id : undefined);
  const { page, limit, skip } = getPagination(query);
  const filters = attendanceFilters({ query, user });

  return paginate(
    Attendance.find(filters)
      .populate("employee", "firstName lastName employeeCode department email")
      .sort({ date: -1, checkInAt: -1 })
      .skip(skip)
      .limit(limit),
    Attendance.countDocuments(filters),
    { page, limit },
  );
}

export async function listAttendanceForReport({ query, user }) {
  await expireStaleOpenAttendances(user.role !== "admin" ? user.employee._id : undefined);
  return Attendance.find(attendanceFilters({ query, user }))
    .populate("employee", "firstName lastName employeeCode department email")
    .sort({ date: -1, checkInAt: -1 })
    .lean();
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
