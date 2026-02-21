import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./config/db";
import Game from "./models/Game";
import Tournament from "./models/Tournament";
import News from "./models/News";
import Registration from "./models/Registration";

dotenv.config();

const seedData = async () => {
    try {
        await connectDB();

        console.log("Clearing existing data...");
        await Game.deleteMany();
        await Tournament.deleteMany();
        await News.deleteMany();
        await Registration.deleteMany();

        console.log("Seeding Games...");
        const addedGames = await Game.insertMany([
            {
                title: "Call of Duty: Warzone",
                description: "Free-to-play battle royale video game.",
                imageUrl: "https://via.placeholder.com/600x400/333/fff?text=Call+Of+Duty",
                releaseDate: new Date("2020-03-10"),
                developer: "Infinity Ward",
                genre: ["Battle Royale", "First-person shooter"],
                isFeatured: true,
            },
            {
                title: "Valorant",
                description: "Free-to-play first-person hero shooter developed by Riot Games.",
                imageUrl: "https://via.placeholder.com/600x400/900/fff?text=Valorant",
                releaseDate: new Date("2020-06-02"),
                developer: "Riot Games",
                genre: ["Hero shooter", "Tactical shooter"],
                isFeatured: false,
            },
        ]);

        console.log("Seeding Tournaments...");
        await Tournament.insertMany([
            {
                title: "Summer Championship 2026",
                game: addedGames[0]._id,
                description: "The biggest Warzone tournament of the season.",
                startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
                location: "Online",
                registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                prizePool: "$10,000",
                rules: "Standard battle royale rules apply.",
                maxParticipants: 100,
                imageUrl: "https://via.placeholder.com/800x400/111/fff?text=Warzone+Tourney",
                status: "upcoming",
            },
            {
                title: "Valorant Radiant Series",
                game: addedGames[1]._id,
                description: "Weekly Valorant cash cup.",
                startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
                location: "Online",
                registrationDeadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
                prizePool: "$1,000",
                rules: "Single elimination bracket.",
                maxParticipants: 32,
                imageUrl: "https://via.placeholder.com/800x400/512/fff?text=Valorant+Cup",
                status: "upcoming",
            },
        ]);

        console.log("Seeding News...");
        await News.insertMany([
            {
                title: "New Season Update Released",
                excerpt: "The latest patch notes are here...",
                content: "Detailed patch notes goes here. Lots of balance changes and new maps.",
                imageUrl: "https://via.placeholder.com/400x300/222/a33?text=News+1",
                author: "Admin",
                publishedAt: new Date(),
                tags: ["Update", "Patch Notes"],
            },
            {
                title: "Winners of Last Week's Tourney",
                excerpt: "Congratulations to team XYZ for taking home the gold.",
                content: "Team XYZ dominated the finals with a stunning 3-0 victory.",
                imageUrl: "https://via.placeholder.com/400x300/222/3a3?text=News+2",
                author: "Admin",
                publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
                tags: ["Esports", "Results"],
            },
        ]);

        console.log("Seed data created successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding data:", error);
        process.exit(1);
    }
};

seedData();
