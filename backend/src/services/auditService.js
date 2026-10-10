import { AuditLog } from "../models/AuditLog.js";

export async function writeAudit({ req, action, entity, entityId, metadata }) {
  await AuditLog.create({
    actor: req.user?._id,
    action,
    entity,
    entityId,
    ip: req.ip,
    userAgent: req.get("user-agent"),
    metadata,
  });
}
