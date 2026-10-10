import { describe, expect, it } from "vitest";
import { calculateIndianPayroll } from "../src/services/payrollService.js";

const rules = {
  pf: { enabled: true, rate: 0.12, cap: 1800 },
  esi: { enabled: true, rate: 0.0075, threshold: 21000 },
  professionalTax: { enabled: true, rate: 200, threshold: 7500 },
  tds: { enabled: true, rate: 0.1, threshold: 50000 },
};

describe("calculateIndianPayroll", () => {
  it("applies capped PF, PT, and TDS while excluding ESI above the threshold", () => {
    const result = calculateIndianPayroll({
      salaryStructure: {
        basic: 30000,
        hra: 15000,
        specialAllowance: 10000,
        reimbursements: 2000,
      },
      rules,
      unpaidLeaveDays: 0,
    });

    expect(result.grossPay).toBe(57000);
    expect(result.deductions).toEqual([
      { label: "PF", amount: 1800 },
      { label: "Professional Tax", amount: 200 },
      { label: "TDS", amount: 5700 },
    ]);
    expect(result.totalDeductions).toBe(7700);
    expect(result.netPay).toBe(49300);
  });

  it("applies ESI below the configured threshold and rounds to two decimals", () => {
    const result = calculateIndianPayroll({
      salaryStructure: {
        basic: 10000,
        hra: 5000,
        specialAllowance: 1000,
        reimbursements: 0,
      },
      rules,
      unpaidLeaveDays: 0.5,
    });

    expect(result.grossPay).toBe(15733.33);
    expect(result.deductions).toContainEqual({ label: "PF", amount: 1200 });
    expect(result.deductions).toContainEqual({ label: "ESI", amount: 118 });
    expect(result.deductions).toContainEqual({ label: "Professional Tax", amount: 200 });
    expect(result.netPay).toBe(14215.33);
  });
});
