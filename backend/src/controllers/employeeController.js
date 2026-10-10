import {
  createEmployee,
  getEmployeeById,
  listEmployees,
  setEmployeeStatus,
  updateEmployee,
} from "../services/employeeService.js";
import { writeAudit } from "../services/auditService.js";
import { sendCreated, sendSuccess } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";

function cleanEmployeePayload(payload) {
  return {
    ...payload,
    reportingManager: payload.reportingManager || undefined,
  };
}

export const index = asyncHandler(async (req, res) => {
  const result = await listEmployees(req.validated.query);
  sendSuccess(res, result.items, "Employees loaded", 200, result.meta);
});

export const create = asyncHandler(async (req, res) => {
  const employee = await createEmployee(cleanEmployeePayload(req.validated.body));
  await writeAudit({ req, action: "create_employee", entity: "Employee", entityId: employee._id });
  sendCreated(res, employee, "Employee created and login password set");
});

export const show = asyncHandler(async (req, res) => {
  const employee = await getEmployeeById(req.params.id);
  if (req.user.role !== "admin" && employee._id.toString() !== req.user.employee?._id?.toString()) {
    throw new HttpError(403, "You can only view your own profile");
  }
  sendSuccess(res, employee, "Employee loaded");
});

export const update = asyncHandler(async (req, res) => {
  const employee = await updateEmployee(req.params.id, cleanEmployeePayload(req.validated.body));
  await writeAudit({ req, action: "update_employee", entity: "Employee", entityId: employee._id });
  sendSuccess(res, employee, "Employee updated");
});

export const status = asyncHandler(async (req, res) => {
  const employee = await setEmployeeStatus(req.params.id, req.validated.body.status);
  await writeAudit({ req, action: `${req.validated.body.status}_employee`, entity: "Employee", entityId: employee._id });
  sendSuccess(res, employee, "Employee status updated");
});

export const exportCsv = asyncHandler(async (req, res) => {
  const result = await listEmployees({ ...req.query, limit: 100 });
  const rows = [
    "Employee ID,Name,Email,Department,Designation,Status",
    ...result.items.map((employee) =>
      [
        employee.employeeCode,
        `"${employee.firstName} ${employee.lastName}"`,
        employee.email,
        employee.department,
        employee.designation,
        employee.employmentStatus,
      ].join(","),
    ),
  ];
  res.header("Content-Type", "text/csv");
  res.attachment("employees.csv");
  res.send(rows.join("\n"));
});
