import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import skillsRouter from "./routes/skills.js";
import projectsRouter from "./routes/projects.js";
import experienceRouter from "./routes/experience.js";
import educationRouter from "./routes/education.js";
import contactRouter from "./routes/contact.js";
import resumeRouter from "./routes/resume.js";
import profileRouter from "./routes/profile.js";
import hobbiesRouter from "./routes/hobbies.js";
import testimonialsRouter from "./routes/testimonials.js";
import { closeConnection } from "./lib/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "..", "..", ".env") });

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "backend",
    database: process.env.DATABASE_URL ? "connected" : "not configured",
  });
});

// API Routes
app.use("/api/skills", skillsRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/experience", experienceRouter);
app.use("/api/education", educationRouter);
app.use("/api/contact", contactRouter);
app.use("/api/resume", resumeRouter);
app.use("/api/profile", profileRouter);
app.use("/api/hobbies", hobbiesRouter);
app.use("/api/testimonials", testimonialsRouter);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, closing database connection...");
  await closeConnection();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, closing database connection...");
  await closeConnection();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(
    `🔗 Auth service: ${process.env.AUTH_SERVICE_URL || "not configured"}`,
  );
  console.log(
    `🗄️  Database: ${process.env.DATABASE_URL ? "connected" : "not configured"}`,
  );
});
