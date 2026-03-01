import express from "express";
import {
    getTournaments,
    getTournamentById,
    registerForTournament,
    getOrganizerTournaments,
    createTournament,
    initiateEsewaPayment,
    esewaSuccess,
    esewaFailure,
} from "../controllers/tournament.controller";
import { protect, authorize } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/", protect, authorize("organizer", "admin"), createTournament);
router.get("/organizer/me", protect, authorize("organizer", "admin"), getOrganizerTournaments);
router.get("/", getTournaments);
router.get("/:id", getTournamentById);
router.post("/:id/register", protect, registerForTournament);
router.post("/:id/esewa-payment", protect, initiateEsewaPayment);
router.get("/esewa/success", esewaSuccess);
router.get("/esewa/failure", esewaFailure);

export default router;
