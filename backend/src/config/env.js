import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const booleanFromString = z
  .union([z.boolean(), z.string()])
  .optional()
  .transform((value) => value === true || value === "true");

const optionalEmail = z.preprocess((value) => (value === "" ? undefined : value), z.string().email().optional());

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  PUBLIC_APP_NAME: z.string().default("Kravi Infotech HRMS"),
  MONGODB_URI: z.string().min(1).default("mongodb://127.0.0.1:27017/kravi_hrms"),
  USE_MEMORY_DB: booleanFromString.default(false),
  CLIENT_ORIGIN: z.string().default("http://localhost:5173"),
  COOKIE_NAME: z.string().default("kravi_sid"),
  COOKIE_DOMAIN: z.string().optional().default(""),
  SESSION_TTL_DAYS: z.coerce.number().positive().default(7),
  CSRF_HEADER: z.string().default("x-csrf-token"),
  TRUST_PROXY: booleanFromString.default(false),
  BOOTSTRAP_SECRET: z.string().optional().default(""),
  INITIAL_ADMIN_EMAIL: optionalEmail,
  INITIAL_ADMIN_PASSWORD: z.string().optional().default(""),
  INITIAL_ADMIN_NAME: z.string().default("Kravi HR Admin"),
  RESET_ADMIN_PASSWORD: booleanFromString.default(false),
  BREVO_SMTP_HOST: z.string().default("smtp-relay.brevo.com"),
  BREVO_SMTP_PORT: z.coerce.number().int().positive().default(587),
  BREVO_SMTP_USER: z.string().optional().default(""),
  BREVO_SMTP_KEY: z.string().optional().default(""),
  EMAIL_FROM: z.string().default("Kravi HRMS <hrms@example.com>"),
  UPLOAD_DIR: z.string().default("storage/uploads"),
  MAX_UPLOAD_MB: z.coerce.number().positive().default(5),
  PAYSLIP_DIR: z.string().default("storage/payslips"),
  RATE_LIMIT_WINDOW_MINUTES: z.coerce.number().positive().default(15),
  RATE_LIMIT_MAX: z.coerce.number().positive().default(300),
  OTP_EXPIRY_MINUTES: z.coerce.number().positive().default(10),
  OTP_RESEND_SECONDS: z.coerce.number().positive().default(60),
  OTP_MAX_ATTEMPTS: z.coerce.number().positive().default(5),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  ...parsed.data,
  isProduction: parsed.data.NODE_ENV === "production",
  isTest: parsed.data.NODE_ENV === "test",
};
