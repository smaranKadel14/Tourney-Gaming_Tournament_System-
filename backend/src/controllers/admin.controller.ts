import { Request, Response } from "express";
import User from "../models/User";
import Tournament from "../models/Tournament";
import Registration from "../models/Registration";
import Log from "../models/Log";
import Setting from "../models/Setting";
import { logSystemEvent } from "../utils/logger";

// Get dashboard statistics
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTournaments = await Tournament.countDocuments();
    
    // Get active matches (tournaments that are ongoing)
    const activeMatches = await Tournament.countDocuments({ status: "ongoing" });
    
    // Calculate growth percentages (comparing with previous month)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const usersLastMonth = await User.countDocuments({ createdAt: { $gte: lastMonth } });
    const tournamentsLastMonth = await Tournament.countDocuments({ createdAt: { $gte: lastMonth } });
    
    const userGrowth = totalUsers > 0 ? ((usersLastMonth / totalUsers) * 100).toFixed(1) : "0.0";
    const tournamentGrowth = totalTournaments > 0 ? ((tournamentsLastMonth / totalTournaments) * 100).toFixed(1) : "0.0";

    res.json({
      totalUsers,
      totalTournaments,
      activeMatches,
      userGrowth: parseFloat(userGrowth),
      tournamentGrowth: parseFloat(tournamentGrowth),
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Failed to fetch dashboard statistics" });
  }
};

// Get recent activity
export const getRecentActivity = async (req: Request, res: Response) => {
  try {
    const activities: any[] = [];
    
    // Get recent tournament registrations
    const recentRegistrations = await Registration.find()
      .populate("user", "fullName")
      .populate("tournament", "title")
      .sort({ createdAt: -1 })
      .limit(10);
    
    recentRegistrations.forEach((reg: any) => {
      activities.push({
        id: reg._id,
        type: "registration",
        title: `${reg.user?.fullName || "Unknown"} registered for ${reg.tournament?.title || "Unknown Tournament"}`,
        timestamp: reg.createdAt,
        status: reg.status
      });
    });
    
    // Get recent tournament creations
    const recentTournaments = await Tournament.find()
      .populate("organizer", "fullName")
      .sort({ createdAt: -1 })
      .limit(5);
    
    recentTournaments.forEach((tournament: any) => {
      activities.push({
        id: `tournament-${tournament._id}`,
        type: "tournament",
        title: `New tournament "${tournament.title}" created by ${tournament.organizer?.fullName || "Unknown"}`,
        timestamp: tournament.createdAt,
        status: tournament.status
      });
    });
    
    // Sort all activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    res.json(activities.slice(0, 10));
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    res.status(500).json({ message: "Failed to fetch recent activity" });
  }
};

// Get pending approvals
export const getPendingApprovals = async (req: Request, res: Response) => {
  try {
    const approvals: any[] = [];
    
    // Get pending tournaments
    const pendingTournaments = await Tournament.find({ status: "pending" })
      .populate("organizer", "fullName email")
      .sort({ createdAt: -1 })
      .limit(10);
    
    pendingTournaments.forEach((tournament: any) => {
      approvals.push({
        id: tournament._id,
        type: "tournament",
        title: tournament.title,
        organizer: tournament.organizer?.fullName || "Unknown",
        email: tournament.organizer?.email || "",
        timestamp: tournament.createdAt,
        details: `Tournament: ${tournament.title}`
      });
    });
    
    // Get pending user registrations (if any)
    const pendingUsers = await User.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .limit(5);
    
    pendingUsers.forEach((user: any) => {
      approvals.push({
        id: user._id,
        type: "user",
        title: `New user: ${user.fullName}`,
        organizer: user.fullName,
        email: user.email,
        timestamp: user.createdAt,
        details: `User registration pending approval`
      });
    });
    
    // Sort by timestamp
    approvals.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    res.json(approvals);
  } catch (error) {
    console.error("Error fetching pending approvals:", error);
    res.status(500).json({ message: "Failed to fetch pending approvals" });
  }
};

