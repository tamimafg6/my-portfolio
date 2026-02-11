import { Router, Request, Response } from "express";
import { db } from "../db/index.js";
import { contactMessages, contactInfo } from "../db/schema/portfolio.js";
import { eq } from "drizzle-orm";
import { adminOnly } from "../lib/auth.js";

const router = Router();

// Simple in-memory rate limiting for contact form
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function getClientIP(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return req.ip || req.socket?.remoteAddress || "unknown";
}

function checkRateLimit(ip: string, maxRequests: number, windowMs: number): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    return { allowed: true };
  }

  if (record.count >= maxRequests) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }

  record.count++;
  return { allowed: true };
}

// POST submit contact form
router.post("/", async (req: Request, res: Response) => {
  try {
    // Rate limiting: 5 messages per 15 minutes per IP
    const ip = getClientIP(req);
    const rateCheck = checkRateLimit(ip, 5, 15 * 60 * 1000);
    
    if (!rateCheck.allowed) {
      return res.status(429).json({ 
        error: "Too many messages. Please try again later.",
        retryAfter: rateCheck.retryAfter
      });
    }

    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    await db.insert(contactMessages).values({
      name,
      email,
      subject,
      message,
      isRead: false,
    });

    res.status(201).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Error saving contact message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// GET all messages (admin only)
router.get("/messages", adminOnly, async (req: Request, res: Response) => {
  try {
    const messages = await db
      .select()
      .from(contactMessages)
      .orderBy(contactMessages.createdAt);
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// DELETE a message by id (admin only)
router.delete("/messages/:id", adminOnly, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid message id" });
    }
    const deleted = await db
      .delete(contactMessages)
      .where(eq(contactMessages.id, id))
      .returning({ id: contactMessages.id });
    if (deleted.length === 0) {
      return res.status(404).json({ error: "Message not found" });
    }
    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ error: "Failed to delete message" });
  }
});

// GET contact info (public - single row for display)
router.get("/info", async (req: Request, res: Response) => {
  try {
    const [info] = await db.select().from(contactInfo).limit(1);
    res.json(info || null);
  } catch (error) {
    console.error("Error fetching contact info:", error);
    res.status(500).json({ error: "Failed to fetch contact info" });
  }
});

// PUT contact info (admin only - upsert single row)
router.put("/info", adminOnly, async (req: Request, res: Response) => {
  try {
    const { email, phone, address, linkedIn, linkedin, github, twitter, website, profilePhotoUrl } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const [existing] = await db.select().from(contactInfo).limit(1);
    const base = {
      email,
      phone: phone ?? null,
      address: address ?? null,
      linkedIn: linkedIn ?? linkedin ?? null,
      github: github ?? null,
      twitter: twitter ?? null,
      website: website ?? null,
      updatedAt: new Date(),
    };
    const updateData = profilePhotoUrl !== undefined ? { ...base, profilePhotoUrl } : base;
    if (existing) {
      const [updated] = await db
        .update(contactInfo)
        .set(updateData)
        .where(eq(contactInfo.id, existing.id))
        .returning();
      return res.json(updated);
    }
    const insertData = profilePhotoUrl !== undefined ? { ...base, profilePhotoUrl } : base;
    const [created] = await db.insert(contactInfo).values(insertData).returning();
    res.json(created);
  } catch (error) {
    console.error("Error updating contact info:", error);
    res.status(500).json({ error: "Failed to update contact info" });
  }
});

export default router;
