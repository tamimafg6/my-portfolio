import { Router, Request, Response } from "express";
import { db } from "../db/index.js";
import { workExperience } from "../db/schema/portfolio.js";
import { eq } from "drizzle-orm";
import { adminOnly } from "../lib/auth.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const allExperience = await db
      .select()
      .from(workExperience)
      .orderBy(workExperience.order);
    res.json(allExperience);
  } catch (error) {
    console.error("Error fetching experience:", error);
    res.status(500).json({ error: "Failed to fetch experience" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const [experience] = await db
      .select()
      .from(workExperience)
      .where(eq(workExperience.id, id));

    if (!experience) {
      return res.status(404).json({ error: "Experience not found" });
    }

    res.json(experience);
  } catch (error) {
    console.error("Error fetching experience:", error);
    res.status(500).json({ error: "Failed to fetch experience" });
  }
});

// POST create experience (admin only)
router.post("/", adminOnly, async (req: Request, res: Response) => {
  try {
    const { companyEn, companyAr, positionEn, positionAr, descriptionEn, descriptionAr, startDate, endDate, isCurrent, location, order } = req.body;
    if (!companyEn || !positionEn || !startDate) {
      return res.status(400).json({ error: "Missing required fields: companyEn, positionEn, startDate" });
    }
    const [created] = await db.insert(workExperience).values({
      companyEn,
      companyAr: companyAr ?? companyEn,
      positionEn,
      positionAr: positionAr ?? positionEn,
      descriptionEn: descriptionEn ?? null,
      descriptionAr: descriptionAr ?? null,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      isCurrent: isCurrent ?? false,
      location: location ?? null,
      order: order ?? 999,
    }).returning();
    res.status(201).json(created);
  } catch (error) {
    console.error("Error creating experience:", error);
    res.status(500).json({ error: "Failed to create experience" });
  }
});

// PUT update experience (admin only)
router.put("/:id", adminOnly, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { companyEn, companyAr, positionEn, positionAr, descriptionEn, descriptionAr, startDate, endDate, isCurrent, location, order } = req.body;
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (companyEn !== undefined) updateData.companyEn = companyEn;
    if (companyAr !== undefined) updateData.companyAr = companyAr;
    if (positionEn !== undefined) updateData.positionEn = positionEn;
    if (positionAr !== undefined) updateData.positionAr = positionAr;
    if (descriptionEn !== undefined) updateData.descriptionEn = descriptionEn;
    if (descriptionAr !== undefined) updateData.descriptionAr = descriptionAr;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (isCurrent !== undefined) updateData.isCurrent = isCurrent;
    if (location !== undefined) updateData.location = location;
    if (order !== undefined) updateData.order = order;
    const [updated] = await db.update(workExperience).set(updateData).where(eq(workExperience.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Experience not found" });
    res.json(updated);
  } catch (error) {
    console.error("Error updating experience:", error);
    res.status(500).json({ error: "Failed to update experience" });
  }
});

// DELETE experience (admin only)
router.delete("/:id", adminOnly, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(workExperience).where(eq(workExperience.id, id));
    res.json({ message: "Experience deleted successfully" });
  } catch (error) {
    console.error("Error deleting experience:", error);
    res.status(500).json({ error: "Failed to delete experience" });
  }
});

export default router;
