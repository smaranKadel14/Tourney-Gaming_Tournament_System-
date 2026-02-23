import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import authRoutes from "./routes/auth.routes";
import gameRoutes from "./routes/game.routes";
import tournamentRoutes from "./routes/tournament.routes";
import newsRoutes from "./routes/news.routes";
import userRoutes from "./routes/user.routes";
import path from "path";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/tournaments", tournamentRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/users", userRoutes);

// Serve static files from the uploads directory
const __dirname_resolved = path.resolve();
app.use("/uploads", express.static(path.join(__dirname_resolved, "../uploads")));

app.get("/", (req, res) => res.send("API running..."));

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
