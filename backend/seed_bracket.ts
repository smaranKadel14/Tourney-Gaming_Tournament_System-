import mongoose from "mongoose";
import User from "./src/models/User";
import Tournament from "./src/models/Tournament";
import Registration from "./src/models/Registration";
import * as dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log("Connected to MongoDB.");

        // Find or create an organizer
        let organizer = await User.findOne({ role: "organizer" });
        if (!organizer) {
            organizer = await User.create({
                fullName: "Test Organizer",
                email: "organizer@test.com",
                password: "password123",
                role: "organizer"
            });
            console.log("Created dummy organizer.");
        }

        // Create 20 dummy players
        const users = [];
        for (let i = 1; i <= 20; i++) {
            const num = Math.floor(Math.random() * 10000);
            users.push({
                fullName: `Dummy Player ${i}`,
                email: `dummy${i}_${num}@test.com`,
                password: "password123",
                role: "player"
            });
        }

        const createdUsers = await User.insertMany(users);
        console.log("Created 20 dummy players.");

        // Find or create a tournament
        let tournament = await Tournament.findOne({ status: "ongoing", organizer: organizer._id });
        if (!tournament) {
            tournament = await Tournament.findOne({ status: "upcoming", organizer: organizer._id });
        }

        if (!tournament) {
            const game = await mongoose.model("Game").findOne();
            let gameId = game?._id;
            if (!gameId) {
                // assume some objectId for game
                gameId = new mongoose.Types.ObjectId();
            }
            tournament = await Tournament.create({
                title: "Dummy Bracket Tournament",
                game: gameId,
                organizer: organizer._id,
                description: "Testing bracket generation",
                startDate: new Date(),
                registrationDeadline: new Date(Date.now() + 86400000),
                location: "Online",
                imageUrl: "dummy.png",
                status: "upcoming"
            });
            console.log("Created dummy tournament.");
        }

        // Register the 20 users
        const registrations = createdUsers.map(user => ({
            user: user._id,
            tournament: tournament!._id,
            status: "confirmed",
            paymentStatus: "completed"
        }));

        await Registration.insertMany(registrations);
        console.log(`Successfully registered 20 players to tournament: ${tournament.title} (ID: ${tournament._id})`);

        console.log(`\nOrganizer Email: ${organizer.email} | Password: password123 (if newly created, else your own)`);

        process.exit(0);
    } catch (error) {
        console.error("Seeding error:", error);
        process.exit(1);
    }
}

seed();
