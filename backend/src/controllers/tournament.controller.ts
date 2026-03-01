import { Request, Response } from "express";
import Tournament from "../models/Tournament";
import Registration from "../models/Registration";

// @desc    Get all tournaments
// @route   GET /api/tournaments
// @access  Public
export const getTournaments = async (req: Request, res: Response) => {
    try {
        const { status } = req.query;

        let query = {};
        if (status) {
            query = { status };
        }

        const tournaments = await Tournament.find(query)
            .populate("game", "title imageUrl")
            .sort({ startDate: 1 });

        res.json(tournaments);
    } catch (error) {
        console.error("Error fetching tournaments:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Get single tournament by ID
// @route   GET /api/tournaments/:id
// @access  Public
export const getTournamentById = async (req: Request, res: Response): Promise<void> => {
    try {
        const tournament = await Tournament.findById(req.params.id)
            .populate("game", "title imageUrl description");

        if (!tournament) {
            res.status(404).json({ message: "Tournament not found" });
            return;
        }

        res.json(tournament);
    } catch (error) {
        console.error("Error fetching tournament:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Register for a tournament
// @route   POST /api/tournaments/:id/register
// @access  Private
export const registerForTournament = async (req: Request, res: Response): Promise<void> => {
    try {
        // Note: This assumes req.user is set by an auth middleware. 
        // Types might need adjusting based on how auth is implemented.
        const userId = (req as any).user?.id;
        const tournamentId = req.params.id;

        if (!userId) {
            res.status(401).json({ message: "Not authorized" });
            return;
        }

        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
            res.status(404).json({ message: "Tournament not found" });
            return;
        }

        // Check if tournament is upcoming or ongoing (not completed)
        if (tournament.status === "completed") {
            res.status(400).json({ message: "Tournament has already completed" });
            return;
        }

        // Check registration deadline
        if (new Date() > new Date(tournament.registrationDeadline)) {
            res.status(400).json({ message: "Registration deadline has passed" });
            return;
        }

        // Check if user is already registered
        const existingRegistration = await Registration.findOne({
            user: userId,
            tournament: tournamentId
        });

        if (existingRegistration) {
            res.status(400).json({ message: "You are already registered for this tournament" });
            return;
        }

        // Create registration
        const registration = await Registration.create({
            user: userId,
            tournament: tournamentId,
            status: "pending"
        });

        res.status(201).json({
            message: "Successfully registered for tournament",
            registration
        });
    } catch (error) {
        console.error("Error registering for tournament:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Get tournaments for the logged in organizer
// @route   GET /api/tournaments/organizer/me
// @access  Private (Organizer/Admin)
export const getOrganizerTournaments = async (req: Request, res: Response): Promise<void> => {
    try {
        const organizerId = (req as any).user?.id;

        if (!organizerId) {
            res.status(401).json({ message: "Not authorized" });
            return;
        }

        const tournaments = await Tournament.find({ organizer: organizerId })
            .populate("game", "title imageUrl")
            .sort({ startDate: 1 });

        res.json(tournaments);
    } catch (error) {
        console.error("Error fetching organizer tournaments:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Create a new tournament
// @route   POST /api/tournaments
// @access  Private (Organizer/Admin)
export const createTournament = async (req: Request, res: Response): Promise<void> => {
    try {
        const organizerId = (req as any).user?.id;

        if (!organizerId) {
            res.status(401).json({ message: "Not authorized" });
            return;
        }

        const {
            title,
            game,
            description,
            startDate,
            endDate,
            location,
            registrationDeadline,
            prizePool,
            rules,
            maxParticipants,
            imageUrl,
            status
        } = req.body;

        const tournament = await Tournament.create({
            title,
            game,
            organizer: organizerId,
            description,
            startDate,
            endDate,
            location,
            registrationDeadline,
            prizePool: prizePool || "TBA",
            rules: rules || "",
            maxParticipants: maxParticipants || 0,
            imageUrl,
            status: status || "upcoming"
        });

        res.status(201).json(tournament);
    } catch (error: any) {
        console.error("Error creating tournament:", error);
        res.status(500).json({ message: "Server error", details: error.message, errors: error.errors });
    }
};
