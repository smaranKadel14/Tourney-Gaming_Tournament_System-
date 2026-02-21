import { Request, Response } from "express";
import Game from "../models/Game";

// @desc    Get all games
// @route   GET /api/games
// @access  Public
export const getGames = async (req: Request, res: Response) => {
    try {
        const isFeatured = req.query.featured === "true";

        let query = {};
        if (isFeatured) {
            query = { isFeatured: true };
        }

        const games = await Game.find(query).sort({ releaseDate: -1 });
        res.json(games);
    } catch (error) {
        console.error("Error fetching games:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Get single game by ID
// @route   GET /api/games/:id
// @access  Public
export const getGameById = async (req: Request, res: Response): Promise<void> => {
    try {
        const game = await Game.findById(req.params.id);

        if (!game) {
            res.status(404).json({ message: "Game not found" });
            return;
        }

        res.json(game);
    } catch (error) {
        console.error("Error fetching game:", error);
        res.status(500).json({ message: "Server error" });
    }
};
