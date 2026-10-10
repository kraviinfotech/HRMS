import { Task } from "../models/Task.js";
import { assertOrThrow } from "../utils/httpError.js";
import { getPagination, paginate } from "../utils/pagination.js";

export async function createTask({ admin, payload }) {
  return Task.create({ ...payload, createdBy: admin._id });
}

export async function listTasks({ user, query }) {
  const { page, limit, skip } = getPagination(query);
  const filters = {};

  if (user.role === "employee") {
    filters.assignee = user.employee._id;
  } else if (query.assignee) {
    filters.assignee = query.assignee;
  }
  if (query.status) filters.status = query.status;
  if (query.priority) filters.priority = query.priority;
  if (query.search) filters.$text = { $search: query.search };

  return paginate(
    Task.find(filters).populate("assignee", "firstName lastName employeeCode").sort({ deadline: 1, createdAt: -1 }).skip(skip).limit(limit),
    Task.countDocuments(filters),
    { page, limit },
  );
}

export async function updateTask({ user, id, payload }) {
  const task = await Task.findById(id);
  assertOrThrow(task, 404, "Task not found");

  if (user.role !== "admin") {
    assertOrThrow(task.assignee.toString() === user.employee._id.toString(), 403, "You can only update assigned tasks");
    const allowed = {};
    if (payload.status) allowed.status = payload.status;
    if (payload.progress !== undefined) allowed.progress = payload.progress;
    if (payload.comment) task.comments.push({ author: user._id, message: payload.comment });
    Object.assign(task, allowed);
  } else {
    Object.assign(task, payload);
    if (payload.comment) task.comments.push({ author: user._id, message: payload.comment });
  }

  await task.save();
  return task;
}
