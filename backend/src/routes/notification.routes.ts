import express from "express";
import { getNotifications, markAsRead, markAllAsRead, clearAllNotifications } from "../controllers/notification.controller";
import { protect } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/", protect, getNotifications);
router.delete("/clear-all", protect, clearAllNotifications);
router.patch("/read-all", protect, markAllAsRead);
router.patch("/:id/read", protect, markAsRead);

export default router;
