import express from "express";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import mongoSanitize from "express-mongo-sanitize";
import { logger } from "./config/logger.js";
import { applySecurityMiddleware } from "./middleware/security.js";
import { attachSession } from "./middleware/auth.js";
import { enforceCsrf } from "./middleware/csrf.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { apiRoutes } from "./routes/index.js";

function requestLogLevel(_req, res, error) {
  if (error || res.statusCode >= 500) return "error";
  if (res.statusCode >= 400) return "warn";
  return "silent";
}

export function createApp() {
  const app = express();

  app.use(
    pinoHttp({
      logger,
      customLogLevel: requestLogLevel,
      serializers: {
        req(req) {
          return {
            id: req.id,
            method: req.method,
            url: req.url,
            remoteAddress: req.remoteAddress,
          };
        },
        res(res) {
          return {
            statusCode: res.statusCode,
          };
        },
      },
    }),
  );
  applySecurityMiddleware(app);
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(mongoSanitize());
  app.use(cookieParser());
  app.use(attachSession);
  app.use(enforceCsrf);
  app.use("/api", apiRoutes);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
