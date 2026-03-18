import express from "express";
import {
  getDashboardStats,
  getRecentActivity,
  getPendingApprovals,
  approvePendingItem,
  rejectPendingItem,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getLogs,
  getSettings,
  updateSettings,
  purgeSystemCache,
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

// User Management endpoints
router.get("/users", getAllUsers);
router.put("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

// System Logs
router.get("/logs", getLogs);

// Settings
router.get("/settings", getSettings);
router.put("/settings", updateSettings);
router.post("/purge-cache", purgeSystemCache);

export default router;
