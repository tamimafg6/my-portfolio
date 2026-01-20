import { Router, Request, Response } from "express";
import { db } from "../db/index.js";
import { skills } from "../db/schema/portfolio.js";
import { eq } from "drizzle-orm";
import { adminOnly } from "../lib/auth.js";

const router = Router();

// GET all skills
router.get("/", async (req: Request, res: Response) => {
  try {
    const allSkills = await db.select().from(skills).orderBy(skills.order);
    res.json(allSkills);
  } catch (error) {
    console.error("Error fetching skills:", error);
    res.status(500).json({ error: "Failed to fetch skills" });
  }
});

// GET skill by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const [skill] = await db.select().from(skills).where(eq(skills.id, id));

    if (!skill) {
      return res.status(404).json({ error: "Skill not found" });
    }

    res.json(skill);
  } catch (error) {
    console.error("Error fetching skill:", error);
    res.status(500).json({ error: "Failed to fetch skill" });
  }
});

// POST create skill (admin only)
router.post("/", adminOnly, async (req: Request, res: Response) => {
  try {
    const { nameEn, nameAr, category, level, icon, order } = req.body;

    if (!nameEn || !category || level === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const [newSkill] = await db
      .insert(skills)
      .values({
        nameEn,
        nameAr: nameAr || nameEn,
        category,
        level,
        icon: icon || "⭐",
        order: order || 999,
      })
      .returning();

    res.status(201).json(newSkill);
  } catch (error) {
    console.error("Error creating skill:", error);
    res.status(500).json({ error: "Failed to create skill" });
  }
});

// PUT update skill (admin only)
router.put("/:id", adminOnly, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { nameEn, nameAr, category, level, icon, order } = req.body;

    const [updatedSkill] = await db
      .update(skills)
      .set({
        nameEn,
        nameAr,
        category,
        level,
        icon,
        order,
        updatedAt: new Date(),
      })
      .where(eq(skills.id, id))
      .returning();

    if (!updatedSkill) {
      return res.status(404).json({ error: "Skill not found" });
    }

    res.json(updatedSkill);
  } catch (error) {
    console.error("Error updating skill:", error);
    res.status(500).json({ error: "Failed to update skill" });
  }
});

// DELETE skill (admin only)
router.delete("/:id", adminOnly, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(skills).where(eq(skills.id, id));
    res.json({ message: "Skill deleted successfully" });
  } catch (error) {
    console.error("Error deleting skill:", error);
    res.status(500).json({ error: "Failed to delete skill" });
  }
});

export default router;
