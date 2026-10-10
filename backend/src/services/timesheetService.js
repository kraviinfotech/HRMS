import { Timesheet } from "../models/Timesheet.js";
import { assertOrThrow } from "../utils/httpError.js";
import { startOfLocalDay } from "../utils/dates.js";
import { getPagination, paginate } from "../utils/pagination.js";
import { ensureEmployeeForUser } from "./employeeService.js";

function hasOverlap(entries = []) {
  const ranges = entries
    .filter((entry) => entry.startAt && entry.endAt)
    .map((entry) => [new Date(entry.startAt).getTime(), new Date(entry.endAt).getTime()])
    .sort((a, b) => a[0] - b[0]);

  return ranges.some((range, index) => index > 0 && range[0] < ranges[index - 1][1]);
}

function totalMinutes(entries = []) {
  return entries.reduce((total, entry) => total + Number(entry.minutes || 0), 0);
}

export async function upsertTimesheet({ user, date, entries }) {
  const employee = await ensureEmployeeForUser(user);
  assertOrThrow(!hasOverlap(entries), 400, "Timesheet entries cannot overlap");

  const day = startOfLocalDay(date);
  const existing = await Timesheet.findOne({ employee: employee._id, date: day });
  assertOrThrow(!existing || ["draft", "correction_requested", "rejected"].includes(existing.status), 409, "Submitted or approved timesheets cannot be edited");

  const payload = {
    employee: employee._id,
    user: user._id,
    date: day,
    entries,
    totalMinutes: totalMinutes(entries),
    status: "draft",
  };

  if (existing) {
    Object.assign(existing, payload);
    await existing.save();
    return existing;
  }

  return Timesheet.create(payload);
}

export async function submitTimesheet({ user, id }) {
  const timesheet = await Timesheet.findById(id);
  assertOrThrow(timesheet, 404, "Timesheet not found");
  assertOrThrow(timesheet.user.toString() === user._id.toString(), 403, "You can only submit your own timesheets");
  assertOrThrow(timesheet.entries.length > 0, 400, "Add at least one timesheet entry before submitting");
  assertOrThrow(["draft", "correction_requested", "rejected"].includes(timesheet.status), 409, "Timesheet is already submitted");

  timesheet.status = "submitted";
  timesheet.submittedAt = new Date();
  await timesheet.save();
  return timesheet;
}

export async function reviewTimesheet({ admin, id, status, note }) {
  const timesheet = await Timesheet.findById(id);
  assertOrThrow(timesheet, 404, "Timesheet not found");
  assertOrThrow(timesheet.status === "submitted", 409, "Only submitted timesheets can be reviewed");

  timesheet.status = status;
  timesheet.reviewedBy = admin._id;
  timesheet.reviewedAt = new Date();
  timesheet.reviewNote = note;
  await timesheet.save();
  return timesheet;
}

export async function listTimesheets({ user, query }) {
  const { page, limit, skip } = getPagination(query);
  const filters = {};
  if (user.role === "admin") {
    if (query.employee) filters.employee = query.employee;
    if (query.status) filters.status = query.status;
  } else {
    filters.employee = user.employee._id;
  }

  return paginate(
    Timesheet.find(filters).populate("employee", "firstName lastName employeeCode department").sort({ date: -1 }).skip(skip).limit(limit),
    Timesheet.countDocuments(filters),
    { page, limit },
  );
}

export const timesheetRules = { hasOverlap, totalMinutes };
