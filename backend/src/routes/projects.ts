import { Router, Request, Response } from "express";
import { db } from "../db/index.js";
import { projects } from "../db/schema/portfolio.js";
import { eq } from "drizzle-orm";
import { adminOnly } from "../lib/auth.js";

const router = Router();

// Helper function to ensure UTF-8 encoding
const ensureUtf8 = (text: string | null): string | null => {
  if (!text) return text;
  // If text contains ?? characters, it's likely corrupted
  // Try to decode it properly
  try {
    // Ensure the string is properly encoded as UTF-8
    return Buffer.from(text, 'utf8').toString('utf8');
  } catch (error) {
    console.error("Encoding error:", error);
    return text;
  }
};

// GET all projects
router.get("/", async (req: Request, res: Response) => {
  try {
    const allProjects = await db
      .select()
      .from(projects)
      .orderBy(projects.order);
    
    // Ensure all text fields are properly UTF-8 encoded
    const encodedProjects = allProjects.map(project => ({
      ...project,
      titleEn: ensureUtf8(project.titleEn),
      titleAr: ensureUtf8(project.titleAr),
      descriptionEn: ensureUtf8(project.descriptionEn),
      descriptionAr: ensureUtf8(project.descriptionAr),
    }));
    
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.json(encodedProjects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).setHeader("Content-Type", "application/json; charset=utf-8");
    res.json({ error: "Failed to fetch projects" });
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

    // Ensure UTF-8 encoding for text fields
    const ensureUtf8String = (str: string | undefined): string => {
      if (!str) return "";
      // Convert to Buffer and back to ensure proper UTF-8 encoding
      return Buffer.from(str, 'utf8').toString('utf8');
    };

    const [newProject] = await db
      .insert(projects)
      .values({
        titleEn: ensureUtf8String(titleEn),
        titleAr: titleAr ? ensureUtf8String(titleAr) : ensureUtf8String(titleEn),
        descriptionEn: ensureUtf8String(descriptionEn),
        descriptionAr: descriptionAr ? ensureUtf8String(descriptionAr) : ensureUtf8String(descriptionEn),
        image: image || null,
        url: url || null,
        githubUrl: githubUrl || null,
        technologies: technologies || JSON.stringify([]),
        featured: featured || false,
        order: order || 999,
      })
      .returning();

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(201).json(newProject);
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).setHeader("Content-Type", "application/json; charset=utf-8");
    res.json({ error: "Failed to create project" });
  }
});

// PUT update project (admin only)
router.put("/:id", adminOnly, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    // Ensure UTF-8 encoding for text fields
    const ensureUtf8String = (str: string | undefined): string | undefined => {
      if (!str) return str;
      return Buffer.from(str, 'utf8').toString('utf8');
    };

    const updateData: any = { ...req.body, updatedAt: new Date() };
    
    // Ensure UTF-8 for all text fields
    if (updateData.titleEn) updateData.titleEn = ensureUtf8String(updateData.titleEn);
    if (updateData.titleAr) updateData.titleAr = ensureUtf8String(updateData.titleAr);
    if (updateData.descriptionEn) updateData.descriptionEn = ensureUtf8String(updateData.descriptionEn);
    if (updateData.descriptionAr) updateData.descriptionAr = ensureUtf8String(updateData.descriptionAr);

    const [updatedProject] = await db
      .update(projects)
      .set(updateData)
      .where(eq(projects.id, id))
      .returning();

    if (!updatedProject) {
      return res.status(404).setHeader("Content-Type", "application/json; charset=utf-8").json({ error: "Project not found" });
    }

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.json(updatedProject);
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).setHeader("Content-Type", "application/json; charset=utf-8");
    res.json({ error: "Failed to update project" });
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
