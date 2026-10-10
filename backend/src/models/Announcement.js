import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    audience: { type: String, enum: ["all", "admins", "employees"], default: "all", index: true },
    publishAt: { type: Date, default: Date.now, index: true },
    expiresAt: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

export const Announcement = mongoose.models.Announcement || mongoose.model("Announcement", announcementSchema);
