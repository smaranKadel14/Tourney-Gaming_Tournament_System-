import { Request, Response } from "express";
import Tournament from "../models/Tournament";
import Registration from "../models/Registration";
import CryptoJS from "crypto-js";
import { v4 as uuidv4 } from "uuid";

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
            status,
            registrationFee,
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
            registrationFee: registrationFee || 0,
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

// @desc    Delete a tournament
// @route   DELETE /api/tournaments/:id
// @access  Private (Admin or Organizer)
export const deleteTournament = async (req: Request, res: Response): Promise<void> => {
    try {
        const tournamentId = req.params.id;
        const user = (req as any).user;

        const tournament = await Tournament.findById(tournamentId);

        if (!tournament) {
            res.status(404).json({ message: "Tournament not found" });
            return;
        }

        // Check ownership if user is organizer
        if (user.role === "organizer" && tournament.organizer.toString() !== user.id) {
            res.status(403).json({ message: "Not authorized to delete this tournament" });
            return;
        }

        await Tournament.findByIdAndDelete(tournamentId);

        res.json({ message: "Tournament removed successfully" });
    } catch (error) {
        console.error("Error deleting tournament:", error);
        res.status(500).json({ message: "Server error on deleting tournament" });
    }
};

// --- ESEWA INTEGRATION ---

// Helper function to generate eSewa Signature
const generateEsewaSignature = (
    totalAmount: number,
    transactionUuid: string,
    productCode: string,
    secretKey: string
) => {
    const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
    const hash = CryptoJS.HmacSHA256(message, secretKey);
    return CryptoJS.enc.Base64.stringify(hash);
};

// @desc    Initiate eSewa payment for tournament registration
// @route   POST /api/tournaments/:id/esewa-payment
// @access  Private
export const initiateEsewaPayment = async (req: Request, res: Response): Promise<void> => {
    try {
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

        if (tournament.status === "completed") {
            res.status(400).json({ message: "Tournament has already completed" });
            return;
        }

        if (new Date() > new Date(tournament.registrationDeadline)) {
            res.status(400).json({ message: "Registration deadline has passed" });
            return;
        }

        const existingRegistration = await Registration.findOne({
            user: userId,
            tournament: tournamentId
        });

        if (existingRegistration && existingRegistration.paymentStatus === "completed") {
            res.status(400).json({ message: "You are already registered for this tournament" });
            return;
        }

        // If the tournament has no fee, we can just register them directly without eSewa
        if (!tournament.registrationFee || tournament.registrationFee <= 0) {
            res.status(400).json({ message: "No registration fee required. Use standard registration endpoint." });
            return;
        }

        const transactionUuid = `${userId}-${tournamentId}-${Date.now()}`;
        const totalAmount = tournament.registrationFee;

        // Save a pending registration so we can verify it later
        if (existingRegistration) {
            existingRegistration.transactionId = transactionUuid;
            existingRegistration.paymentStatus = "pending";
            await existingRegistration.save();
        } else {
            await Registration.create({
                user: userId,
                tournament: tournamentId,
                status: "pending",
                paymentStatus: "pending",
                paymentMethod: "esewa",
                transactionId: transactionUuid
            });
        }

        const secretKey = "8gBm/:&EnhH.1/q"; // eSewa Test Secret Key
        const productCode = "EPAYTEST";
        const signature = generateEsewaSignature(totalAmount, transactionUuid, productCode, secretKey);

        const esewaPayload = {
            amount: totalAmount.toString(),
            tax_amount: "0",
            total_amount: totalAmount.toString(),
            transaction_uuid: transactionUuid,
            product_code: productCode,
            product_delivery_charge: "0",
            product_service_charge: "0",
            success_url: `http://localhost:5000/api/tournaments/esewa/success`,
            failure_url: `http://localhost:5000/api/tournaments/esewa/failure`,
            signed_field_names: "total_amount,transaction_uuid,product_code",
            signature: signature,
        };

        res.json({
            message: "Payment initiated",
            paymentUrl: "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
            esewaPayload
        });
    } catch (error) {
        console.error("Error initiating eSewa payment:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Handle eSewa success callback
// @route   GET /api/tournaments/esewa/success
// @access  Public (Called by eSewa)
export const esewaSuccess = async (req: Request, res: Response): Promise<void> => {
    try {
        const encodedData = req.query.data as string;

        if (!encodedData) {
            res.status(400).json({ message: "Missing data payload from eSewa" });
            return;
        }

        // Decode the base64 response from eSewa
        const decodedString = Buffer.from(encodedData, 'base64').toString('utf-8');
        const data = JSON.parse(decodedString);

        if (data.status !== "COMPLETE") {
            res.redirect('http://localhost:5173/payment/failure');
            return;
        }

        // Verify the transaction UUID exists in our database
        const registration = await Registration.findOne({ transactionId: data.transaction_uuid });

        if (!registration) {
            res.status(404).json({ message: "Registration record not found" });
            return;
        }

        // Update registration status
        registration.paymentStatus = "completed";
        registration.status = "confirmed";
        await registration.save();

        // Redirect to a frontend success page
        res.redirect(`http://localhost:5173/tournament/${registration.tournament}?payment=success`);
    } catch (error) {
        console.error("Error handling eSewa success:", error);
        res.redirect('http://localhost:5173/payment/failure');
    }
};

// @desc    Handle eSewa failure callback
// @route   GET /api/tournaments/esewa/failure
// @access  Public (Called by eSewa)
export const esewaFailure = async (req: Request, res: Response): Promise<void> => {
    try {
        // eSewa failure doesn't return the transaction_uuid cleanly in standard V2 testing, 
        // but we just redirect to a failure page on the frontend
        res.redirect('http://localhost:5173/payment/failure');
    } catch (error) {
        console.error("Error handling eSewa failure:", error);
        res.redirect('http://localhost:5173/payment/failure');
    }
};
