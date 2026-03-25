import express from "express";
import { getProfile, updateProfile, uploadAvatar, searchUsers, getPublicProfile } from "../controllers/user.controller";
import { protect } from "../middleware/auth.middleware";
import upload from "../middleware/upload";

const router = express.Router();

// Search users (could optionally omit authentication to make search public to web)
router.get("/search", protect, searchUsers);
router.get("/public/:id", protect, getPublicProfile);

// Own profile
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

// Route for uploading actual avatar image file
// 'avatar' is the field name expected in the multipart/form-data request
router.post("/avatar", protect, upload.single("avatar"), uploadAvatar);

export default router;
