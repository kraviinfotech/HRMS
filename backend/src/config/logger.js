import pino from "pino";
import { env } from "./env.js";

export const logger = pino({
  level: env.isTest ? "silent" : process.env.LOG_LEVEL || "info",
  transport:
    env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
          },
        }
      : undefined,
});
