export class HttpError extends Error {
  constructor(statusCode, message, details = undefined) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function assertOrThrow(condition, statusCode, message, details) {
  if (!condition) {
    throw new HttpError(statusCode, message, details);
  }
}
