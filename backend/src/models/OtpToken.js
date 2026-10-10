import mongoose from "mongoose";

const otpTokenSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    purpose: {
      type: String,
      enum: ["activation", "email_verification", "password_reset"],
      required: true,
      index: true,
    },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 5 },
    resendAvailableAt: Date,
    usedAt: Date,
    metadata: { type: Map, of: String },
  },
  { timestamps: true },
);

otpTokenSchema.index({ email: 1, purpose: 1, usedAt: 1 });

export const OtpToken = mongoose.models.OtpToken || mongoose.model("OtpToken", otpTokenSchema);
