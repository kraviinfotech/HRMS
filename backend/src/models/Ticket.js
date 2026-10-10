import mongoose from "mongoose";

const ticketCommentSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true, trim: true },
    internal: { type: Boolean, default: false },
    at: { type: Date, default: Date.now },
  },
  { _id: true },
);

const ticketSchema = new mongoose.Schema(
  {
    ticketNo: { type: String, unique: true, required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", index: true },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    category: { type: String, required: true, trim: true, index: true },
    priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
    subject: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    status: { type: String, enum: ["open", "assigned", "in_progress", "resolved", "closed"], default: "open", index: true },
    comments: [ticketCommentSchema],
    history: [
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

ticketSchema.index({ subject: "text", description: "text", ticketNo: "text" });

export const Ticket = mongoose.models.Ticket || mongoose.model("Ticket", ticketSchema);
