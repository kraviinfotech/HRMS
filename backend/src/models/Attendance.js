import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    latitude: Number,
    longitude: Number,
    accuracy: Number,
    label: String,
  },
  { _id: false },
);

const punchSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["check_in", "check_out", "break_start", "break_end"], required: true },
    at: { type: Date, default: Date.now },
    location: locationSchema,
  },
  { _id: false },
);

const attendanceSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ["present", "absent", "late", "half_day", "on_leave", "missing_checkout"],
      default: "present",
      index: true,
    },
    shift: { type: mongoose.Schema.Types.ObjectId, ref: "Shift" },
    checkInAt: Date,
    checkOutAt: Date,
    durationMinutes: { type: Number, default: 0 },
    lateMinutes: { type: Number, default: 0 },
    overtimeMinutes: { type: Number, default: 0 },
    shiftStartTime: String,
    shiftEndTime: String,
    punches: [punchSchema],
    correctionRequest: {
      status: { type: String, enum: ["none", "pending", "approved", "rejected"], default: "none" },
      requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      requestedAt: Date,
      reason: String,
      adminNote: String,
    },
    auditTrail: [
      {
        action: String,
        actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        at: { type: Date, default: Date.now },
        note: String,
      },
    ],
  },
  { timestamps: true },
);

attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

export const Attendance = mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema);
