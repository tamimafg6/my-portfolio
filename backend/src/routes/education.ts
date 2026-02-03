import { Router, Request, Response } from "express";
import { db } from "../db/index.js";
import { education } from "../db/schema/portfolio.js";
import { eq } from "drizzle-orm";
import { adminOnly } from "../lib/auth.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const allEducation = await db
      .select()
      .from(education)
      .orderBy(education.order);
    res.json(allEducation);
  } catch (error) {
    console.error("Error fetching education:", error);
    res.status(500).json({ error: "Failed to fetch education" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const [edu] = await db.select().from(education).where(eq(education.id, id));

    if (!edu) {
      return res.status(404).json({ error: "Education not found" });
    }

    res.json(edu);
  } catch (error) {
    console.error("Error fetching education:", error);
    res.status(500).json({ error: "Failed to fetch education" });
  }
});

// POST create education (admin only)
router.post("/", adminOnly, async (req: Request, res: Response) => {
  try {
    const { institutionEn, institutionAr, degreeEn, degreeAr, fieldEn, fieldAr, descriptionEn, descriptionAr, startDate, endDate, location, gpa, order } = req.body;
    if (!institutionEn || !degreeEn || !startDate) {
      return res.status(400).json({ error: "Missing required fields: institutionEn, degreeEn, startDate" });
    }
    const [created] = await db.insert(education).values({
      institutionEn,
      institutionAr: institutionAr ?? institutionEn,
      degreeEn,
      degreeAr: degreeAr ?? degreeEn,
      fieldEn: fieldEn ?? null,
      fieldAr: fieldAr ?? null,
      descriptionEn: descriptionEn ?? null,
      descriptionAr: descriptionAr ?? null,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      location: location ?? null,
      gpa: gpa ?? null,
      order: order ?? 999,
    }).returning();
    res.status(201).json(created);
  } catch (error) {
    console.error("Error creating education:", error);
    res.status(500).json({ error: "Failed to create education" });
  }
});

// PUT update education (admin only)
router.put("/:id", adminOnly, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const body = req.body;
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (body.institutionEn !== undefined) updateData.institutionEn = body.institutionEn;
    if (body.institutionAr !== undefined) updateData.institutionAr = body.institutionAr;
    if (body.degreeEn !== undefined) updateData.degreeEn = body.degreeEn;
    if (body.degreeAr !== undefined) updateData.degreeAr = body.degreeAr;
    if (body.fieldEn !== undefined) updateData.fieldEn = body.fieldEn;
    if (body.fieldAr !== undefined) updateData.fieldAr = body.fieldAr;
    if (body.descriptionEn !== undefined) updateData.descriptionEn = body.descriptionEn;
    if (body.descriptionAr !== undefined) updateData.descriptionAr = body.descriptionAr;
    if (body.startDate !== undefined) updateData.startDate = new Date(body.startDate);
    if (body.endDate !== undefined) updateData.endDate = body.endDate ? new Date(body.endDate) : null;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.gpa !== undefined) updateData.gpa = body.gpa;
    if (body.order !== undefined) updateData.order = body.order;
    const [updated] = await db.update(education).set(updateData).where(eq(education.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Education not found" });
    res.json(updated);
  } catch (error) {
    console.error("Error updating education:", error);
    res.status(500).json({ error: "Failed to update education" });
  }
});

// DELETE education (admin only)
router.delete("/:id", adminOnly, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(education).where(eq(education.id, id));
    res.json({ message: "Education deleted successfully" });
  } catch (error) {
    console.error("Error deleting education:", error);
    res.status(500).json({ error: "Failed to delete education" });
  }
});

export default router;
