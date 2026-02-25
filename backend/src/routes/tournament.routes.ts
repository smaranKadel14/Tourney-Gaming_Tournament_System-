import express from "express";
import {
    getTournaments,
    getTournamentById,
    registerForTournament,
    getOrganizerTournaments,
} from "../controllers/tournament.controller";
import { protect, authorize } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/organizer/me", protect, authorize("organizer", "admin"), getOrganizerTournaments);
router.get("/", getTournaments);
router.get("/:id", getTournamentById);
router.post("/:id/register", protect, registerForTournament);

export default router;
