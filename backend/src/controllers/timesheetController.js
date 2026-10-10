import { listTimesheets, reviewTimesheet, submitTimesheet, upsertTimesheet } from "../services/timesheetService.js";
import { writeAudit } from "../services/auditService.js";
import { sendCreated, sendSuccess } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const index = asyncHandler(async (req, res) => {
  const result = await listTimesheets({ user: req.user, query: req.validated.query });
  sendSuccess(res, result.items, "Timesheets loaded", 200, result.meta);
});

export const save = asyncHandler(async (req, res) => {
  const timesheet = await upsertTimesheet({ user: req.user, ...req.validated.body });
  sendCreated(res, timesheet, "Timesheet saved");
});

export const submit = asyncHandler(async (req, res) => {
  const timesheet = await submitTimesheet({ user: req.user, id: req.params.id });
  await writeAudit({ req, action: "submit_timesheet", entity: "Timesheet", entityId: timesheet._id });
  sendSuccess(res, timesheet, "Timesheet submitted");
});

export const review = asyncHandler(async (req, res) => {
  const timesheet = await reviewTimesheet({ admin: req.user, id: req.params.id, ...req.validated.body });
  await writeAudit({ req, action: `timesheet_${req.validated.body.status}`, entity: "Timesheet", entityId: timesheet._id });
  sendSuccess(res, timesheet, "Timesheet reviewed");
});
