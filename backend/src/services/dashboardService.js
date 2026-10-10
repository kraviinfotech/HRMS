import { Attendance } from "../models/Attendance.js";
import { Employee } from "../models/Employee.js";
import { Leave } from "../models/Leave.js";
import { Payroll } from "../models/Payroll.js";
import { Task } from "../models/Task.js";
import { Ticket } from "../models/Ticket.js";
import { Timesheet } from "../models/Timesheet.js";
import { startOfLocalDay, toMonthKey } from "../utils/dates.js";

export async function getAdminDashboard() {
  const today = startOfLocalDay();
  const month = toMonthKey();
  const [activeEmployees, attendance, pendingTimesheets, pendingLeaves, openTasks, openTickets, payrollDrafts, birthdays] =
    await Promise.all([
      Employee.countDocuments({ employmentStatus: "active" }),
      Attendance.aggregate([{ $match: { date: today } }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
      Timesheet.countDocuments({ status: "submitted" }),
      Leave.countDocuments({ status: "pending" }),
      Task.countDocuments({ status: { $in: ["todo", "in_progress", "blocked"] } }),
      Ticket.countDocuments({ status: { $in: ["open", "assigned", "in_progress"] } }),
      Payroll.countDocuments({ month, status: "draft" }),
      Employee.find({ employmentStatus: "active" }).select("firstName lastName dateOfBirth department").limit(8),
    ]);

  return {
    activeEmployees,
    attendance: Object.fromEntries(attendance.map((item) => [item._id, item.count])),
    pendingTimesheets,
    pendingLeaves,
    openTasks,
    openTickets,
    payrollDrafts,
    birthdays,
  };
}

export async function getEmployeeDashboard(user) {
  const today = startOfLocalDay();
  const [attendance, tasks, timesheets, leaves, tickets, payroll] = await Promise.all([
    Attendance.findOne({ employee: user.employee._id, date: today }),
    Task.find({ assignee: user.employee._id, status: { $nin: ["completed", "cancelled"] } }).sort({ deadline: 1 }).limit(5),
    Timesheet.find({ employee: user.employee._id, status: { $in: ["draft", "correction_requested", "rejected"] } }).sort({ date: -1 }).limit(5),
    Leave.find({ employee: user.employee._id }).sort({ createdAt: -1 }).limit(5),
    Ticket.find({ createdBy: user._id }).sort({ createdAt: -1 }).limit(5),
    Payroll.find({ employee: user.employee._id, status: { $in: ["finalized", "paid"] } }).sort({ month: -1 }).limit(3),
  ]);

  return {
    employee: user.employee,
    attendance,
    tasks,
    timesheets,
    leaves,
    tickets,
    payroll,
  };
}
