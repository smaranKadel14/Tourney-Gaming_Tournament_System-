import { Request, Response } from "express";
import Notification from "../models/Notification";

// Returns all notifications for the logged-in user
export const getNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        const notifications = await Notification.find({ recipient: userId })
            .sort({ createdAt: -1 })
            .limit(50);
        
        res.json(notifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Marks a specific notification as seen by the user
export const markAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = (req as any).user?.id;

        const notification = await Notification.findOneAndUpdate(
            { _id: id, recipient: userId },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            res.status(404).json({ message: "Notification not found" });
            return;
        }

        res.json(notification);
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Marks all notifications for a user as seen
export const markAllAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });
        res.json({ message: "All notifications marked as read" });
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Deletes all notifications for the user
export const clearAllNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        await Notification.deleteMany({ recipient: userId });
        res.json({ message: "All notifications cleared" });
    } catch (error) {
        console.error("Error clearing all notifications:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Utility function to create internal notifications
export const createNotification = async (data: {
    recipient: string;
    actor?: string;
    type: "registration" | "payment" | "tournament_update" | "system" | "team_request" | "team_response" | "team_kicked" | "team_captain_promoted" | "team_member_left";
    message: string;
    link?: string;
}) => {
    try {
        await Notification.create(data);
    } catch (error) {
        console.error("Error creating notification:", error);
    }
};
