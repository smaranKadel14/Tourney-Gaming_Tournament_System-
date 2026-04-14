import Tournament from "../models/Tournament";
import Registration from "../models/Registration";
import Team from "../models/Team";
import { Request, Response } from "express";
import { createNotification } from "./notification.controller";
import { v4 as uuidv4 } from "uuid";
import CryptoJS from "crypto-js";

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
            .populate("game", "title imageUrl genre")
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

        // Check if user is already registered (either solo or via their team)
        const { teamId } = req.body;

        if (!teamId) {
            res.status(400).json({ message: "Team selection is required. Please select a team to register." });
            return;
        }

        const existingRegistration = await Registration.findOne({
            $or: [
                { user: userId, tournament: tournamentId },
                { team: teamId, tournament: tournamentId }
            ]
        });

        if (existingRegistration) {
            res.status(400).json({ message: "Already registered for this tournament" });
            return;
        }

        // Create registration
        const registration = await Registration.create({
            user: userId,
            team: teamId,
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

// @desc    Get dashboard stats for organizers
// @route   GET /api/tournaments/organizer/stats
// @access  Private (Organizer/Admin)
export const getOrganizerStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const organizerId = (req as any).user?.id;
        
        // 1. Get tournaments owned by organizer
        const tournaments = await Tournament.find({ organizer: organizerId });
        const tournamentIds = tournaments.map(t => t._id);

        // 2. Aggregate earnings from completed payments
        const completedRegistrations = await Registration.find({
            tournament: { $in: tournamentIds },
            paymentStatus: "completed"
        }).populate("tournament", "registrationFee");

        const totalEarnings = completedRegistrations.reduce((sum, reg: any) => {
            return sum + (reg.tournament?.registrationFee || 0);
        }, 0);

        // 3. Aggregate pending revenue
        const pendingRegistrations = await Registration.find({
            tournament: { $in: tournamentIds },
            status: "confirmed",
            paymentStatus: { $ne: "completed" }
        }).populate("tournament", "registrationFee");

        const pendingRevenue = pendingRegistrations.reduce((sum, reg: any) => {
            return sum + (reg.tournament?.registrationFee || 0);
        }, 0);

        // 4. Monthly registration trends (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);

        const trends = await Registration.aggregate([
            {
                $match: {
                    tournament: { $in: tournamentIds },
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: "$createdAt" },
                        year: { $year: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // Format trends for the frontend
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const trendData = [];
        for (let i = 0; i < 6; i++) {
            const d = new Date();
            d.setMonth(d.getMonth() - (5 - i));
            const month = d.getMonth() + 1;
            const year = d.getFullYear();
            
            const match = trends.find(t => t._id.month === month && t._id.year === year);
            trendData.push({
                label: monthNames[month - 1],
                value: match ? match.count : 0
            });
        }

        res.json({
            totalEarnings,
            pendingRevenue,
            totalPlayers: await Registration.countDocuments({ tournament: { $in: tournamentIds }, status: "confirmed" }),
            totalTournaments: tournaments.length,
            trendData
        });
    } catch (error) {
        console.error("Error fetching organizer stats:", error);
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

        // Count confirmed registrations for each tournament
        const tournamentIds = tournaments.map(t => t._id);
        const registrationCounts = await Registration.aggregate([
            { $match: { tournament: { $in: tournamentIds }, status: "confirmed" } },
            { $group: { _id: "$tournament", count: { $sum: 1 } } }
        ]);

        const countMap: Record<string, number> = {};
        registrationCounts.forEach((r: any) => {
            countMap[r._id.toString()] = r.count;
        });

        const result = tournaments.map(t => {
            const obj = (t as any).toObject();
            return {
                ...obj,
                teamSize: obj.teamSize < 2 ? 5 : obj.teamSize, // Safety fallback for legacy data
                participantCount: countMap[t._id.toString()] ?? 0,
            };
        });

        res.json(result);
    } catch (error) {
        console.error("Error fetching organizer tournaments:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Get all player registrations across organizer's tournaments (per-registration rows)
// @route   GET /api/tournaments/organizer/players
// @access  Private (Organizer/Admin)
export const getOrganizerPlayers = async (req: Request, res: Response): Promise<void> => {
    try {
        const organizerId = (req as any).user?.id;
        if (!organizerId) {
            res.status(401).json({ message: "Not authorized" });
            return;
        }

        // Get all tournaments owned by this organizer
        const tournaments = await Tournament.find({ organizer: organizerId }).select("_id title");
        const tournamentIds = tournaments.map(t => t._id);
        const tournamentMap: Record<string, string> = {};
        tournaments.forEach((t: any) => { tournamentMap[t._id.toString()] = t.title; });

        if (tournamentIds.length === 0) {
            res.json([]);
            return;
        }

        // One row per registration — populate user and tournament info
        const registrations = await Registration.find({ tournament: { $in: tournamentIds } })
            .populate("user", "fullName email avatarUrl createdAt")
            .populate("tournament", "title")
            .populate("team", "name logoUrl")
            .sort({ createdAt: -1 });

        const result = registrations.map((r: any) => ({
            registrationId: r._id,
            tournamentId: r.tournament?._id,
            tournamentName: r.tournament?.title || "Unknown Tournament",
            status: r.status,
            paymentStatus: r.paymentStatus,
            createdAt: r.createdAt,
            teamName: r.team?.name,
            teamLogo: r.team?.logoUrl,
            user: {
                id: r.user?._id,
                fullName: r.user?.fullName || "Unknown",
                email: r.user?.email || "",
                avatarUrl: r.user?.avatarUrl,
                memberSince: r.user?.createdAt,
            },
        }));

        res.json(result);
    } catch (error) {
        console.error("Error fetching organizer players:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Accept or reject a registration
// @route   PATCH /api/tournaments/:id/registrations/:regId
// @access  Private (Organizer/Admin)
export const updateRegistrationStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id: tournamentId, regId } = req.params;
        const { status } = req.body; // "confirmed" | "rejected"
        const user = (req as any).user;

        if (!["confirmed", "rejected"].includes(status)) {
            res.status(400).json({ message: "Status must be 'confirmed' or 'rejected'" });
            return;
        }

        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) { res.status(404).json({ message: "Tournament not found" }); return; }

        if (user.role === "organizer" && tournament.organizer.toString() !== user.id) {
            res.status(403).json({ message: "Not authorized" }); return;
        }

        const registration = await Registration.findOneAndUpdate(
            { _id: regId, tournament: tournamentId },
            { status },
            { new: true }
        );

        if (!registration) { res.status(404).json({ message: "Registration not found" }); return; }

        // Trigger notification for the player
        const tournamentTitle = tournament.title;
        await createNotification({
            recipient: registration.user.toString(),
            type: "registration",
            message: `Your registration for ${tournamentTitle} has been ${status}.`,
            link: `/tournament/${tournamentId}`
        });

        res.json({ message: `Registration ${status}`, registration });
    } catch (error) {
        console.error("Error updating registration status:", error);
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
            teamSize,
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
            teamSize: teamSize || 1,
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

// @desc    Update a tournament
// @route   PUT /api/tournaments/:id
// @access  Private (Organizer/Admin)
export const updateTournament = async (req: Request, res: Response): Promise<void> => {
    try {
        const tournamentId = req.params.id;
        const user = (req as any).user;

        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
            res.status(404).json({ message: "Tournament not found" });
            return;
        }

        if (user.role === "organizer" && tournament.organizer.toString() !== user.id) {
            res.status(403).json({ message: "Not authorized to edit this tournament" });
            return;
        }

        console.log("Updating tournament ID:", tournamentId);
        console.log("Incoming body:", JSON.stringify(req.body, null, 2));

        const allowed = [
            "title", "description", "startDate", "endDate", "location",
            "registrationDeadline", "prizePool", "rules", "maxParticipants",
            "imageUrl", "status", "registrationFee", "game", "teamSize"
        ];

        allowed.forEach(field => {
            if (req.body[field] !== undefined) {
                let value = req.body[field];
                if (field === "teamSize") {
                   value = Number(value);
                   tournament.set("teamSize", value);
                   tournament.markModified("teamSize");
                   console.log(`Explicitly set teamSize to: ${value}`);
                } else {
                   (tournament as any).set(field, value);
                }
                console.log(`Updating field: ${field} =`, value);
            }
        });

        const updated = await tournament.save();
        console.log("Update success. DB state teamSize:", updated.teamSize);
        res.json(updated);
    } catch (error: any) {
        console.error("CRITICAL ERROR UPDATING TOURNAMENT:", error);
        res.status(500).json({ message: "Server error", details: error.message });
    }
};

// @desc    Get registrations for a specific tournament
// @route   GET /api/tournaments/:id/registrations
// @access  Private (Organizer/Admin)
export const getTournamentRegistrations = async (req: Request, res: Response): Promise<void> => {
    try {
        const tournamentId = req.params.id;
        const user = (req as any).user;

        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
            res.status(404).json({ message: "Tournament not found" });
            return;
        }

        if (user.role === "organizer" && tournament.organizer.toString() !== user.id) {
            res.status(403).json({ message: "Not authorized to view registrations for this tournament" });
            return;
        }

        const registrations = await Registration.find({ tournament: tournamentId })
            .populate("user", "fullName email avatarUrl")
            .populate("team", "name logoUrl")
            .sort({ createdAt: -1 });

        res.json(registrations);
    } catch (error) {
        console.error("Error fetching tournament registrations:", error);
        res.status(500).json({ message: "Server error" });
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

        const { teamId } = req.body;

        if (!teamId) {
            res.status(400).json({ message: "Team selection is required. Please select a team to register." });
            return;
        }

        const existingRegistration = await Registration.findOne({
            $or: [
                { user: userId, tournament: tournamentId },
                { team: teamId, tournament: tournamentId }
            ]
        });

        if (existingRegistration && existingRegistration.paymentStatus === "completed") {
            res.status(400).json({ message: "Already registered for this tournament" });
            return;
        }

        // Check if the tournament has no fee, we can just register them directly without eSewa
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
            existingRegistration.team = teamId;
            await existingRegistration.save();
        } else {
            await Registration.create({
                user: userId,
                team: teamId,
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

// @desc    Generate bracket for a tournament
// @route   POST /api/tournaments/:id/bracket/generate
// @access  Private (Organizer/Admin)
export const generateBracket = async (req: Request, res: Response): Promise<void> => {
    try {
        const tournamentId = req.params.id;
        const user = (req as any).user;

        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
            res.status(404).json({ message: "Tournament not found" });
            return;
        }

        if (user.role === "organizer" && tournament.organizer.toString() !== user.id) {
            res.status(403).json({ message: "Not authorized" });
            return;
        }

        // Fetch confirmed registrations
        const registrations = await Registration.find({ tournament: tournamentId, status: "confirmed" })
            .populate("user", "fullName")
            .populate("team", "name");
        
        if (registrations.length < 2) {
            res.status(400).json({ message: "At least 2 confirmed participants are required to generate a bracket" });
            return;
        }

        // Shuffle participants randomly
        const participants = registrations.map(r => ({
            id: r.team ? (r.team as any)._id?.toString() : ((r.user as any)._id?.toString() || (r.user as any).id),
            name: r.team ? (r.team as any).name : ((r.user as any).fullName || "Unknown Player")
        })).sort(() => 0.5 - Math.random());

        // Calculate nearest power of 2
        const n = participants.length;
        const powerOf2 = Math.pow(2, Math.ceil(Math.log2(n)));
        const byes = powerOf2 - n;
        const totalMatches = powerOf2 / 2;

        const roundOneSeeds: any[] = [];

        // Distribute byes
        let playerIndex = 0;
        let matchIdCounter = 1;

        for (let i = 0; i < totalMatches; i++) {
            const team1 = participants[playerIndex++];
            let team2 = null;

            if (i >= (totalMatches - byes) && playerIndex < participants.length) {
                 // Wait, logic for byes. 
                 // If byes = 2, we want 2 matches to have a bye.
            }
            if (!team2 && playerIndex < participants.length && i >= byes) {
                 team2 = participants[playerIndex++];
            }

            roundOneSeeds.push({
                id: matchIdCounter++,
                date: new Date().toDateString(),
                teams: [
                    { ...team1, score: "", status: null },
                    team2 ? { ...team2, score: "", status: null } : { name: "BYE", score: "", status: "L", isBye: true }
                ]
            });
        }

        const bracketData = [
            {
                title: 'Round 1',
                seeds: roundOneSeeds
            }
        ];

        // Generate Subsequent Empty Rounds
        let currentRoundMatches = totalMatches;
        let roundNum = 2;
        while (currentRoundMatches > 1) {
            currentRoundMatches = currentRoundMatches / 2;
            const roundSeeds: any[] = [];
            for (let i = 0; i < currentRoundMatches; i++) {
                roundSeeds.push({
                    id: matchIdCounter++,
                    date: new Date().toDateString(),
                    teams: [
                        { name: "TBD", score: "", status: null },
                        { name: "TBD", score: "", status: null }
                    ]
                });
            }
            bracketData.push({
                title: `Round ${roundNum}`,
                seeds: roundSeeds
            });
            roundNum++;
        }

        // Auto-advance byes from Round 1 to Round 2
        if (bracketData.length > 1) {
            bracketData[0].seeds.forEach((seed: any, index: number) => {
                if (seed.teams[1]?.isBye) {
                    seed.teams[0].status = "W";
                    const nextMatchIndex = Math.floor(index / 2);
                    const teamPositionIndex = index % 2;
                    bracketData[1].seeds[nextMatchIndex].teams[teamPositionIndex] = {
                        name: seed.teams[0].name,
                        score: "",
                        status: null
                    };
                }
            });
        }

        tournament.bracketData = bracketData;
        await tournament.save();

        res.json({ message: "Bracket generated successfully", bracketData });
    } catch (error) {
        console.error("Error generating bracket:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Update tournament bracket data
// @route   PUT /api/tournaments/:id/bracket
// @access  Private (Organizer/Admin)
export const updateBracket = async (req: Request, res: Response): Promise<void> => {
    try {
        const tournamentId = req.params.id;
        const user = (req as any).user;
        const { bracketData } = req.body;

        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
            res.status(404).json({ message: "Tournament not found" });
            return;
        }

        if (user.role === "organizer" && tournament.organizer.toString() !== user.id) {
            res.status(403).json({ message: "Not authorized" });
            return;
        }

        tournament.bracketData = bracketData;
        await tournament.save();

        res.json({ message: "Bracket updated successfully", bracketData });
    } catch (error) {
        console.error("Error updating bracket:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Check whether the logged in user is registered for the given tournament
// @route   GET /api/tournaments/:id/registration-status
// @access  Private
export const checkRegistrationStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const tournamentId = req.params.id;
        const userId = (req as any).user.id || (req as any).user._id;

        // Find user's teams
        const userTeams = await Team.find({ members: userId });
        const teamIds = userTeams.map(t => t._id);

        const registration = await Registration.findOne({
            tournament: tournamentId,
            $or: [
                { user: userId },
                { team: { $in: teamIds } }
            ]
        });

        if (registration) {
            res.json({ 
                isRegistered: true, 
                paymentStatus: registration.paymentStatus, 
                status: registration.status,
                teamName: (registration as any).team?.name // Note: might need populating if user wants it
            });
        } else {
            res.json({ isRegistered: false, paymentStatus: null, status: null });
        }
    } catch (error) {
        console.error("Error checking registration status:", error);
        res.status(500).json({ message: "Server error" });
    }
};
