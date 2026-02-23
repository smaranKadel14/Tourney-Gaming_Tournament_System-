import { Request, Response } from "express";
import User from "../models/User";

export const getProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id || (req as any).user._id;
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const { fullName, bio, avatarUrl } = req.body;
        const userId = (req as any).user.id || (req as any).user._id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (fullName) user.fullName = fullName;
        if (bio !== undefined) user.bio = bio; // Allow empty string
        if (avatarUrl !== undefined) user.avatarUrl = avatarUrl; // Allow empty string to remove avatar

        const updatedUser = await user.save();

        // Return without password
        const userResponse = updatedUser.toObject() as any;
        delete userResponse.password;

        res.json(userResponse);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

export const uploadAvatar = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const userId = (req as any).user.id || (req as any).user._id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Create the public URL for the newly uploaded file
        // Example: /uploads/profiles/avatar-123456.jpg
        const avatarUrl = `/uploads/profiles/${req.file.filename}`;

        user.avatarUrl = avatarUrl;
        await user.save();

        res.json({ message: "Avatar uploaded successfully", avatarUrl });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};
