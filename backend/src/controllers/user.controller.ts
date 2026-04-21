import { Request, Response } from "express";
import User from "../models/User";
import Registration from "../models/Registration";
import Team from "../models/Team";

export const getProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id || (req as any).user._id;
        
        // Parallelize initial queries
        const [user, userTeams] = await Promise.all([
            User.findById(userId).select("-password"),
            Team.find({ members: userId })
        ]);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const teamIds = userTeams.map(t => t._id);

        const registrations = await Registration.find({ 
            $or: [
                { user: userId },
                { team: { $in: teamIds } }
            ],
            status: { $in: ["pending", "confirmed", "completed"] } 
        }).populate({
            path: 'tournament',
            populate: { path: 'game' }
        }).populate('team', 'name logoUrl')
        .sort({ createdAt: -1 });

        // Safely map history, checking if tournament exists
        const history = registrations.map(r => {
            if (!r.tournament) return null;
            return {
                ...(r.tournament as any).toObject(),
                registeredAs: r.team ? (r.team as any).name : "Solo"
            };
        }).filter(Boolean);

        res.json({
            ...user.toObject(),
            teams: userTeams,
            history,
            stats: {
                totalTournaments: history.length,
                memberSince: (user as any).createdAt
            }
        });
    } catch (error) {
        console.error("Get Profile Error:", error);
        res.status(500).json({ message: "Server Error", error });
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const { fullName, bio, avatarUrl } = req.body;
        const userId = (req as any).user.id || (req as any).user._id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (fullName) user.fullName = fullName;
        if (bio !== undefined) user.bio = bio; // Allow empty string
        if (avatarUrl !== undefined) user.avatarUrl = avatarUrl; // Allow empty string to remove avatar

        const updatedUser = await user.save();

        // Return without password
        const userResponse = updatedUser.toObject() as any;
        delete userResponse.password;

        res.json(userResponse);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

export const uploadAvatar = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const userId = (req as any).user.id || (req as any).user._id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Create the public URL for the newly uploaded file
        // Example: /uploads/profiles/avatar-123456.jpg
        const avatarUrl = `/uploads/profiles/${req.file.filename}`;

        user.avatarUrl = avatarUrl;
        await user.save();

        res.json({ message: "Avatar uploaded successfully", avatarUrl });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

// Helper to escape regex special characters for safe search
const escapeRegex = (text: string) => {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

export const searchUsers = async (req: Request, res: Response) => {
    try {
        const { q } = req.query;
        let query: any = { role: { $ne: "admin" } }; // Keep admin accounts private
        
        if (q && typeof q === 'string' && q.trim() !== '') {
            const searchTerm = q.trim();
            // Safeguard: Limit length to 50 characters to prevent ReDoS/Performance issues
            if (searchTerm.length > 50) {
                return res.status(400).json({ message: "Search query too long. Max 50 characters." });
            }
            
            // Safeguard: Escape regex characters to prevent malicious regex injection
            const safeSearch = escapeRegex(searchTerm);
            query.fullName = { $regex: safeSearch, $options: "i" };
        }

        const users = await User.find(query)
            .select("_id fullName role avatarUrl bio")
            .limit(50)
            .sort({ createdAt: -1 });
            
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

export const getPublicProfile = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Parallelize initial queries
        const [user, userTeams] = await Promise.all([
            User.findById(id).select("_id fullName role avatarUrl bio createdAt"),
            Team.find({ members: id }).select("name logoUrl")
        ]);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const teamIds = userTeams.map(t => t._id);

        // Fetch user's registered/played tournaments
        const registrations = await Registration.find({ 
            $or: [
                { user: id },
                { team: { $in: teamIds } }
            ],
            status: { $in: ["pending", "confirmed", "completed"] } 
        })
        .populate({
            path: "tournament",
            select: "title game startDate status imageUrl",
            populate: { path: "game", select: "title imageUrl" }
        })
        .populate("team", "name")
        .sort({ createdAt: -1 });

        // Filter out null tournaments and map display info safely
        const history = registrations.map((r: any) => {
            if (!r.tournament) return null;
            return {
                ...(r.tournament as any).toObject(),
                registeredAs: r.team ? r.team.name : "Solo"
            };
        }).filter(Boolean);

        const stats = {
            totalTournaments: history.length,
            memberSince: (user as any).createdAt
        };

        res.json({
            user,
            teams: userTeams,
            stats,
            history
        });
    } catch (error) {
        console.error("Get Public Profile Error:", error);
        res.status(500).json({ message: "Server Error", error });
    }
};