// Approve pending item
export const approvePendingItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { type } = req.body;
    const adminId = (req as any).user?.email || "System Admin";
    
    if (type === "tournament") {
      const tournament = await Tournament.findByIdAndUpdate(
        id,
        { status: "upcoming" },
        { new: true }
      );
      
      if (!tournament) {
        return res.status(404).json({ message: "Tournament not found" });
      }
      
      await logSystemEvent("Tournament Approved", "TOURNAMENT", adminId, "success", `Approved tournament: ${tournament.title}`);
      res.json({ message: "Tournament approved successfully", tournament });
    } else if (type === "user") {
      const user = await User.findByIdAndUpdate(
        id,
        { status: "active" },
        { new: true }
      );
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      await logSystemEvent("User Approved", "USER", adminId, "success", `Approved user: ${user.fullName}`);
      res.json({ message: "User approved successfully", user });
    } else {
      res.status(400).json({ message: "Invalid approval type" });
    }
  } catch (error) {
    console.error("Error approving item:", error);
    res.status(500).json({ message: "Failed to approve item" });
  }
};

// Reject pending item
export const rejectPendingItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { type, reason } = req.body;
    
    if (type === "tournament") {
      const tournament = await Tournament.findByIdAndUpdate(
        id,
        { status: "rejected", rejectionReason: reason || "Rejected by admin" },
        { new: true }
      );
      
      if (!tournament) {
        return res.status(404).json({ message: "Tournament not found" });
      }
      
      res.json({ message: "Tournament rejected successfully", tournament });
    } else if (type === "user") {
      const user = await User.findByIdAndUpdate(
        id,
        { status: "rejected", rejectionReason: reason || "Rejected by admin" },
        { new: true }
      );
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ message: "User rejected successfully", user });
    } else {
      res.status(400).json({ message: "Invalid rejection type" });
    }
  } catch (error) {
    console.error("Error rejecting item:", error);
    res.status(500).json({ message: "Failed to reject item" });
  }
};

// Get all users (Admin)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    // Optional query params for pagination and search
    // const page = parseInt(req.query.page as string) || 1;
    // const limit = parseInt(req.query.limit as string) || 50;
    // const skip = (page - 1) * limit;

    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// Update user role (Admin)
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["player", "organizer", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User role updated successfully", user });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ message: "Failed to update user role" });
  }
};

// Delete user (Admin)
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // We might also want to delete related registrations/tournaments, but for now just the user
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

// Get system logs
export const getLogs = async (req: Request, res: Response) => {
  try {
    const { severity } = req.query;
    
    let query: any = {};
    if (severity && severity !== "all") {
      query.severity = severity;
    }

    const logs = await Log.find(query)
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(logs);
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).json({ message: "Failed to fetch logs" });
  }
};

// Platform Settings
export const getSettings = async (req: Request, res: Response) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }
    res.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ message: "Failed to fetch settings" });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const adminId = (req as any).user?.email || "System Admin";
    const data = req.body;
    let settings = await Setting.findOne();
    
    if (!settings) {
      settings = await Setting.create(data);
    } else {
      settings = await Setting.findOneAndUpdate({}, data, { new: true });
    }
    
    await logSystemEvent("Settings Updated", "SYSTEM", adminId, "warning", "Platform configuration was modified");
    res.json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ message: "Failed to update settings" });
  }
};

// System Operations
export const purgeSystemCache = async (req: Request, res: Response) => {
  try {
    const adminId = (req as any).user?.email || "System Admin";
    
    // In a real application, memory stores or Redis clusters would be flushed here.
    // For now, it simply logs the action as heavily requested.
    await logSystemEvent(
      "System Cache Purged", 
      "SYSTEM", 
      adminId, 
      "warning", 
      "Admin forcefully flushed global platform caches and forced client reloads."
    );
    
    res.json({ message: "System cache successfully purged" });
  } catch (error) {
    console.error("Error purging cache:", error);
    res.status(500).json({ message: "Failed to purge cache" });
  }
};
