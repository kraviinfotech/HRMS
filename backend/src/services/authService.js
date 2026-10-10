import argon2 from "argon2";
import { addMinutes, addSeconds } from "../utils/timeMath.js";
import { env } from "../config/env.js";
import { Employee } from "../models/Employee.js";
import { OtpToken } from "../models/OtpToken.js";
import { Session } from "../models/Session.js";
import { User } from "../models/User.js";
import { HttpError, assertOrThrow } from "../utils/httpError.js";
import { randomOtp, randomToken, sha256 } from "../utils/token.js";
import { sendInvitationEmail, sendOtpEmail } from "./emailService.js";

export async function hashPassword(password) {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 3,
    parallelism: 1,
  });
}

export async function verifyPassword(hash, password) {
  return argon2.verify(hash, password);
}

export async function bootstrapAdmin({ email, password, name, secret }) {
  assertOrThrow(env.BOOTSTRAP_SECRET, 500, "BOOTSTRAP_SECRET must be configured before admin bootstrap");
  assertOrThrow(secret === env.BOOTSTRAP_SECRET, 403, "Invalid bootstrap secret");

  const existingAdmin = await User.exists({ role: "admin" });
  assertOrThrow(!existingAdmin, 409, "An admin user already exists");

  const passwordHash = await hashPassword(password);
  return User.create({
    name,
    email,
    passwordHash,
    role: "admin",
    status: "active",
    passwordChangedAt: new Date(),
  });
}

export async function createSession(user, req) {
  const rawToken = randomToken(48);
  const csrfToken = randomToken(32);
  const expiresAt = new Date(Date.now() + env.SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
  const session = await Session.create({
    user: user._id,
    tokenHash: sha256(rawToken),
    csrfToken,
    userAgent: req.get("user-agent"),
    ip: req.ip,
    expiresAt,
    lastSeenAt: new Date(),
  });

  return { session, rawToken, csrfToken };
}

export async function loginUser({ email, password, req }) {
  const user = await User.findOne({ email: email.toLowerCase() }).populate("employee");
  assertOrThrow(user, 401, "Invalid email or password");
  assertOrThrow(user.status === "active", 403, "Account is not active");

  if (user.lockUntil && user.lockUntil > new Date()) {
    throw new HttpError(423, "Account is temporarily locked after repeated failed attempts");
  }

  const matches = await verifyPassword(user.passwordHash, password);
  if (!matches) {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
    }
    await user.save();
    throw new HttpError(401, "Invalid email or password");
  }

  user.failedLoginAttempts = 0;
  user.lockUntil = undefined;
  user.lastLoginAt = new Date();
  await user.save();

  const sessionBundle = await createSession(user, req);
  return { user, ...sessionBundle };
}

export async function logoutSession(session) {
  if (!session) {
    return;
  }
  session.revokedAt = new Date();
  await session.save();
}

export async function createOtp({ user, email, purpose, sendInvitation = false }) {
  const normalizedEmail = email.toLowerCase();
  const now = new Date();
  const existing = await OtpToken.findOne({
    email: normalizedEmail,
    purpose,
    usedAt: null,
    expiresAt: { $gt: now },
  }).sort({ createdAt: -1 });

  if (existing?.resendAvailableAt && existing.resendAvailableAt > now) {
    throw new HttpError(429, "Please wait before requesting another OTP");
  }

  const code = randomOtp();
  const otp = await OtpToken.create({
    user: user?._id,
    email: normalizedEmail,
    purpose,
    codeHash: sha256(code),
    expiresAt: addMinutes(now, env.OTP_EXPIRY_MINUTES),
    maxAttempts: env.OTP_MAX_ATTEMPTS,
    resendAvailableAt: addSeconds(now, env.OTP_RESEND_SECONDS),
  });

  const delivery = sendInvitation
    ? await sendInvitationEmail({ to: normalizedEmail, name: user?.name || normalizedEmail, code })
    : await sendOtpEmail({ to: normalizedEmail, code, purpose });

  return { otp, delivery };
}

export async function verifyOtp({ email, purpose, code }) {
  const token = await OtpToken.findOne({
    email: email.toLowerCase(),
    purpose,
    usedAt: null,
  }).sort({ createdAt: -1 });

  assertOrThrow(token, 400, "Invalid or expired OTP");
  assertOrThrow(token.expiresAt > new Date(), 400, "OTP has expired");
  assertOrThrow(token.attempts < token.maxAttempts, 429, "OTP attempt limit exceeded");

  token.attempts += 1;
  if (token.codeHash !== sha256(code)) {
    await token.save();
    throw new HttpError(400, "Invalid OTP");
  }

  token.usedAt = new Date();
  await token.save();
  return token;
}

export async function activateAccount({ email, otp, password }) {
  const user = await User.findOne({ email: email.toLowerCase() }).populate("employee");
  assertOrThrow(user, 404, "Invitation not found");
  assertOrThrow(user.status === "invited", 409, "Account is not awaiting activation");

  await verifyOtp({ email, purpose: "activation", code: otp });
  user.passwordHash = await hashPassword(password);
  user.status = "active";
  user.passwordChangedAt = new Date();
  await user.save();
  return user;
}

export async function requestPasswordReset(email) {
  const user = await User.findOne({ email: email.toLowerCase(), status: "active" });
  if (!user) {
    return { sent: false };
  }
  await createOtp({ user, email, purpose: "password_reset" });
  return { sent: true };
}

export async function resetPassword({ email, otp, password }) {
  const user = await User.findOne({ email: email.toLowerCase(), status: "active" });
  assertOrThrow(user, 404, "Account not found");
  await verifyOtp({ email, purpose: "password_reset", code: otp });
  user.passwordHash = await hashPassword(password);
  user.passwordChangedAt = new Date();
  await user.save();
  await Session.updateMany({ user: user._id, revokedAt: null }, { $set: { revokedAt: new Date() } });
  return user;
}

export async function changePassword({ user, currentPassword, newPassword }) {
  const matches = await verifyPassword(user.passwordHash, currentPassword);
  assertOrThrow(matches, 400, "Current password is incorrect");
  user.passwordHash = await hashPassword(newPassword);
  user.passwordChangedAt = new Date();
  await user.save();
  await Session.updateMany({ user: user._id, revokedAt: null }, { $set: { revokedAt: new Date() } });
}

export async function attachEmployeeToUser(userId, employeeId) {
  await Promise.all([
    User.findByIdAndUpdate(userId, { employee: employeeId }),
    Employee.findByIdAndUpdate(employeeId, { user: userId }),
  ]);
}
