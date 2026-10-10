import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    csrfToken: { type: String, required: true },
    userAgent: String,
    ip: String,
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    revokedAt: Date,
    lastSeenAt: Date,
  },
  { timestamps: true },
);

export const Session = mongoose.models.Session || mongoose.model("Session", sessionSchema);
