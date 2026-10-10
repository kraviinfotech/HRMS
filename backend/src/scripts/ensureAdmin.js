import { env } from "../config/env.js";
import { connectDatabase, disconnectDatabase } from "../config/database.js";
import { logger } from "../config/logger.js";
import { Session } from "../models/Session.js";
import { User } from "../models/User.js";
import { hashPassword, verifyPassword } from "../services/authService.js";
import { passwordSchema } from "../validations/commonValidation.js";

function assertAdminConfig() {
  if (env.USE_MEMORY_DB) {
    throw new Error("admin:ensure requires a persistent MongoDB database. Disable USE_MEMORY_DB or use /api/auth/bootstrap while the dev server is running.");
  }

  if (!env.INITIAL_ADMIN_EMAIL) {
    throw new Error("INITIAL_ADMIN_EMAIL must be configured.");
  }

  if (!env.INITIAL_ADMIN_PASSWORD) {
    throw new Error("INITIAL_ADMIN_PASSWORD must be configured.");
  }

  const passwordResult = passwordSchema.safeParse(env.INITIAL_ADMIN_PASSWORD);
  if (!passwordResult.success) {
    throw new Error(`INITIAL_ADMIN_PASSWORD is not strong enough: ${passwordResult.error.issues.map((issue) => issue.message).join("; ")}`);
  }
}

async function ensureAdmin() {
  assertAdminConfig();
  await connectDatabase();

  try {
    const email = env.INITIAL_ADMIN_EMAIL.toLowerCase();
    const existing = await User.findOne({ email });

    if (!existing) {
      const created = await User.create({
        name: env.INITIAL_ADMIN_NAME,
        email,
        passwordHash: await hashPassword(env.INITIAL_ADMIN_PASSWORD),
        role: "admin",
        status: "active",
        passwordChangedAt: new Date(),
      });

      logger.info({ email: created.email, role: created.role, status: created.status }, "Admin account created.");
      return;
    }

    const updates = {};
    if (existing.role !== "admin") {
      updates.role = "admin";
    }
    if (existing.status !== "active") {
      updates.status = "active";
    }
    if (env.RESET_ADMIN_PASSWORD) {
      updates.passwordHash = await hashPassword(env.INITIAL_ADMIN_PASSWORD);
      updates.passwordChangedAt = new Date();
    }

    if (Object.keys(updates).length > 0) {
      await User.updateOne({ _id: existing._id }, { $set: updates });
    }

    if (env.RESET_ADMIN_PASSWORD) {
      await Session.updateMany({ user: existing._id, revokedAt: null }, { $set: { revokedAt: new Date() } });
      logger.info({ email, role: "admin", status: "active" }, "Admin account updated and existing sessions revoked.");
      return;
    }

    const passwordMatches = await verifyPassword(existing.passwordHash, env.INITIAL_ADMIN_PASSWORD).catch(() => false);
    if (!passwordMatches) {
      logger.warn({ email }, "Existing admin password does not match INITIAL_ADMIN_PASSWORD. Set RESET_ADMIN_PASSWORD=true to reset it.");
    }

    logger.info({ email, role: "admin", status: "active", passwordMatches }, "Admin account ensured.");
  } finally {
    await disconnectDatabase();
  }
}

ensureAdmin().catch(async (error) => {
  logger.error({ err: error }, "Unable to ensure admin account.");
  await disconnectDatabase().catch(() => undefined);
  process.exit(1);
});
