import { Router, Request, Response } from "express";
import multer from "multer";
import { db } from "../db/index.js";
import { resume } from "../db/schema/portfolio.js";
import { eq } from "drizzle-orm";
import { adminOnly } from "../lib/auth.js";
import * as spacesService from "../services/spaces-service.js";

const router = Router();

const RESUME_KEY_LEGACY = "resume.pdf";
const RESUME_KEY_EN = "resume-en.pdf";
const RESUME_KEY_FR = "resume-fr.pdf";
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

function getKeyForLocale(locale: string): string {
  if (locale === "fr") return RESUME_KEY_FR;
  return RESUME_KEY_EN;
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

// GET resume file (public - redirect to temporary presigned URL; bucket stays private)
router.get("/file", async (req: Request, res: Response) => {
  try {
    const [row] = await db.select().from(resume).limit(1);
    const locale = (req.query.locale as string)?.toLowerCase() === "fr" ? "fr" : "en";
    // Fallback logic:
    // - For FR: prefer French CV, then English CV, then legacy single file
    // - For EN: prefer English CV, then legacy file, then French CV
    const key =
      locale === "fr"
        ? row?.fileUrlAr ?? row?.fileUrlEn ?? row?.fileUrl ?? null
        : row?.fileUrlEn ?? row?.fileUrl ?? row?.fileUrlAr ?? null;
    if (!key) {
      return res.status(404).json({ error: "Resume file not found" });
    }
    if (!spacesService.isConfigured()) {
      return res.status(503).json({ error: "File storage is not configured" });
    }
    const storageKey =
      typeof key === "string" && key.includes("/")
        ? getKeyForLocale(locale)
        : key;
    const signedUrl = await spacesService.getPresignedUrl(storageKey, 900);
    res.redirect(302, signedUrl);
  } catch (error) {
    console.error("Error serving resume file:", error);
    res.status(500).json({ error: "Failed to serve resume" });
  }
});

// POST resume upload (admin only)
router.post("/upload", adminOnly, (req: Request, res: Response, next: () => void) => {
  upload.single("file")(req, res, (err: unknown) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ error: "File too large. Maximum size is 10 MB." });
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
      return res.status(400).json({ error: "No file uploaded. Please select a PDF file." });
    }
    const locale = (req.body?.locale as string)?.toLowerCase() === "fr" ? "fr" : "en";
    const storageKey = getKeyForLocale(locale);
    if (!spacesService.isConfigured()) {
      return res.status(503).json({
        error: "File storage (DigitalOcean Spaces) is not configured",
      });
    }
    await spacesService.uploadBuffer(
      storageKey,
      req.file.buffer,
      "application/pdf"
    );
    const [existing] = await db.select().from(resume).limit(1);
    const updatePayload =
      locale === "fr"
        ? { fileUrlAr: storageKey, updatedAt: new Date() }
        : { fileUrlEn: storageKey, updatedAt: new Date() };
    if (existing) {
      const [updated] = await db
        .update(resume)
        .set(updatePayload)
        .where(eq(resume.id, existing.id))
        .returning();
      return res.status(201).json(updated);
    }
    const insertPayload = {
      fileUrlEn: locale === "en" ? storageKey : null,
      fileUrlAr: locale === "fr" ? storageKey : null,
      labelEn: "Resume",
      labelAr: "CV",
    };
    const [created] = await db.insert(resume).values(insertPayload).returning();
    return res.status(201).json(created);
  } catch (error) {
    console.error("Error uploading resume:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({
      error: "Failed to upload resume",
      detail: message,
    });
  }
});

// GET resume (public - single row)
router.get("/", async (req: Request, res: Response) => {
  try {
    const [row] = await db.select().from(resume).limit(1);
    res.json(row || null);
  } catch (error) {
    console.error("Error fetching resume:", error);
    res.status(500).json({ error: "Failed to fetch resume" });
  }
});

// PUT resume (admin only - upsert single row; labels and optional file URLs)
router.put("/", adminOnly, async (req: Request, res: Response) => {
  try {
    const { fileUrl, fileUrlEn, fileUrlAr, labelEn, labelAr } = req.body;
    const [existing] = await db.select().from(resume).limit(1);
    const payload: Record<string, unknown> = {
      labelEn: labelEn ?? "Resume",
      labelAr: labelAr ?? "CV",
      updatedAt: new Date(),
    };
    if (fileUrl !== undefined) payload.fileUrl = fileUrl ?? null;
    if (fileUrlEn !== undefined) payload.fileUrlEn = fileUrlEn ?? null;
    if (fileUrlAr !== undefined) payload.fileUrlAr = fileUrlAr ?? null;
    if (existing) {
      const [updated] = await db
        .update(resume)
        .set(payload as Record<string, unknown>)
        .where(eq(resume.id, existing.id))
        .returning();
      return res.json(updated);
    }
    const insertPayload = {
      fileUrl: fileUrl ?? null,
      fileUrlEn: fileUrlEn ?? null,
      fileUrlAr: fileUrlAr ?? null,
      labelEn: payload.labelEn as string,
      labelAr: payload.labelAr as string,
    };
    const [created] = await db.insert(resume).values(insertPayload).returning();
    res.json(created);
  } catch (error) {
    console.error("Error updating resume:", error);
    res.status(500).json({ error: "Failed to update resume" });
  }
});

export default router;
