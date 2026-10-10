import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { createApp } from "./app.js";
import { startReminderJobs } from "./jobs/reminders.js";

const app = createApp();
let server;

async function start() {
  await connectDatabase();
  server = app.listen(env.PORT, () => {
    logger.info(`Backend running on port ${env.PORT}`);
  });
  startReminderJobs();
}

async function shutdown(signal) {
  logger.info({ signal }, "Shutting down API");
  if (server) {
    server.close();
  }
  await disconnectDatabase();
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

start().catch((error) => {
  logger.error({ err: error }, "Failed to start API");
  process.exit(1);
});
