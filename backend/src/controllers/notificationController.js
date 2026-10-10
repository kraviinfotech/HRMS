import { Notification } from "../models/Notification.js";
import { getPagination, paginate } from "../utils/pagination.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { assertOrThrow } from "../utils/httpError.js";

export const index = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const result = await paginate(
    Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments({ user: req.user._id }),
    { page, limit },
  );
  sendSuccess(res, result.items, "Notifications loaded", 200, result.meta);
});

export const markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { $set: { readAt: new Date() } },
    { new: true },
  );
  assertOrThrow(notification, 404, "Notification not found");
  sendSuccess(res, notification, "Notification marked as read");
});
