import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import User from "../models/User";

// Setup Nodemailer transporter (User should configure ENV variables later)
const transporter = nodemailer.createTransport({
  service: "gmail", // Change depending on provider
  auth: {
    user: process.env.EMAIL_USER || "test@example.com",
    pass: process.env.EMAIL_PASS || "password123",
  },
});

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

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
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

    if (!user.password) {
      return res.status(401).json({
        message: "Account was created with a social login. Please sign in with Google or Discord.",
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

/* ===============================================
   OAUTH LOGIN (Google / Discord)
   POST /api/auth/oauth
   =============================================== */
export const oauthLogin = async (req: Request, res: Response) => {
  try {
    const { provider, providerId, email, fullName, avatarUrl } = req.body;

    if (!provider || !providerId || !email) {
      return res.status(400).json({ message: "Provider info missing" });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Find existing user by email
    let user = await User.findOne({ email: cleanEmail });

    if (!user) {
      // First time logging in with this OAuth provider, create an account
      user = await User.create({
        fullName: fullName || "Gamer",
        email: cleanEmail,
        googleId: provider === "google" ? providerId : undefined,
        discordId: provider === "discord" ? providerId : undefined,
        avatarUrl: avatarUrl || "",
        role: "player",
      });
    } else {
      // Link the new provider if necessary
      if (provider === "google" && !user.googleId) user.googleId = providerId;
      if (provider === "discord" && !user.discordId) user.discordId = providerId;
      await user.save();
    }

    const token = signToken({ id: user._id.toString(), role: user.role });

    return res.json({
      message: "OAuth Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err: any) {
    console.error("OAUTH ERROR:", err);
    return res.status(500).json({ message: "Server error during OAuth" });
  }
};

/* ===============================================
   FORGOT PASSWORD
   POST /api/auth/forgot-password
   =============================================== */
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    
    // For security, always return success even if email not found
    if (!user) return res.json({ message: "If an account exists, a reset link was sent." });

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    await user.save({ validateBeforeSave: false });

    // Send email
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    
    // We try to send the email. If we fail (e.g., bad credentials), we still return success to the user 
    // but log it to the console for the developer.
    try {
      await transporter.sendMail({
        to: user.email,
        subject: "Password Reset Request",
        text: `You requested a password reset. Please go to this link to reset your password: \n\n ${resetUrl}`
      });
      console.log(`[DEV ONLY] Reset Link Generated: ${resetUrl}`);
    } catch (emailErr) {
      console.log(`[DEV ONLY] Email failed to send, but here is the link: ${resetUrl}`);
    }

    return res.json({ message: "If an account exists, a reset link was sent." });
  } catch (err: any) {
    console.error("FORGOT PASSWORD ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ===============================================
   RESET PASSWORD
   POST /api/auth/reset-password
   =============================================== */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password required" });
    }

    // Hash the token from the user to compare it with the DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Token is invalid or has expired" });
    }

    // Set new password
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.json({ message: "Password reset successful. You may now log in." });
  } catch (err: any) {
    console.error("RESET PASSWORD ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
