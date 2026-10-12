import {
  checkIn,
  checkOut,
  getTodayAttendance,
  listAttendance,
  listAttendanceForReport,
  requestAttendanceCorrection,
  reviewAttendanceCorrection,
} from "../services/attendanceService.js";
import { buildAttendanceReportRows, buildAttendanceReportWorkbook } from "../services/attendanceReportService.js";
import { writeAudit } from "../services/auditService.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function locationAuditMetadata(location) {
  if (!location) return undefined;

  const latitude = Number(location.latitude);
  const longitude = Number(location.longitude);
  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);

  return {
    location: {
      ...location,
      ...(hasCoordinates ? { googleMapsUrl: `https://www.google.com/maps?q=${latitude},${longitude}` } : {}),
    },
  };
}

export const today = asyncHandler(async (req, res) => {
  sendSuccess(res, await getTodayAttendance(req.user), "Today attendance loaded");
});

export const punchIn = asyncHandler(async (req, res) => {
  const location = req.validated.body.location;
  const attendance = await checkIn(req.user, location);
  await writeAudit({ req, action: "check_in", entity: "Attendance", entityId: attendance._id, metadata: locationAuditMetadata(location) });
  sendSuccess(res, attendance, "Checked in successfully");
});

export const punchOut = asyncHandler(async (req, res) => {
  const location = req.validated.body.location;
  const attendance = await checkOut(req.user, location);
  await writeAudit({ req, action: "check_out", entity: "Attendance", entityId: attendance._id, metadata: locationAuditMetadata(location) });
  sendSuccess(res, attendance, "Checked out successfully");
});

export const index = asyncHandler(async (req, res) => {
  const result = await listAttendance({ query: req.validated.query, user: req.user });
  sendSuccess(res, result.items, "Attendance records loaded", 200, result.meta);
});

export const exportReport = asyncHandler(async (req, res) => {
  const attendances = await listAttendanceForReport({ query: req.validated.query, user: req.user });
  const workbook = buildAttendanceReportWorkbook(buildAttendanceReportRows(attendances));

  res.header("Content-Type", "application/vnd.ms-excel; charset=utf-8");
  res.attachment("attendance-report.xls");
  res.send(workbook);
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
