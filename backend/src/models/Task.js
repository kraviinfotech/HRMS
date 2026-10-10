import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true, trim: true },
    at: { type: Date, default: Date.now },
  },
  { _id: true },
);

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    description: { type: String, trim: true },
    priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium", index: true },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    startDate: Date,
    deadline: { type: Date, index: true },
    status: {
      type: String,
      enum: ["todo", "in_progress", "blocked", "completed", "cancelled"],
      default: "todo",
      index: true,
    },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    comments: [commentSchema],
  },
  { timestamps: true },
);

taskSchema.index({ title: "text", description: "text" });

export const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);
