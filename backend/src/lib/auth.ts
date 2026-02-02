import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET || process.env.AUTH_JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET or AUTH_JWT_SECRET environment variable is required",
  );
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Middleware to verify JWT token from auth-service
export const verifyToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("No Bearer token in Authorization header");
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.substring(7);
    console.log("Verifying token, length:", token.length);

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id?: string;
      sub?: string; // Some tokens use 'sub' instead of 'id'
      email: string;
      role: string;
    };

    console.log("Token decoded successfully, role:", decoded.role);

    // Normalize role to lowercase for consistency
    const normalizedRole = decoded.role?.toLowerCase() || "";

    // Map 'sub' to 'id' if needed
    req.user = {
      id: decoded.id || decoded.sub || "",
      email: decoded.email,
      role: normalizedRole,
    };
    
    console.log("Normalized role:", normalizedRole);
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      console.error("JWT Error:", error.message);
    }
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// Middleware to check if user is admin
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden - Admin access required" });
  }

  next();
};

// Combined middleware for admin-only routes
export const adminOnly = [verifyToken, requireAdmin];
