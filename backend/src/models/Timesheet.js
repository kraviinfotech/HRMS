import mongoose from "mongoose";

const entrySchema = new mongoose.Schema(
  {
    task: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
    description: { type: String, required: true, trim: true },
    startAt: Date,
    endAt: Date,
    minutes: { type: Number, required: true, min: 1 },
  },
  { _id: true },
);

const timesheetSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ["draft", "submitted", "approved", "rejected", "correction_requested"],
      default: "draft",
      index: true,
    },
    entries: [entrySchema],
    totalMinutes: { type: Number, default: 0 },
    submittedAt: Date,
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: Date,
    reviewNote: String,
  },
  { timestamps: true },
);

timesheetSchema.index({ employee: 1, date: 1 }, { unique: true });

export const Timesheet = mongoose.models.Timesheet || mongoose.model("Timesheet", timesheetSchema);
