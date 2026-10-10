import { User } from "../models/User.js";
import { Session } from "../models/Session.js";
import { env } from "../config/env.js";
import { sha256 } from "../utils/token.js";
import { HttpError } from "../utils/httpError.js";

export async function attachSession(req, _res, next) {
  try {
    const rawSession = req.cookies?.[env.COOKIE_NAME];
    if (!rawSession) {
      return next();
    }

    const tokenHash = sha256(rawSession);
    const session = await Session.findOne({
      tokenHash,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      return next();
    }

    const user = await User.findById(session.user).populate("employee");
    if (!user || user.status !== "active") {
      return next();
    }

    session.lastSeenAt = new Date();
    await session.save();
    req.session = session;
    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
}

export function requireAuth(req, _res, next) {
  if (!req.user) {
    return next(new HttpError(401, "Authentication required"));
  }
  return next();
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new HttpError(403, "You do not have permission to perform this action"));
    }
    return next();
  };
}

export function requireSelfOrAdmin(getOwnerId) {
  return (req, _res, next) => {
    if (req.user?.role === "admin") {
      return next();
    }

    const ownerId = getOwnerId(req);
    const currentEmployeeId = req.user?.employee?._id?.toString();
    if (ownerId && currentEmployeeId && ownerId.toString() === currentEmployeeId) {
      return next();
    }

    return next(new HttpError(403, "You can only access your own employee records"));
  };
}
