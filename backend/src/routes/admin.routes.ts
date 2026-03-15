import express from "express";
import {
  getDashboardStats,
  getRecentActivity,
  getPendingApprovals,
  approvePendingItem,
  rejectPendingItem,
} from "../controllers/admin.controller";
import { protect, authorize } from "../middleware/auth.middleware";

const router = express.Router();

// All admin routes require admin role
router.use(protect, authorize("admin"));

// Dashboard endpoints
router.get("/stats", getDashboardStats);
router.get("/activity", getRecentActivity);
router.get("/pending-approvals", getPendingApprovals);
router.post("/approvals/:id/approve", approvePendingItem);
router.post("/approvals/:id/reject", rejectPendingItem);

export default router;
