import { Employee } from "../models/Employee.js";
import { Attendance } from "../models/Attendance.js";
import { Document } from "../models/Document.js";
import { Leave } from "../models/Leave.js";
import { Notification } from "../models/Notification.js";
import { OtpToken } from "../models/OtpToken.js";
import { Payroll } from "../models/Payroll.js";
import { Session } from "../models/Session.js";
import { Task } from "../models/Task.js";
import { Ticket } from "../models/Ticket.js";
import { Timesheet } from "../models/Timesheet.js";
import { User } from "../models/User.js";
import { HttpError, assertOrThrow } from "../utils/httpError.js";
import { getPagination, paginate } from "../utils/pagination.js";
import { hashPassword } from "./authService.js";

async function generateEmployeeCode() {
  const year = new Date().getFullYear();
  const prefix = `KRV-${year}-`;
  const latest = await Employee.findOne({ employeeCode: new RegExp(`^${prefix}`) }).sort({ employeeCode: -1 });
  const nextNumber = latest ? Number.parseInt(latest.employeeCode.slice(prefix.length), 10) + 1 : 1;
  return `${prefix}${String(nextNumber).padStart(4, "0")}`;
}

export async function createEmployee(payload) {
  const { password, ...employeePayload } = payload;
  const normalizedEmail = employeePayload.email.toLowerCase();
  const existing = await User.exists({ email: normalizedEmail });
  assertOrThrow(!existing, 409, "An account with this email already exists");

  const employeeCode = employeePayload.employeeCode || (await generateEmployeeCode());
  const duplicateCode = await Employee.exists({ employeeCode });
  assertOrThrow(!duplicateCode, 409, "Employee ID already exists");

  const employee = await Employee.create({
    ...employeePayload,
    employeeCode,
    email: normalizedEmail,
  });

  try {
    const passwordHash = await hashPassword(password);
    const user = await User.create({
      name: `${employeePayload.firstName} ${employeePayload.lastName}`.trim(),
      email: normalizedEmail,
      role: "employee",
      status: "active",
      passwordHash,
      employee: employee._id,
      passwordChangedAt: new Date(),
    });
    employee.user = user._id;
    await employee.save();
    return employee.populate("user");
  } catch (error) {
    await Employee.findByIdAndDelete(employee._id);
    throw error;
  }
}

export async function listEmployees(query) {
  const { page, limit, skip } = getPagination(query);
  const filters = {};

  if (query.department) filters.department = query.department;
  if (query.employmentStatus) filters.employmentStatus = query.employmentStatus;
  if (query.search) filters.$text = { $search: query.search };

  return paginate(
    Employee.find(filters)
      .populate("reportingManager", "firstName lastName employeeCode")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Employee.countDocuments(filters),
    { page, limit },
  );
}

export async function getEmployeeById(id) {
  const employee = await Employee.findById(id)
    .populate("user", "email role status lastLoginAt")
    .populate("reportingManager", "firstName lastName employeeCode");
  assertOrThrow(employee, 404, "Employee not found");
  return employee;
}

export async function updateEmployee(id, payload) {
  if (payload.email) {
    const duplicate = await Employee.exists({ email: payload.email.toLowerCase(), _id: { $ne: id } });
    assertOrThrow(!duplicate, 409, "Another employee already uses this email");
  }

  const employee = await Employee.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  assertOrThrow(employee, 404, "Employee not found");

  if (payload.email || payload.firstName || payload.lastName) {
    await User.findByIdAndUpdate(employee.user, {
      ...(payload.email ? { email: payload.email.toLowerCase() } : {}),
      name: `${employee.firstName} ${employee.lastName}`.trim(),
    });
  }

  return employee;
}

export async function setEmployeeStatus(id, status) {
  const employee = await Employee.findById(id);
  assertOrThrow(employee, 404, "Employee not found");
  employee.employmentStatus = status === "active" ? "active" : "inactive";
  await employee.save();
  await User.findByIdAndUpdate(employee.user, { status: status === "active" ? "active" : "inactive" });
  return employee;
}

function deletedCount(result) {
  return result?.deletedCount || 0;
}

export async function deleteEmployeeCascade(id) {
  const employee = await Employee.findById(id).populate("user");
  assertOrThrow(employee, 404, "Employee not found");

  const userId = employee.user?._id || employee.user;
  if (employee.user?.role === "admin") {
    throw new HttpError(409, "Admin accounts cannot be deleted from employee management");
  }

  const userFilters = userId
    ? {
        user: userId,
        email: employee.email,
      }
    : {
        user: undefined,
        email: employee.email,
      };

  const [
    attendances,
    documents,
    leaves,
    payrolls,
    tasks,
    tickets,
    timesheets,
    notifications,
    otpTokens,
    sessions,
  ] = await Promise.all([
    Attendance.deleteMany({ employee: employee._id }),
    Document.deleteMany({
      $or: [{ employee: employee._id }, ...(userId ? [{ uploadedBy: userId }] : [])],
    }),
    Leave.deleteMany({ employee: employee._id }),
    Payroll.deleteMany({ employee: employee._id }),
    Task.deleteMany({ assignee: employee._id }),
    Ticket.deleteMany({
      $or: [{ employee: employee._id }, ...(userId ? [{ createdBy: userId }] : [])],
    }),
    Timesheet.deleteMany({ employee: employee._id }),
    userId ? Notification.deleteMany({ user: userId }) : Promise.resolve({ deletedCount: 0 }),
    OtpToken.deleteMany({
      $or: [{ email: userFilters.email }, ...(userId ? [{ user: userFilters.user }] : [])],
    }),
    userId ? Session.deleteMany({ user: userId }) : Promise.resolve({ deletedCount: 0 }),
  ]);

  if (userId) {
    await Promise.all([
      Task.updateMany({ "comments.author": userId }, { $pull: { comments: { author: userId } } }),
      Ticket.updateMany(
        { $or: [{ assignee: userId }, { "comments.author": userId }, { "history.actor": userId }] },
        {
          $unset: { assignee: "" },
          $pull: {
            comments: { author: userId },
            history: { actor: userId },
          },
        },
      ),
      User.deleteOne({ _id: userId }),
    ]);
  }

  await Promise.all([
    Employee.updateMany({ reportingManager: employee._id }, { $unset: { reportingManager: "" } }),
    Employee.deleteOne({ _id: employee._id }),
  ]);

  return {
    employee: 1,
    user: userId ? 1 : 0,
    attendances: deletedCount(attendances),
    documents: deletedCount(documents),
    leaves: deletedCount(leaves),
    payrolls: deletedCount(payrolls),
    tasks: deletedCount(tasks),
    tickets: deletedCount(tickets),
    timesheets: deletedCount(timesheets),
    notifications: deletedCount(notifications),
    otpTokens: deletedCount(otpTokens),
    sessions: deletedCount(sessions),
  };
}

export async function ensureEmployeeForUser(user) {
  if (!user.employee) {
    throw new HttpError(403, "Employee profile is required for this action");
  }
  return user.employee;
}
