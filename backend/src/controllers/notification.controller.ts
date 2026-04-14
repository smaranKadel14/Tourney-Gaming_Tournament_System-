import { Request, Response } from "express";
import Notification from "../models/Notification";

// @desc    Get notifications for the logged in user
// @route   GET /api/notifications
// @access  Private
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

// @desc    Mark a notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
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

// @desc    Mark all notifications as read for the logged in user
// @route   PATCH /api/notifications/read-all
// @access  Private
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

/**
 * Utility function to create a notification internally
 */
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
