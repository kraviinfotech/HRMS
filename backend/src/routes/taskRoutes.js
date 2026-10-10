import { Router } from "express";
import * as tasks from "../controllers/taskController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createTaskSchema, taskListSchema, updateTaskSchema } from "../validations/taskValidation.js";

export const taskRoutes = Router();

taskRoutes.get("/", requireAuth, validate(taskListSchema), tasks.index);
taskRoutes.post("/", requireAuth, requireRole("admin"), validate(createTaskSchema), tasks.create);
taskRoutes.patch("/:id", requireAuth, validate(updateTaskSchema), tasks.update);
