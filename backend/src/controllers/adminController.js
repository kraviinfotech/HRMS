import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import PDFDocument from "pdfkit";
import { Announcement } from "../models/Announcement.js";
import { AuditLog } from "../models/AuditLog.js";
import { Holiday } from "../models/Holiday.js";
import { Employee } from "../models/Employee.js";
import { Payroll } from "../models/Payroll.js";
import { Attendance } from "../models/Attendance.js";
import { Task } from "../models/Task.js";
import { Ticket } from "../models/Ticket.js";
import { Timesheet } from "../models/Timesheet.js";
import { Leave } from "../models/Leave.js";
import { Notification } from "../models/Notification.js";
import { getCompanySettings, updateCompanySettings } from "../services/settingsService.js";
import { writeAudit } from "../services/auditService.js";
import { getPagination, paginate } from "../utils/pagination.js";
import { sendCreated, sendSuccess } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { assertOrThrow } from "../utils/httpError.js";

export const listAnnouncements = asyncHandler(async (req, res) => {
  const query = req.validated?.query || req.query;
  const filters = {};
  if (req.user.role === "employee") {
    filters.audience = { $in: ["all", "employees"] };
    filters.publishAt = { $lte: new Date() };
    filters.$or = [{ expiresAt: null }, { expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }];
  }
  const { page, limit, skip } = getPagination(query);
  const result = await paginate(
    Announcement.find(filters).sort({ publishAt: -1 }).skip(skip).limit(limit),
    Announcement.countDocuments(filters),
    { page, limit },
  );
  sendSuccess(res, result.items, "Announcements loaded", 200, result.meta);
});

export const createAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.create({ ...req.validated.body, createdBy: req.user._id });
  await writeAudit({ req, action: "create_announcement", entity: "Announcement", entityId: announcement._id });
  sendCreated(res, announcement, "Announcement created");
});

export const updateAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.validated.body, { new: true, runValidators: true });
  assertOrThrow(announcement, 404, "Announcement not found");
  await writeAudit({ req, action: "update_announcement", entity: "Announcement", entityId: announcement._id });
  sendSuccess(res, announcement, "Announcement updated");
});

export const deleteAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findByIdAndDelete(req.params.id);
  assertOrThrow(announcement, 404, "Announcement not found");
  await writeAudit({ req, action: "delete_announcement", entity: "Announcement", entityId: announcement._id });
  sendSuccess(res, null, "Announcement deleted");
});

export const listHolidays = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const result = await paginate(Holiday.find({}).sort({ date: 1 }).skip(skip).limit(limit), Holiday.countDocuments({}), {
    page,
    limit,
  });
  sendSuccess(res, result.items, "Holidays loaded", 200, result.meta);
});

export const createHoliday = asyncHandler(async (req, res) => {
  const holiday = await Holiday.create(req.validated.body);
  await writeAudit({ req, action: "create_holiday", entity: "Holiday", entityId: holiday._id });
  sendCreated(res, holiday, "Holiday created");
});

export const updateHoliday = asyncHandler(async (req, res) => {
  const holiday = await Holiday.findByIdAndUpdate(req.params.id, req.validated.body, { new: true, runValidators: true });
  assertOrThrow(holiday, 404, "Holiday not found");
  await writeAudit({ req, action: "update_holiday", entity: "Holiday", entityId: holiday._id });
  sendSuccess(res, holiday, "Holiday updated");
});

export const deleteHoliday = asyncHandler(async (req, res) => {
  const holiday = await Holiday.findByIdAndDelete(req.params.id);
  assertOrThrow(holiday, 404, "Holiday not found");
  await writeAudit({ req, action: "delete_holiday", entity: "Holiday", entityId: holiday._id });
  sendSuccess(res, null, "Holiday deleted");
});

export const getSettings = asyncHandler(async (_req, res) => {
  sendSuccess(res, await getCompanySettings(), "Company settings loaded");
});

export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await updateCompanySettings(req.validated.body);
  await writeAudit({ req, action: "update_settings", entity: "CompanySettings", entityId: settings._id });
  sendSuccess(res, settings, "Company settings updated");
});

export const listAuditLogs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const result = await paginate(
    AuditLog.find({}).populate("actor", "name email role").sort({ createdAt: -1 }).skip(skip).limit(limit),
    AuditLog.countDocuments({}),
    { page, limit },
  );
  sendSuccess(res, result.items, "Audit logs loaded", 200, result.meta);
});

export const reports = asyncHandler(async (_req, res) => {
  const [employees, attendance, tasks, timesheets, leaves, tickets, payroll] = await Promise.all([
    Employee.countDocuments({}),
    Attendance.countDocuments({}),
    Task.countDocuments({}),
    Timesheet.countDocuments({}),
    Leave.countDocuments({}),
    Ticket.countDocuments({}),
    Payroll.aggregate([{ $group: { _id: "$status", total: { $sum: "$netPay" }, count: { $sum: 1 } } }]),
  ]);

  sendSuccess(
    res,
    {
      employees,
      attendance,
      tasks,
      timesheets,
      leaves,
      tickets,
      payroll,
    },
    "Reports loaded",
  );
});

export const birthdays = asyncHandler(async (_req, res) => {
  const employees = await Employee.find({ dateOfBirth: { $exists: true }, employmentStatus: "active" })
    .select("firstName lastName dateOfBirth department")
    .limit(100);
  sendSuccess(res, employees, "Birthdays loaded");
});

export const createNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.create(req.validated.body);
  await writeAudit({ req, action: "create_notification", entity: "Notification", entityId: notification._id });
  sendCreated(res, notification, "Notification created");
});

export const generateJoiningLetter = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.validated.body.employee);
  assertOrThrow(employee, 404, "Employee not found");
  const settings = await getCompanySettings();
  const directory = path.join("storage", "letters");
  await fsp.mkdir(directory, { recursive: true });
  const fileName = `joining-letter-${employee.employeeCode}.pdf`;
  const filePath = path.join(directory, fileName);

  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 56 });
    const stream = fs.createWriteStream(filePath);
    stream.on("finish", resolve);
    stream.on("error", reject);
    doc.pipe(stream);
    doc.fontSize(18).text(settings.companyName, { align: "center" });
    doc.moveDown(2);
    doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString("en-IN")}`);
    doc.moveDown();
    doc.text(`Dear ${employee.firstName} ${employee.lastName},`);
    doc.moveDown();
    doc.text(`We are pleased to confirm your joining with ${settings.companyName} as ${employee.designation} in the ${employee.department} department.`);
    doc.moveDown();
    doc.text(`Your employee ID is ${employee.employeeCode}, and your joining date is ${new Date(employee.joiningDate).toLocaleDateString("en-IN")}.`);
    doc.moveDown();
    doc.text("This letter is generated by Kravi HRMS and should be reviewed by an authorized HR representative before formal issuance.");
    doc.moveDown(3);
    doc.text("Authorized Signatory");
    doc.end();
  });

  await writeAudit({ req, action: "generate_joining_letter", entity: "Employee", entityId: employee._id });
  res.download(filePath, fileName);
});
