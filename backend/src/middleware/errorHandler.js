import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

export function notFoundHandler(req, _res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

export function errorHandler(error, req, res, _next) {
  const statusCode = error.statusCode || 500;
  const isOperational = statusCode < 500;

  if (!isOperational) {
    req.log?.error({ err: error }, "Unhandled request error");
    logger.error({ err: error }, "Unhandled request error");
  }

  res.status(statusCode).json({
    success: false,
    message: isOperational ? error.message : "Internal server error",
    ...(error.details ? { details: error.details } : {}),
    ...(!env.isProduction && !isOperational ? { stack: error.stack } : {}),
  });
}
