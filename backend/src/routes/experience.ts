import { Router, Request, Response } from "express";
import { db } from "../db/index.js";
import { workExperience } from "../db/schema/portfolio.js";
import { eq } from "drizzle-orm";

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

export default router;
