import crypto from "node:crypto";

export function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("base64url");
}

export function randomOtp() {
  return String(crypto.randomInt(100000, 999999));
}

export function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}
