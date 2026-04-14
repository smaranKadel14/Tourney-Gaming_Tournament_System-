import express from "express";
import { 
    createTeam, 
    getTeams, 
    getTeamById, 
    requestToJoinTeam, 
    handleJoinRequest, 
    getTeamRequests,
    updateTeam,
    uploadTeamLogo,
    kickMember,
    transferCaptainship,
    leaveTeam
} from "../controllers/team.controller";
import { protect } from "../middleware/auth.middleware";
import upload from "../middleware/upload";

const router = express.Router();

router.get("/", getTeams);
router.get("/:id", getTeamById);

// Protected routes
router.post("/", protect, createTeam);
router.post("/:id/join", protect, requestToJoinTeam);
router.get("/:id/requests", protect, getTeamRequests);
router.patch("/:id/requests/:requestId", protect, handleJoinRequest);

router.put("/:id", protect, updateTeam);
router.post("/:id/logo", protect, upload.single("logo"), uploadTeamLogo);
router.post("/:id/leave", protect, leaveTeam);
router.delete("/:id/members/:userId", protect, kickMember);
router.patch("/:id/captain", protect, transferCaptainship);

export default router;
