import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "employee"], required: true, index: true },
    status: {
      type: String,
      enum: ["invited", "active", "inactive", "locked"],
      default: "invited",
      index: true,
    },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", index: true },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: Date,
    lastLoginAt: Date,
    passwordChangedAt: Date,
  },
  { timestamps: true },
);

userSchema.index({ role: 1, status: 1 });

export const User = mongoose.models.User || mongoose.model("User", userSchema);
