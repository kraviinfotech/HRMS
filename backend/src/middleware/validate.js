import { HttpError } from "../utils/httpError.js";
import { sanitizeObject } from "../utils/sanitize.js";

export function validate(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse({
      body: sanitizeObject(req.body ?? {}),
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      return next(new HttpError(400, "Validation failed", result.error.flatten()));
    }

    req.validated = result.data;
    return next();
  };
}
