import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import authRoutes from "./routes/auth.routes";
import gameRoutes from "./routes/game.routes";
import tournamentRoutes from "./routes/tournament.routes";
import newsRoutes from "./routes/news.routes";
import userRoutes from "./routes/user.routes";
import notificationRoutes from "./routes/notification.routes";
import adminRoutes from "./routes/admin.routes";
import announcementRoutes from "./routes/announcement.routes";
import teamRoutes from "./routes/team.routes";
import contactRoutes from "./routes/contact.routes";
import Setting from "./models/Setting";
import path from "path";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || ["http://localhost:5173", "http://localhost:5174"],
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
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/contact", contactRoutes);

// Serve static files from the uploads directory
const __dirname_resolved = path.resolve();
app.use("/uploads", express.static(path.join(__dirname_resolved, "uploads")));

app.get("/api/system/status", async (req, res) => {
  try {
    const setting = await Setting.findOne();
    res.json({ maintenanceMode: setting?.maintenanceMode || false });
  } catch (err) {
    res.json({ maintenanceMode: false });
  }
});

app.get("/", (req, res) => res.send("API running..."));

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Global Error Handler:", err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    message: err.message || "Internal Server Error",
    details: err.details || null,
    errors: err.errors || null,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
