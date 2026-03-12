import express from "express";
import {
    getTournaments,
    getTournamentById,
    registerForTournament,
    getOrganizerTournaments,
    getOrganizerPlayers,
    createTournament,
    updateTournament,
    getTournamentRegistrations,
    getOrganizerStats,
    updateRegistrationStatus,
    initiateEsewaPayment,
    esewaSuccess,
    esewaFailure,
    deleteTournament,
} from "../controllers/tournament.controller";
import { protect, authorize } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/", protect, authorize("organizer", "admin"), createTournament);
router.get("/organizer/me", protect, authorize("organizer", "admin"), getOrganizerTournaments);
router.get("/organizer/players", protect, authorize("organizer", "admin"), getOrganizerPlayers);
router.get("/organizer/stats", protect, authorize("organizer", "admin"), getOrganizerStats);
router.get("/", getTournaments);
router.get("/:id", getTournamentById);
router.put("/:id", protect, authorize("organizer", "admin"), updateTournament);
router.get("/:id/registrations", protect, authorize("organizer", "admin"), getTournamentRegistrations);
router.patch("/:id/registrations/:regId", protect, authorize("organizer", "admin"), updateRegistrationStatus);
router.post("/:id/register", protect, registerForTournament);
router.post("/:id/esewa-payment", protect, initiateEsewaPayment);
router.delete("/:id", protect, authorize("admin", "organizer"), deleteTournament);
router.get("/esewa/success", esewaSuccess);
router.get("/esewa/failure", esewaFailure);

export default router;

