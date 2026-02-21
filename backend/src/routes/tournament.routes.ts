import express from "express";
import {
    getTournaments,
    getTournamentById,
    registerForTournament,
} from "../controllers/tournament.controller";
import { protect } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/", getTournaments);
router.get("/:id", getTournamentById);
router.post("/:id/register", protect, registerForTournament);

export default router;
