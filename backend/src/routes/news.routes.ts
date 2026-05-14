import express from "express";
import { getNews, getNewsById, createNews, updateNews, deleteNews } from "../controllers/news.controller";
import { protect, authorize } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/", getNews);
router.get("/:id", getNewsById);

// Admin only routes
router.post("/", protect, authorize("admin"), createNews);
router.put("/:id", protect, authorize("admin"), updateNews);
router.delete("/:id", protect, authorize("admin"), deleteNews);

export default router;
