import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./src/config/db";
import User from "./src/models/User";
import Team from "./src/models/Team";
import Tournament from "./src/models/Tournament";
import Registration from "./src/models/Registration";
import bcrypt from "bcryptjs";

dotenv.config();

const seedDummyTeams = async () => {
    try {
        await connectDB();
        console.log("Connected to database...");

        // 1. Find ValUp Tournament
        const tournament = await Tournament.findOne({ title: { $regex: /ValUp/i } });
        if (!tournament) {
            console.error("Tournament 'ValUp' not found!");
            process.exit(1);
        }
        console.log(`Found tournament: ${tournament.title} (${tournament._id})`);

        const teamNames = [
            "Shadow Strikers",
            "Cyber Knights",
            "Radiant Renegades",
            "Frost Walkers",
            "Phantom Legion",
            "Neon Ninjas"
        ];

        const hashedPassword = await bcrypt.hash("password123", 10);

        for (const name of teamNames) {
            // Check if team already exists to avoid unique constraint error
            let team = await Team.findOne({ name });
            let captain;

            if (!team) {
                // Create a captain for this team
                const email = `${name.toLowerCase().replace(/\s+/g, '')}@test.com`;
                captain = await User.findOne({ email });
                
                if (!captain) {
                    captain = await User.create({
                        fullName: `${name} Captain`,
                        email,
                        password: hashedPassword,
                        role: "player"
                    });
                }

                // Create the team
                team = await Team.create({
                    name,
                    captain: captain._id,
                    members: [captain._id]
                });
                console.log(`Created team: ${name}`);
            } else {
                captain = await User.findById(team.captain);
                console.log(`Team ${name} already exists, skipping creation.`);
            }

            // 2. Create Registration
            const existingReg = await Registration.findOne({ 
                tournament: tournament._id, 
                team: team._id 
            });

            if (!existingReg) {
                await Registration.create({
                    user: captain!._id,
                    team: team._id,
                    tournament: tournament._id,
                    status: "confirmed",
                    paymentStatus: "completed",
                    paymentMethod: "seed",
                    registeredAt: new Date()
                });
                console.log(`Registered ${name} to ${tournament.title}`);
            } else {
                console.log(`Team ${name} is already registered.`);
            }
        }

        console.log("Seeding completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding dummy teams:", error);
        process.exit(1);
    }
};

seedDummyTeams();
