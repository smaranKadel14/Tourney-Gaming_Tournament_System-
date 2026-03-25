import express from "express";
import { createAnnouncement, getAnnouncements, deleteAnnouncement } from "../controllers/announcement.controller";
import { protect, authorize } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/", getAnnouncements);
router.post("/", protect, authorize("organizer", "admin"), createAnnouncement);
router.delete("/:id", protect, authorize("organizer", "admin"), deleteAnnouncement);

export default router;
