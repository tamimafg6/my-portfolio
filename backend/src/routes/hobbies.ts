import { Router, Request, Response } from "express";
import { db } from "../db/index.js";
import { hobbies } from "../db/schema/portfolio.js";
import { eq } from "drizzle-orm";
import { adminOnly } from "../lib/auth.js";

const router = Router();

// GET all hobbies (public)
router.get("/", async (req: Request, res: Response) => {
  try {
    const all = await db.select().from(hobbies).orderBy(hobbies.order);
    res.json(all);
  } catch (error) {
    console.error("Error fetching hobbies:", error);
    res.status(500).json({ error: "Failed to fetch hobbies" });
  }
});

// GET hobby by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const [row] = await db.select().from(hobbies).where(eq(hobbies.id, id));
    if (!row) return res.status(404).json({ error: "Hobby not found" });
    res.json(row);
  } catch (error) {
    console.error("Error fetching hobby:", error);
    res.status(500).json({ error: "Failed to fetch hobby" });
  }
});

// POST create hobby (admin only)
router.post("/", adminOnly, async (req: Request, res: Response) => {
  try {
    const { titleEn, titleAr, descriptionEn, descriptionAr, order } = req.body;
    if (!titleEn) {
      return res.status(400).json({ error: "titleEn is required" });
    }
    const [created] = await db
      .insert(hobbies)
      .values({
        titleEn,
        titleAr: titleAr ?? titleEn,
        descriptionEn: descriptionEn ?? null,
        descriptionAr: descriptionAr ?? null,
        order: order ?? 999,
      })
      .returning();
    res.status(201).json(created);
  } catch (error) {
    console.error("Error creating hobby:", error);
    res.status(500).json({ error: "Failed to create hobby" });
  }
});

// PUT update hobby (admin only)
router.put("/:id", adminOnly, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { titleEn, titleAr, descriptionEn, descriptionAr, order } = req.body;
    const [updated] = await db
      .update(hobbies)
      .set({
        ...(titleEn !== undefined && { titleEn }),
        ...(titleAr !== undefined && { titleAr }),
        ...(descriptionEn !== undefined && { descriptionEn }),
        ...(descriptionAr !== undefined && { descriptionAr }),
        ...(order !== undefined && { order }),
        updatedAt: new Date(),
      })
      .where(eq(hobbies.id, id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Hobby not found" });
    res.json(updated);
  } catch (error) {
    console.error("Error updating hobby:", error);
    res.status(500).json({ error: "Failed to update hobby" });
  }
});

// DELETE hobby (admin only)
router.delete("/:id", adminOnly, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(hobbies).where(eq(hobbies.id, id));
    res.json({ message: "Hobby deleted successfully" });
  } catch (error) {
    console.error("Error deleting hobby:", error);
    res.status(500).json({ error: "Failed to delete hobby" });
  }
});

export default router;
