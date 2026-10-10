import { env } from "../config/env.js";
import { randomToken } from "../utils/token.js";
import { HttpError } from "../utils/httpError.js";

export const csrfCookie = "kravi_csrf";

function cookieOptions() {
  return {
    httpOnly: false,
    sameSite: env.isProduction ? "none" : "lax",
    secure: env.isProduction,
    domain: env.COOKIE_DOMAIN || undefined,
  };
}

export function issuePublicCsrf(req, res) {
  const token = req.session?.csrfToken || req.cookies?.[csrfCookie] || randomToken(24);
  setPublicCsrfCookie(res, token);
  return token;
}

export function setPublicCsrfCookie(res, token) {
  res.cookie(csrfCookie, token, cookieOptions());
}

export function clearPublicCsrfCookie(res) {
  res.clearCookie(csrfCookie, {
    domain: env.COOKIE_DOMAIN || undefined,
  });
}

export function enforceCsrf(req, _res, next) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  const suppliedToken = req.get(env.CSRF_HEADER);
  const expectedToken = req.session?.csrfToken || req.cookies?.[csrfCookie];

  if (!suppliedToken || !expectedToken || suppliedToken !== expectedToken) {
    return next(new HttpError(403, "Invalid or missing CSRF token"));
  }

  return next();
}
