import { Router } from "express";
import { submitMessage, getMessages, markAsRead } from "../controllers/contact.controller";
import { protect, authorize } from "../middleware/auth.middleware";

const router = Router();

router.post("/", submitMessage);
router.get("/", protect, authorize("admin"), getMessages);
router.patch("/:id/read", protect, authorize("admin"), markAsRead);

export default router;
