import { Request, Response } from "express";
import Team from "../models/Team";
import TeamJoinRequest from "../models/TeamJoinRequest";
import User from "../models/User";
import { createNotification } from "./notification.controller";

// Registers a new esports team in the system
export const createTeam = async (req: Request, res: Response) => {
    try {
        const { name, bio, logoUrl } = req.body;
        const userId = (req as any).user.id;

        const existingTeam = await Team.findOne({ name });
        if (existingTeam) {
            return res.status(400).json({ message: "Team name already taken" });
        }

        const team = await Team.create({
            name,
            bio,
            logoUrl,
            captain: userId,
            members: [userId]
        });

        res.status(201).json(team);
    } catch (error) {
        console.error("Error creating team:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Returns a paginated list of all active teams
export const getTeams = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search as string;

        let query: any = {};
        if (search && search.trim() !== "") {
            query.name = { $regex: search.trim(), $options: "i" };
        }

        const totalTeams = await Team.countDocuments(query);
        const teams = await Team.find(query)
            .populate("captain", "fullName avatarUrl")
            .populate("members", "fullName avatarUrl")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            teams,
            totalTeams,
            totalPages: Math.ceil(totalTeams / limit),
            currentPage: page
        });
    } catch (error) {
        console.error("Error fetching teams:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Returns detailed information about a specific team
export const getTeamById = async (req: Request, res: Response) => {
    try {
        const team = await Team.findById(req.params.id)
            .populate("captain", "fullName avatarUrl bio")
            .populate("members", "fullName avatarUrl bio");

        if (!team) {
            return res.status(404).json({ message: "Team not found" });
        }

        res.json(team);
    } catch (error) {
        console.error("Error fetching team:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Handles a player's request to join a team
export const requestToJoinTeam = async (req: Request, res: Response) => {
    try {
        const teamId = req.params.id;
        const userId = (req as any).user.id;
        const { message } = req.body;

        const team = await Team.findById(teamId);
        if (!team) return res.status(404).json({ message: "Team not found" });

        if (team.members.includes(userId)) {
            return res.status(400).json({ message: "You are already a member of this team" });
        }

        const existingRequest = await TeamJoinRequest.findOne({ team: teamId, user: userId, status: "pending" });
        if (existingRequest) {
            return res.status(400).json({ message: "Join request already pending" });
        }

        const joinRequest = await TeamJoinRequest.create({
            team: teamId,
            user: userId,
            message
        });

        // Notify captain
        await createNotification({
            recipient: team.captain.toString(),
            type: "team_request",
            message: `New join request for team ${team.name}`,
            link: `/teams/${teamId}`
        });

        res.status(201).json(joinRequest);
    } catch (error) {
        console.error("Error requesting to join team:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Captain reviews and responds to join requests
export const handleJoinRequest = async (req: Request, res: Response) => {
    try {
        const { id: teamId, requestId } = req.params;
        const { status } = req.body; // 'accepted' or 'rejected'
        const userId = (req as any).user.id;

        const team = await Team.findById(teamId);
        if (!team) return res.status(404).json({ message: "Team not found" });

        if (team.captain.toString() !== userId) {
            return res.status(403).json({ message: "Only the captain can handle join requests" });
        }

        const joinRequest = await TeamJoinRequest.findById(requestId);
        if (!joinRequest) return res.status(404).json({ message: "Request not found" });

        joinRequest.status = status;
        await joinRequest.save();

        if (status === "accepted") {
            if (!team.members.includes(joinRequest.user)) {
                team.members.push(joinRequest.user);
                await team.save();
            }
        }

        // Notify user
        await createNotification({
            recipient: joinRequest.user.toString(),
            type: "team_response",
            message: `Your request to join ${team.name} was ${status}`,
            link: `/teams/${teamId}`
        });

        res.json({ message: `Request ${status}`, team });
    } catch (error) {
        console.error("Error handling join request:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Returns all pending join requests for a team
export const getTeamRequests = async (req: Request, res: Response) => {
    try {
        const teamId = req.params.id;
        const userId = (req as any).user.id;

        const team = await Team.findById(teamId);
        if (!team) return res.status(404).json({ message: "Team not found" });

        if (team.captain.toString() !== userId) {
            return res.status(403).json({ message: "Only the captain can view requests" });
        }

        const requests = await TeamJoinRequest.find({ team: teamId, status: "pending" })
            .populate("user", "fullName avatarUrl email");

        res.json(requests);
    } catch (error) {
        console.error("Error fetching team requests:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Updates team metadata (name, bio, logo)
export const updateTeam = async (req: Request, res: Response) => {
    try {
        const teamId = req.params.id;
        const userId = (req as any).user.id;
        const { name, bio, logoUrl } = req.body;

        const team = await Team.findById(teamId);
        if (!team) return res.status(404).json({ message: "Team not found" });

        if (team.captain.toString() !== userId) {
            return res.status(403).json({ message: "Only the captain can update team details" });
        }

        if (name && name !== team.name) {
            const existingTeam = await Team.findOne({ name });
            if (existingTeam) return res.status(400).json({ message: "Team name already taken" });
            team.name = name;
        }

        if (bio !== undefined) team.bio = bio;
        if (logoUrl !== undefined) team.logoUrl = logoUrl;

        await team.save();
        res.json(team);
    } catch (error) {
        console.error("Error updating team:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Handles team logo image uploads
export const uploadTeamLogo = async (req: Request, res: Response) => {
    try {
        const teamId = req.params.id;
        const userId = (req as any).user.id;

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const team = await Team.findById(teamId);
        if (!team) return res.status(404).json({ message: "Team not found" });

        if (team.captain.toString() !== userId) {
            return res.status(403).json({ message: "Only the captain can upload team logo" });
        }

        team.logoUrl = `/uploads/profiles/${req.file.filename}`;
        await team.save();

        res.json({ message: "Logo uploaded successfully", logoUrl: team.logoUrl });
    } catch (error) {
        console.error("Error uploading team logo:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Captain removes a member from the team
export const kickMember = async (req: Request, res: Response) => {
    try {
        const { id: teamId, userId: targetUserId } = req.params;
        const userId = (req as any).user.id;

        const team = await Team.findById(teamId);
        if (!team) return res.status(404).json({ message: "Team not found" });

        if (team.captain.toString() !== userId) {
            return res.status(403).json({ message: "Only the captain can kick members" });
        }

        if (team.captain.toString() === targetUserId) {
            return res.status(400).json({ message: "Captain cannot kick themselves. Use delete/transfer instead." });
        }

        team.members = team.members.filter(m => m.toString() !== targetUserId);
        await team.save();

        // Notify kicked user
        await createNotification({
            recipient: targetUserId,
            type: "team_kicked",
            message: `You have been removed from team ${team.name}`,
            link: "/player/community"
        });

        res.json({ message: "Member kicked successfully", team });
    } catch (error) {
        console.error("Error kicking member:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Transfers team ownership to another member
export const transferCaptainship = async (req: Request, res: Response) => {
    try {
        const teamId = req.params.id;
        const userId = (req as any).user.id;
        const { newCaptainId } = req.body;

        const team = await Team.findById(teamId);
        if (!team) return res.status(404).json({ message: "Team not found" });

        if (team.captain.toString() !== userId) {
            return res.status(403).json({ message: "Only the captain can transfer captainship" });
        }

        if (!team.members.find(m => m.toString() === newCaptainId)) {
            return res.status(400).json({ message: "New captain must be a member of the team" });
        }

        team.captain = newCaptainId as any;
        await team.save();

        // Notify new captain
        await createNotification({
            recipient: newCaptainId,
            type: "team_captain_promoted",
            message: `You have been promoted to Captain of ${team.name}`,
            link: `/player/team/${teamId}`
        });

        res.json({ message: "Captainship transferred successfully", team });
    } catch (error) {
        console.error("Error transferring captainship:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Allows a member to exit their current team
export const leaveTeam = async (req: Request, res: Response) => {
    try {
        const teamId = req.params.id;
        const userId = (req as any).user.id;

        const team = await Team.findById(teamId);
        if (!team) return res.status(404).json({ message: "Team not found" });

        if (team.captain.toString() === userId) {
            return res.status(400).json({ message: "Captain cannot leave the team. Transfer captainship first." });
        }

        if (!team.members.find(m => m.toString() === userId)) {
            return res.status(400).json({ message: "You are not a member of this team" });
        }

        team.members = team.members.filter(m => m.toString() !== userId);
        await team.save();

        // Notify captain
        await createNotification({
            recipient: team.captain.toString(),
            type: "team_member_left",
            message: `A member has left your team ${team.name}`,
            link: `/player/team/${teamId}`
        });

        res.json({ message: "Left team successfully" });
    } catch (error) {
        console.error("Error leaving team:", error);
        res.status(500).json({ message: "Server error" });
    }
};
// Returns all teams where the current user is the captain
export const getMyTeams = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const teams = await Team.find({ captain: userId })
            .populate("captain", "fullName avatarUrl")
            .populate("members", "fullName avatarUrl");
        res.json(teams);
    } catch (error) {
        console.error("Error fetching my teams:", error);
        res.status(500).json({ message: "Server error" });
    }
};
// Returns all teams where the current user is a member (including captain)
export const getJoinedTeams = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const teams = await Team.find({ members: userId })
            .populate("captain", "fullName avatarUrl")
            .populate("members", "fullName avatarUrl")
            .sort({ createdAt: -1 });
        res.json(teams);
    } catch (error) {
        console.error("Error fetching joined teams:", error);
        res.status(500).json({ message: "Server error" });
    }
};
