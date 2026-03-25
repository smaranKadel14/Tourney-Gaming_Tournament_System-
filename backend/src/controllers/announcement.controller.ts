import { Request, Response } from "express";
import Announcement from "../models/Announcement";
import Notification from "../models/Notification";
import User from "../models/User";

export const createAnnouncement = async (req: Request, res: Response) => {
    try {
        const { title, content } = req.body;
        const authorId = (req as any).user.id || (req as any).user._id;

        const announcement = new Announcement({
            title,
            content,
            author: authorId
        });

        await announcement.save();
        await announcement.populate("author", "fullName avatarUrl role");

        // Notify all players
        const players = await User.find({ role: "player" }).select("_id");
        if (players.length > 0) {
            const notifications = players.map(player => ({
                recipient: player._id,
                actor: authorId,
                type: "system",
                message: `📢 Important Notice: ${title}`,
                link: "/player/community",
            }));
            await Notification.insertMany(notifications);
        }

        res.status(201).json(announcement);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

export const getAnnouncements = async (req: Request, res: Response) => {
    try {
        const announcements = await Announcement.find()
            .populate("author", "fullName avatarUrl role")
            .sort({ createdAt: -1 })
            .limit(20);

        res.json(announcements);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

export const deleteAnnouncement = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.id || (req as any).user._id;
        const userRole = (req as any).user.role;

        const announcement = await Announcement.findById(id);
        if (!announcement) {
            return res.status(404).json({ message: "Announcement not found" });
        }

        if (announcement.author.toString() !== userId && userRole !== 'admin') {
            return res.status(403).json({ message: "Not authorized" });
        }

        await announcement.deleteOne();
        res.json({ message: "Announcement deleted" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};
