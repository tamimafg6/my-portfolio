import { Router, Request, Response } from "express";
import multer from "multer";
import { db } from "../db/index.js";
import { contactInfo } from "../db/schema/portfolio.js";
import { eq } from "drizzle-orm";
import { adminOnly } from "../lib/auth.js";
import * as spacesService from "../services/spaces-service.js";

const router = Router();

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp"];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, or WebP images are allowed"));
    }
  },
});

function getProfileKey(mimetype: string): string {
  if (mimetype === "image/png") return "profile.png";
  if (mimetype === "image/webp") return "profile.webp";
  return "profile.jpg";
}

// GET profile photo (public - redirect to temporary presigned URL; bucket stays private)
router.get("/photo", async (req: Request, res: Response) => {
  try {
    const [row] = await db.select().from(contactInfo).limit(1);
    if (!row?.profilePhotoUrl) {
      return res.status(404).json({ error: "Profile photo not found" });
    }
    if (!spacesService.isConfigured()) {
      return res.status(503).json({ error: "File storage is not configured" });
    }
    const key = row.profilePhotoUrl.includes("/") ? "profile.jpg" : row.profilePhotoUrl;
    const signedUrl = await spacesService.getPresignedUrl(key, 900);
    res.redirect(302, signedUrl);
  } catch (error) {
    console.error("Error serving profile photo:", error);
    res.status(500).json({ error: "Failed to serve profile photo" });
  }
});

// POST profile photo upload (admin only)
router.post("/photo/upload", adminOnly, (req: Request, res: Response, next: () => void) => {
  upload.single("file")(req, res, (err: unknown) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ error: "File too large. Maximum size is 5 MB." });
        }
        return res.status(400).json({ error: err.message });
      }
      return res.status(400).json({ error: err instanceof Error ? err.message : "Invalid file" });
    }
    next();
  });
}, async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded. Please select an image (JPEG, PNG, or WebP).",
      });
    }
    if (!spacesService.isConfigured()) {
      return res.status(503).json({
        error: "File storage (DigitalOcean Spaces) is not configured",
      });
    }
    const [existing] = await db.select().from(contactInfo).limit(1);
    if (!existing) {
      return res.status(400).json({
        error: "Save contact information first, then upload a photo.",
      });
    }
    const key = getProfileKey(req.file.mimetype);
    await spacesService.uploadBuffer(key, req.file.buffer, req.file.mimetype);
    await db
      .update(contactInfo)
      .set({ profilePhotoUrl: key, updatedAt: new Date() })
      .where(eq(contactInfo.id, existing.id));
    const [updated] = await db.select().from(contactInfo).where(eq(contactInfo.id, existing.id));
    return res.status(201).json(updated);
  } catch (error) {
    console.error("Error uploading profile photo:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({
      error: "Failed to upload profile photo",
      detail: message,
    });
  }
});

export default router;
