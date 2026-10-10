import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true, trim: true },
    originalName: { type: String, required: true },
    storedName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    path: { type: String, required: true },
    visibility: { type: String, enum: ["admin", "employee"], default: "employee" },
  },
  { timestamps: true },
);

documentSchema.index({ employee: 1, type: 1 });

export const Document = mongoose.models.Document || mongoose.model("Document", documentSchema);
