import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/User";
import connectDB from "../config/db";

// Load environment variables from backend/.env
dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB for admin creation...");

    const email = "admin@tourney.com";
    const password = "password123";

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      console.log(`Admin user with email ${email} already exists.`);
      process.exit(0);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the admin user
    const adminUser = new User({
      fullName: "System Admin",
      email: email,
      password: hashedPassword,
      role: "admin",
    });

    await adminUser.save();
    console.log(`Successfully created Admin User!
    Email: ${email}
    Password: ${password}`);

    process.exit(0);
  } catch (err) {
    console.error("Error creating admin user:", err);
    process.exit(1);
  }
};

createAdmin();
