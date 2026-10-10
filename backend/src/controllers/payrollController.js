import { createPayrollDraft, finalizePayroll, generatePayslip, listPayroll } from "../services/payrollService.js";
import { writeAudit } from "../services/auditService.js";
import { sendCreated, sendSuccess } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const index = asyncHandler(async (req, res) => {
  const result = await listPayroll({ user: req.user, query: req.validated.query });
  sendSuccess(res, result.items, "Payroll records loaded", 200, result.meta);
});

export const draft = asyncHandler(async (req, res) => {
  const payroll = await createPayrollDraft({ payload: req.validated.body });
  await writeAudit({ req, action: "create_payroll_draft", entity: "Payroll", entityId: payroll._id });
  sendCreated(res, payroll, "Payroll draft calculated");
});

export const finalize = asyncHandler(async (req, res) => {
  const payroll = await finalizePayroll({ admin: req.user, id: req.params.id });
  await writeAudit({ req, action: "finalize_payroll", entity: "Payroll", entityId: payroll._id });
  sendSuccess(res, payroll, "Payroll finalized");
});

export const payslip = asyncHandler(async (req, res) => {
  const { filePath, filename } = await generatePayslip({ user: req.user, id: req.params.id });
  res.download(filePath, filename);
});
