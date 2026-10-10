import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

function hasSmtpConfig() {
  return Boolean(env.BREVO_SMTP_USER && env.BREVO_SMTP_KEY);
}

function createTransporter() {
  return nodemailer.createTransport({
    host: env.BREVO_SMTP_HOST,
    port: env.BREVO_SMTP_PORT,
    secure: env.BREVO_SMTP_PORT === 465,
    auth: {
      user: env.BREVO_SMTP_USER,
      pass: env.BREVO_SMTP_KEY,
    },
  });
}

export async function sendMail({ to, subject, text, html }) {
  if (!hasSmtpConfig()) {
    logger.warn({ to, subject }, "SMTP is not configured; email delivery skipped");
    return { skipped: true, reason: "SMTP is not configured" };
  }

  const transporter = createTransporter();
  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject,
    text,
    html,
  });
  return { skipped: false };
}

export async function sendOtpEmail({ to, code, purpose }) {
  const readablePurpose = purpose.replaceAll("_", " ");
  return sendMail({
    to,
    subject: `Kravi HRMS ${readablePurpose} OTP`,
    text: `Your Kravi HRMS OTP is ${code}. It expires in ${env.OTP_EXPIRY_MINUTES} minutes.`,
    html: `<p>Your Kravi HRMS OTP is <strong>${code}</strong>.</p><p>It expires in ${env.OTP_EXPIRY_MINUTES} minutes.</p>`,
  });
}

export async function sendInvitationEmail({ to, name, code }) {
  return sendMail({
    to,
    subject: "Activate your Kravi HRMS account",
    text: `Hello ${name}, your Kravi HRMS activation OTP is ${code}. It expires in ${env.OTP_EXPIRY_MINUTES} minutes.`,
    html: `<p>Hello ${name},</p><p>Your Kravi HRMS activation OTP is <strong>${code}</strong>.</p><p>It expires in ${env.OTP_EXPIRY_MINUTES} minutes.</p>`,
  });
}
