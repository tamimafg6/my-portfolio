import { Router, Request, Response } from "express";
import { db } from "../db/index.js";
import { projects } from "../db/schema/portfolio.js";
import { eq } from "drizzle-orm";
import { adminOnly } from "../lib/auth.js";

const router = Router();

// GET all projects
router.get("/", async (req: Request, res: Response) => {
  try {
    const allProjects = await db
      .select()
      .from(projects)
      .orderBy(projects.order);
    res.json(allProjects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// GET project by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id));

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

// POST create project (admin only)
router.post("/", adminOnly, async (req: Request, res: Response) => {
  try {
    const {
      titleEn,
      titleAr,
      descriptionEn,
      descriptionAr,
      image,
      url,
      githubUrl,
      technologies,
      featured,
      order,
    } = req.body;

    if (!titleEn || !descriptionEn) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const [newProject] = await db
      .insert(projects)
      .values({
        titleEn,
        titleAr: titleAr || titleEn,
        descriptionEn,
        descriptionAr: descriptionAr || descriptionEn,
        image: image || null,
        url: url || null,
        githubUrl: githubUrl || null,
        technologies: technologies || JSON.stringify([]),
        featured: featured || false,
        order: order || 999,
      })
      .returning();

    res.status(201).json(newProject);
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: "Failed to create project" });
  }
});

// PUT update project (admin only)
router.put("/:id", adminOnly, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updateData = { ...req.body, updatedAt: new Date() };

    const [updatedProject] = await db
      .update(projects)
      .set(updateData)
      .where(eq(projects.id, id))
      .returning();

    if (!updatedProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(updatedProject);
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ error: "Failed to update project" });
  }
});

// DELETE project (admin only)
router.delete("/:id", adminOnly, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(projects).where(eq(projects.id, id));
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

export default router;
