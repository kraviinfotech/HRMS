import { Router } from "express";
import * as auth from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  activateSchema,
  bootstrapSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
} from "../validations/authValidation.js";

export const authRoutes = Router();

authRoutes.get("/csrf", auth.getCsrf);
authRoutes.post("/bootstrap", validate(bootstrapSchema), auth.bootstrap);
authRoutes.post("/login", validate(loginSchema), auth.login);
authRoutes.post("/logout", requireAuth, auth.logout);
authRoutes.get("/me", requireAuth, auth.me);
authRoutes.post("/activate", validate(activateSchema), auth.activate);
authRoutes.post("/forgot-password", validate(forgotPasswordSchema), auth.forgotPassword);
authRoutes.post("/reset-password", validate(resetPasswordSchema), auth.reset);
authRoutes.post("/change-password", requireAuth, validate(changePasswordSchema), auth.change);
