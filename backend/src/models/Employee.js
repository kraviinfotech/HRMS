import mongoose from "mongoose";

const emergencyContactSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    relation: { type: String, trim: true },
    phone: { type: String, trim: true },
  },
  { _id: false },
);

const employeeSchema = new mongoose.Schema(
  {
    employeeCode: { type: String, unique: true, required: true, trim: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, sparse: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, unique: true },
    phone: { type: String, trim: true },
    department: { type: String, required: true, trim: true, index: true },
    designation: { type: String, required: true, trim: true },
    shiftStartTime: { type: String, required: true, default: "09:00", trim: true },
    shiftEndTime: { type: String, required: true, default: "18:00", trim: true },
    reportingManager: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    joiningDate: { type: Date, required: true },
    employmentStatus: {
      type: String,
      enum: ["probation", "active", "notice", "exited", "inactive"],
      default: "active",
      index: true,
    },
    address: { type: String, trim: true },
    dateOfBirth: Date,
    emergencyContact: emergencyContactSchema,
    profilePhotoPath: String,
    exitDate: Date,
  },
  { timestamps: true },
);

employeeSchema.index({ firstName: "text", lastName: "text", email: "text", employeeCode: "text" });

employeeSchema.virtual("fullName").get(function fullName() {
  return `${this.firstName} ${this.lastName}`.trim();
});

employeeSchema.set("toJSON", { virtuals: true });

export const Employee = mongoose.models.Employee || mongoose.model("Employee", employeeSchema);
