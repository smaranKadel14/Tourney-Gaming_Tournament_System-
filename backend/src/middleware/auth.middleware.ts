import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

type JwtPayload = { id: string; role: string };

// Verifies the JWT token in the Authorization header
export const protect = (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized (missing token)" });
    }

    const token = auth.split(" ")[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET missing in .env");

    const decoded = jwt.verify(token, secret) as JwtPayload;

    // Attach decoded user identity to the request object
    // @ts-ignore
    req.user = { id: decoded.id, role: decoded.role };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Not authorized (invalid token)" });
  }
};

// Restricts access based on user roles (Admin, Organizer, etc.)
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const role = req.user?.role;
    if (!role || !roles.includes(role)) {
      return res.status(403).json({ message: "Forbidden (role not allowed)" });
    }
    next();
  };
};
