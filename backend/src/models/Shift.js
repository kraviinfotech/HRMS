import mongoose from "mongoose";

const shiftSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    startTime: { type: String, required: true, default: "09:30" },
    endTime: { type: String, required: true, default: "18:30" },
    graceMinutes: { type: Number, default: 10 },
    weeklyOffs: [{ type: Number, min: 0, max: 6 }],
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Shift = mongoose.models.Shift || mongoose.model("Shift", shiftSchema);
