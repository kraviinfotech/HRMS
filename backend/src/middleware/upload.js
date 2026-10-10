import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { env } from "../config/env.js";
import { HttpError } from "../utils/httpError.js";
import { randomToken } from "../utils/token.js";

const allowedTypes = new Set(["application/pdf", "image/png", "image/jpeg"]);

fs.mkdirSync(env.UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, env.UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${randomToken(10)}${extension}`);
  },
});

export const uploadDocument = multer({
  storage,
  limits: { fileSize: env.MAX_UPLOAD_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!allowedTypes.has(file.mimetype)) {
      return cb(new HttpError(400, "Only PDF, PNG, and JPEG files are allowed"));
    }
    return cb(null, true);
  },
});
