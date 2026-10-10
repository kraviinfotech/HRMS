import { CompanySettings } from "../models/CompanySettings.js";

const defaultPayrollRules = {
  pf: {
    name: "Provident Fund",
    enabled: true,
    rate: 0.12,
    cap: 1800,
    effectiveFrom: new Date("2024-04-01"),
    note: "Default estimate. Verify current statutory applicability before final payroll.",
  },
  esi: {
    name: "Employee State Insurance",
    enabled: true,
    rate: 0.0075,
    threshold: 21000,
    effectiveFrom: new Date("2024-04-01"),
    note: "Default estimate based on common eligibility threshold. Verify professionally.",
  },
  professionalTax: {
    name: "Maharashtra Professional Tax",
    enabled: true,
    rate: 200,
    threshold: 7500,
    effectiveFrom: new Date("2024-04-01"),
    note: "Monthly estimate. Configure February and slab-specific rules if needed.",
  },
  tds: {
    name: "Tax Deducted at Source",
    enabled: false,
    rate: 0,
    threshold: 0,
    effectiveFrom: new Date("2024-04-01"),
    note: "TDS depends on declarations and regime selection; keep disabled until configured.",
  },
};

export async function getCompanySettings() {
  const settings = await CompanySettings.findOne({ singletonKey: "company" });
  if (settings) return settings;
  return CompanySettings.create({
    singletonKey: "company",
    leaveTypes: [
      { name: "Casual Leave", annualAllowance: 12, carryForward: false },
      { name: "Sick Leave", annualAllowance: 6, carryForward: false },
      { name: "Earned Leave", annualAllowance: 12, carryForward: true },
    ],
    payrollRules: defaultPayrollRules,
  });
}

export async function updateCompanySettings(payload) {
  return CompanySettings.findOneAndUpdate(
    { singletonKey: "company" },
    { $set: payload },
    { new: true, upsert: true, runValidators: true },
  );
}

export { defaultPayrollRules };
