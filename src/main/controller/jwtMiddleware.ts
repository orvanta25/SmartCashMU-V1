// middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const JWT_SECRET = "your-super-secret-jwt-key-2025";

export interface JwtPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "Token manquant" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = payload;
    next();
    return
  } catch (err) {
    return res.status(401).json({ success: false, error: "Token invalide ou expiré" });
  }
};
