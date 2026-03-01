import express from "express";
import {
    getTournaments,
    getTournamentById,
    registerForTournament,
    getOrganizerTournaments,
    createTournament,
} from "../controllers/tournament.controller";
import { protect, authorize } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/", protect, authorize("organizer", "admin"), createTournament);
router.get("/organizer/me", protect, authorize("organizer", "admin"), getOrganizerTournaments);
router.get("/", getTournaments);
router.get("/:id", getTournamentById);
router.post("/:id/register", protect, registerForTournament);

export default router;
