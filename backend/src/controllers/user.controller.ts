import { Request, Response } from "express";
import User from "../models/User";
import Registration from "../models/Registration";

export const getProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id || (req as any).user._id;
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const registrations = await Registration.find({ 
            user: userId, 
            status: { $in: ["confirmed", "completed"] } 
        }).populate({
            path: 'tournament',
            populate: { path: 'game' }
        }).sort({ createdAt: -1 });

        const history = registrations.map(r => r.tournament).filter(Boolean);

        res.json({
            ...user.toObject(),
            history,
            stats: {
                totalTournaments: history.length,
                memberSince: (user as any).createdAt
            }
        });
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

export const searchUsers = async (req: Request, res: Response) => {
    try {
        const { q } = req.query;
        let query: any = { role: { $ne: "admin" } }; // Keep admin accounts private
        
        if (q && typeof q === 'string' && q.trim() !== '') {
            query.fullName = { $regex: q.trim(), $options: "i" };
        }

        const users = await User.find(query)
            .select("_id fullName role avatarUrl bio")
            .limit(50)
            .sort({ createdAt: -1 });
            
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

export const getPublicProfile = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select("_id fullName role avatarUrl bio createdAt");
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Fetch user's registered/played tournaments
        const registrations = await Registration.find({ 
            user: id, 
            status: { $in: ["confirmed", "completed"] } 
        })
        .populate({
            path: "tournament",
            select: "title game startDate status imageUrl",
            populate: { path: "game", select: "title imageUrl" }
        })
        .sort({ createdAt: -1 });

        // Filter out null tournaments in case of dangling references
        const history = registrations.map(r => r.tournament).filter(Boolean);

        const stats = {
            totalTournaments: history.length,
            memberSince: (user as any).createdAt
        };

        res.json({
            user,
            stats,
            history
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};
