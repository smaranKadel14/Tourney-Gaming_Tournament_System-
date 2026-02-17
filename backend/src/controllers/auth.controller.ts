import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";

/* ===============================================
   Helper function -> generate JWT token
   =============================================== */
const signToken = (payload: { id: string; role: string }) => {
  const secret = process.env.JWT_SECRET as string;

  return jwt.sign(payload, secret, {
    expiresIn: "7d",
  });
};

/* ===============================================
   REGISTER USER
   POST /api/auth/register
   =============================================== */
export const register = async (req: Request, res: Response) => {
  try {
    const { fullName, email, password, role } = req.body;

    // Basic validation
    if (!fullName || !email || !password) {
      return res
        .status(400)
        .json({ message: "fullName, email, password are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // 🔥 IMPORTANT:
    // Normalize email (avoid duplicate issue with uppercase/spaces)
    const cleanEmail = email.trim().toLowerCase();

    // Check if email already exists
    const existing = await User.findOne({ email: cleanEmail });

    if (existing) {
      return res
        .status(409)
        .json({ message: "Email already registered" });
    }

    // Hash password before saving
    const hashed = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({
      fullName,
      email: cleanEmail, // save normalized email
      password: hashed,
      role: role || "player",
    });

    // Generate token
    const token = signToken({
      id: user._id.toString(),
      role: user.role,
    });

    return res.status(201).json({
      message: "Registered successfully",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err: any) {
    console.log("REGISTER ERROR:", err);

    // Mongo duplicate key protection
    if (err.code === 11000) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    return res.status(500).json({
      message: err.message || "Server error",
    });
  }
};

/* ===============================================
   LOGIN USER
   POST /api/auth/login
   =============================================== */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "email and password are required",
      });
    }

    // normalize email
    const cleanEmail = email.trim().toLowerCase();

    // Find user
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // Compare password
    const ok = await bcrypt.compare(password, user.password);

    if (!ok) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = signToken({
      id: user._id.toString(),
      role: user.role,
    });

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

/* ===============================================
   GET CURRENT USER (Protected Route)
   GET /api/auth/me
   =============================================== */
export const me = async (req: Request, res: Response) => {
  // user id comes from auth middleware
  // @ts-ignore
  const userId = req.user?.id;

  const user = await User.findById(userId).select("-password");

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  return res.json({ user });
};
