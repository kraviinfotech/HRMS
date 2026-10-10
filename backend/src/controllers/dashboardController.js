import { getAdminDashboard, getEmployeeDashboard } from "../services/dashboardService.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const adminDashboard = asyncHandler(async (_req, res) => {
  sendSuccess(res, await getAdminDashboard(), "Admin dashboard loaded");
});

export const employeeDashboard = asyncHandler(async (req, res) => {
  sendSuccess(res, await getEmployeeDashboard(req.user), "Employee dashboard loaded");
});
