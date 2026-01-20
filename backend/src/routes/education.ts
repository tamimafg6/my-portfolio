import { Router, Request, Response } from "express";
import { db } from "../db/index.js";
import { education } from "../db/schema/portfolio.js";
import { eq } from "drizzle-orm";

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

export default router;
