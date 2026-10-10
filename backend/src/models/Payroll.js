import mongoose from "mongoose";

const moneyLineSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    amount: { type: Number, required: true, default: 0 },
  },
  { _id: false },
);

const payrollSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    month: { type: String, required: true, match: /^\d{4}-\d{2}$/, index: true },
    status: { type: String, enum: ["draft", "approved", "finalized", "paid"], default: "draft", index: true },
    salaryStructure: {
      basic: { type: Number, required: true, default: 0 },
      hra: { type: Number, default: 0 },
      specialAllowance: { type: Number, default: 0 },
      reimbursements: { type: Number, default: 0 },
    },
    earnings: [moneyLineSchema],
    deductions: [moneyLineSchema],
    unpaidLeaveDays: { type: Number, default: 0 },
    grossPay: { type: Number, default: 0 },
    totalDeductions: { type: Number, default: 0 },
    netPay: { type: Number, default: 0 },
    currency: { type: String, default: "INR" },
    calculationVersion: { type: String, default: "configurable-india-v1" },
    effectiveDate: { type: Date, required: true },
    assumptions: { type: String, default: "Statutory rates are configurable estimates and require professional verification." },
    finalizedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    finalizedAt: Date,
    paidAt: Date,
    payslipPath: String,
  },
  { timestamps: true },
);

payrollSchema.index({ employee: 1, month: 1 }, { unique: true });

export const Payroll = mongoose.models.Payroll || mongoose.model("Payroll", payrollSchema);
