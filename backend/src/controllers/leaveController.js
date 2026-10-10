import { applyLeave, cancelLeave, listLeaves, reviewLeave } from "../services/leaveService.js";
import { writeAudit } from "../services/auditService.js";
import { sendCreated, sendSuccess } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const index = asyncHandler(async (req, res) => {
  const result = await listLeaves({ user: req.user, query: req.validated.query });
  sendSuccess(res, result.items, "Leave requests loaded", 200, result.meta);
});

export const apply = asyncHandler(async (req, res) => {
  const leave = await applyLeave({ user: req.user, payload: req.validated.body });
  await writeAudit({ req, action: "apply_leave", entity: "Leave", entityId: leave._id });
  sendCreated(res, leave, "Leave request submitted");
});

export const review = asyncHandler(async (req, res) => {
  const leave = await reviewLeave({ admin: req.user, id: req.params.id, ...req.validated.body });
  await writeAudit({ req, action: `leave_${req.validated.body.status}`, entity: "Leave", entityId: leave._id });
  sendSuccess(res, leave, "Leave reviewed");
});

export const cancel = asyncHandler(async (req, res) => {
  const leave = await cancelLeave({ user: req.user, id: req.params.id });
  sendSuccess(res, leave, "Leave request cancelled");
});
