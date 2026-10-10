import { Leave } from "../models/Leave.js";
import { Timesheet } from "../models/Timesheet.js";
import { logger } from "../config/logger.js";

export function startReminderJobs() {
  const intervalMs = 60 * 60 * 1000;
  setInterval(async () => {
    try {
      const [pendingLeaves, pendingTimesheets] = await Promise.all([
        Leave.countDocuments({ status: "pending" }),
        Timesheet.countDocuments({ status: "submitted" }),
      ]);
      logger.info({ pendingLeaves, pendingTimesheets }, "HR reminder job summary");
    } catch (error) {
      logger.error({ err: error }, "Reminder job failed");
    }
  }, intervalMs).unref();
}
