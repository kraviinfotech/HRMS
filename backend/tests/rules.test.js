import { describe, expect, it } from "vitest";
import { calculateLeaveDays } from "../src/services/leaveService.js";
import { timesheetRules } from "../src/services/timesheetService.js";

describe("leave and timesheet rules", () => {
  it("calculates inclusive leave days and half-day requests", () => {
    expect(calculateLeaveDays("2026-01-01", "2026-01-03", false)).toBe(3);
    expect(calculateLeaveDays("2026-01-01", "2026-01-03", true)).toBe(0.5);
  });

  it("detects overlapping timesheet entries", () => {
    expect(
      timesheetRules.hasOverlap([
        { startAt: "2026-01-01T09:00:00.000Z", endAt: "2026-01-01T10:00:00.000Z" },
        { startAt: "2026-01-01T09:30:00.000Z", endAt: "2026-01-01T11:00:00.000Z" },
      ]),
    ).toBe(true);

    expect(
      timesheetRules.hasOverlap([
        { startAt: "2026-01-01T09:00:00.000Z", endAt: "2026-01-01T10:00:00.000Z" },
        { startAt: "2026-01-01T10:00:00.000Z", endAt: "2026-01-01T11:00:00.000Z" },
      ]),
    ).toBe(false);
  });
});
