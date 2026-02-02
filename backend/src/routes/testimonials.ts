import { Router, Request, Response } from "express";
import { db } from "../db/index.js";
import { testimonials } from "../db/schema/portfolio.js";
import { eq, desc } from "drizzle-orm";
import { adminOnly } from "../lib/auth.js";

const router = Router();

// GET all approved testimonials (public)
router.get("/", async (req: Request, res: Response) => {
  try {
    const allTestimonials = await db
      .select()
      .from(testimonials)
      .where(eq(testimonials.isApproved, true))
      .orderBy(desc(testimonials.createdAt));
    
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.json(allTestimonials);
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    res.status(500).setHeader("Content-Type", "application/json; charset=utf-8");
    res.json({ error: "Failed to fetch testimonials" });
  }
});

// GET all testimonials (admin only - includes unapproved)
router.get("/admin", adminOnly, async (req: Request, res: Response) => {
  try {
    const allTestimonials = await db
      .select()
      .from(testimonials)
      .orderBy(desc(testimonials.createdAt));
    
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.json(allTestimonials);
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    res.status(500).setHeader("Content-Type", "application/json; charset=utf-8");
    res.json({ error: "Failed to fetch testimonials" });
  }
});

// POST create testimonial (public - requires approval)
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, email, role, company, content, rating } = req.body;

    if (!name || !email || !content) {
      return res.status(400).json({ error: "Name, email, and content are required" });
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Validate rating (1-5)
    const ratingValue = rating ? parseInt(rating) : 5;
    if (ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const [newTestimonial] = await db
      .insert(testimonials)
      .values({
        name,
        email,
        role: role || null,
        company: company || null,
        content,
        rating: ratingValue,
        isApproved: false, // Requires admin approval
      })
      .returning();

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.status(201).json({
      message: "Thank you for your testimonial! It will be reviewed before being published.",
      testimonial: newTestimonial,
    });
  } catch (error) {
    console.error("Error creating testimonial:", error);
    res.status(500).setHeader("Content-Type", "application/json; charset=utf-8");
    res.json({ error: "Failed to submit testimonial" });
  }
});

// PUT approve/update testimonial (admin only)
router.put("/:id", adminOnly, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updateData: any = { ...req.body, updatedAt: new Date() };

    const [updatedTestimonial] = await db
      .update(testimonials)
      .set(updateData)
      .where(eq(testimonials.id, id))
      .returning();

    if (!updatedTestimonial) {
      return res.status(404).setHeader("Content-Type", "application/json; charset=utf-8").json({ error: "Testimonial not found" });
    }

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.json(updatedTestimonial);
  } catch (error) {
    console.error("Error updating testimonial:", error);
    res.status(500).setHeader("Content-Type", "application/json; charset=utf-8");
    res.json({ error: "Failed to update testimonial" });
  }
});

// DELETE testimonial (admin only)
router.delete("/:id", adminOnly, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(testimonials).where(eq(testimonials.id, id));
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.json({ message: "Testimonial deleted successfully" });
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    res.status(500).setHeader("Content-Type", "application/json; charset=utf-8");
    res.json({ error: "Failed to delete testimonial" });
  }
});

export default router;
