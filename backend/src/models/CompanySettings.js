import mongoose from "mongoose";

const payrollRuleSchema = new mongoose.Schema(
  {
    name: String,
    enabled: { type: Boolean, default: true },
    rate: Number,
    threshold: Number,
    cap: Number,
    effectiveFrom: Date,
    note: String,
  },
  { _id: false },
);

const companySettingsSchema = new mongoose.Schema(
  {
    singletonKey: { type: String, default: "company", unique: true },
    companyName: { type: String, default: "Kravi Infotech" },
    logoPath: String,
    authorizedSignaturePath: String,
    timezone: { type: String, default: "Asia/Kolkata" },
    payrollCutoffDay: { type: Number, min: 1, max: 31, default: 25 },
    leaveTypes: [
      {
        name: String,
        annualAllowance: Number,
        carryForward: { type: Boolean, default: false },
      },
    ],
    payrollRules: {
      pf: payrollRuleSchema,
      esi: payrollRuleSchema,
      professionalTax: payrollRuleSchema,
      tds: payrollRuleSchema,
    },
    retentionPolicy: {
      auditLogMonths: { type: Number, default: 84 },
      documentMonths: { type: Number, default: 84 },
      locationMonths: { type: Number, default: 12 },
    },
  },
  { timestamps: true },
);

export const CompanySettings =
  mongoose.models.CompanySettings || mongoose.model("CompanySettings", companySettingsSchema);
