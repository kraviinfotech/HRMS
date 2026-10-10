import {
  checkIn,
  checkOut,
  getTodayAttendance,
  listAttendance,
  requestAttendanceCorrection,
  reviewAttendanceCorrection,
} from "../services/attendanceService.js";
import { writeAudit } from "../services/auditService.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const today = asyncHandler(async (req, res) => {
  sendSuccess(res, await getTodayAttendance(req.user), "Today attendance loaded");
});

export const punchIn = asyncHandler(async (req, res) => {
  const attendance = await checkIn(req.user, req.validated.body.location);
  await writeAudit({ req, action: "check_in", entity: "Attendance", entityId: attendance._id });
  sendSuccess(res, attendance, "Checked in successfully");
});

export const punchOut = asyncHandler(async (req, res) => {
  const attendance = await checkOut(req.user, req.validated.body.location);
  await writeAudit({ req, action: "check_out", entity: "Attendance", entityId: attendance._id });
  sendSuccess(res, attendance, "Checked out successfully");
});

export const index = asyncHandler(async (req, res) => {
  const result = await listAttendance({ query: req.validated.query, user: req.user });
  sendSuccess(res, result.items, "Attendance records loaded", 200, result.meta);
});

export const correction = asyncHandler(async (req, res) => {
  const attendance = await requestAttendanceCorrection({ user: req.user, id: req.params.id, reason: req.validated.body.reason });
  sendSuccess(res, attendance, "Attendance correction requested");
});

export const reviewCorrection = asyncHandler(async (req, res) => {
  const attendance = await reviewAttendanceCorrection({ admin: req.user, id: req.params.id, ...req.validated.body });
  await writeAudit({ req, action: `attendance_correction_${req.validated.body.status}`, entity: "Attendance", entityId: attendance._id });
  sendSuccess(res, attendance, "Attendance correction reviewed");
});
