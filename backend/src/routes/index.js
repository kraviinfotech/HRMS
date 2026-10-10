import { Router } from "express";
import { adminRoutes } from "./adminRoutes.js";
import { attendanceRoutes } from "./attendanceRoutes.js";
import { authRoutes } from "./authRoutes.js";
import { dashboardRoutes } from "./dashboardRoutes.js";
import { documentRoutes } from "./documentRoutes.js";
import { employeeRoutes } from "./employeeRoutes.js";
import { leaveRoutes } from "./leaveRoutes.js";
import { notificationRoutes } from "./notificationRoutes.js";
import { payrollRoutes } from "./payrollRoutes.js";
import { taskRoutes } from "./taskRoutes.js";
import { ticketRoutes } from "./ticketRoutes.js";
import { timesheetRoutes } from "./timesheetRoutes.js";
import { env } from "../config/env.js";
import { sendSuccess } from "../utils/apiResponse.js";

export const apiRoutes = Router();

apiRoutes.get("/health", (_req, res) => {
  sendSuccess(res, { status: "ok", uptime: process.uptime(), timestamp: new Date().toISOString() }, "API is healthy");
});

apiRoutes.get("/config/public", (_req, res) => {
  sendSuccess(
    res,
    {
      appName: env.PUBLIC_APP_NAME,
      environment: env.NODE_ENV,
    },
    "Public config loaded",
  );
});

apiRoutes.use("/auth", authRoutes);
apiRoutes.use("/dashboard", dashboardRoutes);
apiRoutes.use("/employees", employeeRoutes);
apiRoutes.use("/attendance", attendanceRoutes);
apiRoutes.use("/timesheets", timesheetRoutes);
apiRoutes.use("/tasks", taskRoutes);
apiRoutes.use("/leaves", leaveRoutes);
apiRoutes.use("/payroll", payrollRoutes);
apiRoutes.use("/tickets", ticketRoutes);
apiRoutes.use("/admin", adminRoutes);
apiRoutes.use("/notifications", notificationRoutes);
apiRoutes.use("/documents", documentRoutes);
