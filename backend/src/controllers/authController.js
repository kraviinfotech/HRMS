import { env } from "../config/env.js";
import { clearPublicCsrfCookie, issuePublicCsrf, setPublicCsrfCookie } from "../middleware/csrf.js";
import {
  activateAccount,
  bootstrapAdmin,
  changePassword,
  loginUser,
  logoutSession,
  requestPasswordReset,
  resetPassword,
} from "../services/authService.js";
import { writeAudit } from "../services/auditService.js";
import { sendSuccess, sendCreated } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: env.isProduction ? "none" : "lax",
    secure: env.isProduction,
    domain: env.COOKIE_DOMAIN || undefined,
    maxAge: env.SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
  };
}

function serializeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    employee: user.employee || null,
    lastLoginAt: user.lastLoginAt,
  };
}

export const getCsrf = asyncHandler(async (req, res) => {
  const csrfToken = issuePublicCsrf(req, res);
  sendSuccess(res, { csrfToken }, "CSRF token issued");
});

export const bootstrap = asyncHandler(async (req, res) => {
  const admin = await bootstrapAdmin(req.validated.body);
  await writeAudit({ req, action: "bootstrap_admin", entity: "User", entityId: admin._id, metadata: { email: admin.email } });
  sendCreated(res, { user: serializeUser(admin) }, "Initial admin created");
});

export const login = asyncHandler(async (req, res) => {
  const { user, rawToken, csrfToken } = await loginUser({ ...req.validated.body, req });
  res.cookie(env.COOKIE_NAME, rawToken, sessionCookieOptions());
  setPublicCsrfCookie(res, csrfToken);
  await writeAudit({ req, action: "login", entity: "User", entityId: user._id });
  sendSuccess(res, { user: serializeUser(user), csrfToken }, "Logged in");
});

export const logout = asyncHandler(async (req, res) => {
  await logoutSession(req.session);
  res.clearCookie(env.COOKIE_NAME, { domain: env.COOKIE_DOMAIN || undefined });
  clearPublicCsrfCookie(res);
  if (req.user) {
    await writeAudit({ req, action: "logout", entity: "User", entityId: req.user._id });
  }
  sendSuccess(res, null, "Logged out");
});

export const me = asyncHandler(async (req, res) => {
  sendSuccess(res, { user: serializeUser(req.user) }, "Session restored");
});

export const activate = asyncHandler(async (req, res) => {
  const user = await activateAccount(req.validated.body);
  await writeAudit({ req, action: "activate_account", entity: "User", entityId: user._id });
  sendSuccess(res, { user: serializeUser(user) }, "Account activated");
});

export const forgotPassword = asyncHandler(async (req, res) => {
  await requestPasswordReset(req.validated.body.email);
  sendSuccess(res, null, "If the account exists, a reset OTP has been sent");
});

export const reset = asyncHandler(async (req, res) => {
  const user = await resetPassword(req.validated.body);
  await writeAudit({ req, action: "reset_password", entity: "User", entityId: user._id });
  sendSuccess(res, null, "Password reset successfully");
});

export const change = asyncHandler(async (req, res) => {
  await changePassword({ user: req.user, ...req.validated.body });
  await writeAudit({ req, action: "change_password", entity: "User", entityId: req.user._id });
  res.clearCookie(env.COOKIE_NAME, { domain: env.COOKIE_DOMAIN || undefined });
  clearPublicCsrfCookie(res);
  sendSuccess(res, null, "Password changed. Please log in again.");
});
