import { createTask, listTasks, updateTask } from "../services/taskService.js";
import { writeAudit } from "../services/auditService.js";
import { sendCreated, sendSuccess } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const index = asyncHandler(async (req, res) => {
  const result = await listTasks({ user: req.user, query: req.validated.query });
  sendSuccess(res, result.items, "Tasks loaded", 200, result.meta);
});

export const create = asyncHandler(async (req, res) => {
  const task = await createTask({ admin: req.user, payload: req.validated.body });
  await writeAudit({ req, action: "create_task", entity: "Task", entityId: task._id });
  sendCreated(res, task, "Task created");
});

export const update = asyncHandler(async (req, res) => {
  const task = await updateTask({ user: req.user, id: req.params.id, payload: req.validated.body });
  await writeAudit({ req, action: "update_task", entity: "Task", entityId: task._id });
  sendSuccess(res, task, "Task updated");
});
