import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User";
import Team from "../models/Team";
import path from "path";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/tourney";

async function fixPaths() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGO_URI);
        console.log("Connected successfully.");

        // Fix Users
        const users = await User.find({ avatarUrl: { $regex: /^\/uploads\/avatar-/ } });
        console.log(`Found ${users.length} users with potentially broken avatar paths.`);
        
        let userCount = 0;
        for (const user of users) {
            if (user.avatarUrl && !user.avatarUrl.includes("/profiles/")) {
                user.avatarUrl = user.avatarUrl.replace("/uploads/", "/uploads/profiles/");
                await user.save();
                userCount++;
            }
        }
        console.log(`Updated ${userCount} users.`);

        // Fix Teams
        const teams = await Team.find({ logoUrl: { $regex: /^\/uploads\/avatar-/ } });
        console.log(`Found ${teams.length} teams with potentially broken logo paths.`);

        let teamCount = 0;
        for (const team of teams) {
            if (team.logoUrl && !team.logoUrl.includes("/profiles/")) {
                team.logoUrl = team.logoUrl.replace("/uploads/", "/uploads/profiles/");
                await team.save();
                teamCount++;
            }
        }
        console.log(`Updated ${teamCount} teams.`);

        console.log("Migration completed successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

fixPaths();
