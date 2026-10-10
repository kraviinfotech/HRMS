import { Router } from "express";
import * as documents from "../controllers/documentController.js";
import { requireAuth } from "../middleware/auth.js";
import { uploadDocument } from "../middleware/upload.js";

export const documentRoutes = Router();

documentRoutes.get("/", requireAuth, documents.index);
documentRoutes.post("/:employeeId", requireAuth, uploadDocument.single("file"), documents.upload);
documentRoutes.get("/:id/download", requireAuth, documents.download);
