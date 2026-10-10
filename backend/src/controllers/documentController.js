import fs from "node:fs";
import { Document } from "../models/Document.js";
import { Employee } from "../models/Employee.js";
import { getPagination, paginate } from "../utils/pagination.js";
import { sendCreated, sendSuccess } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { assertOrThrow, HttpError } from "../utils/httpError.js";
import { writeAudit } from "../services/auditService.js";

function canAccessEmployee(req, employeeId) {
  return req.user.role === "admin" || req.user.employee?._id?.toString() === employeeId.toString();
}

export const index = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filters = {};
  if (req.user.role === "employee") {
    filters.employee = req.user.employee._id;
    filters.visibility = "employee";
  } else if (req.query.employee) {
    filters.employee = req.query.employee;
  }

  const result = await paginate(
    Document.find(filters).populate("employee", "firstName lastName employeeCode").sort({ createdAt: -1 }).skip(skip).limit(limit),
    Document.countDocuments(filters),
    { page, limit },
  );
  sendSuccess(res, result.items, "Documents loaded", 200, result.meta);
});

export const upload = asyncHandler(async (req, res) => {
  assertOrThrow(req.file, 400, "Document file is required");
  const employee = await Employee.findById(req.params.employeeId);
  assertOrThrow(employee, 404, "Employee not found");
  assertOrThrow(canAccessEmployee(req, employee._id), 403, "You can only upload your own documents");

  const document = await Document.create({
    employee: employee._id,
    uploadedBy: req.user._id,
    type: req.body.type || "General",
    originalName: req.file.originalname,
    storedName: req.file.filename,
    mimeType: req.file.mimetype,
    size: req.file.size,
    path: req.file.path,
    visibility: req.body.visibility === "admin" && req.user.role === "admin" ? "admin" : "employee",
  });
  await writeAudit({ req, action: "upload_document", entity: "Document", entityId: document._id });
  sendCreated(res, document, "Document uploaded");
});

export const download = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id);
  assertOrThrow(document, 404, "Document not found");
  if (req.user.role !== "admin") {
    assertOrThrow(document.visibility === "employee" && document.employee.toString() === req.user.employee._id.toString(), 403, "Document access denied");
  }
  if (!fs.existsSync(document.path)) {
    throw new HttpError(404, "Stored file is missing");
  }
  res.download(document.path, document.originalName);
});
