import mongoose from "mongoose";

const holidaySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    date: { type: Date, required: true, unique: true },
    type: { type: String, enum: ["public", "company", "optional"], default: "company" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Holiday = mongoose.models.Holiday || mongoose.model("Holiday", holidaySchema);
