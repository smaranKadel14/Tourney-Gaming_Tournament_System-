import { Request, Response } from "express";
import News from "../models/News";

// @desc    Get all news articles
// @route   GET /api/news
// @access  Public
export const getNews = async (req: Request, res: Response) => {
    try {
        const limitParam = req.query.limit ? parseInt(req.query.limit as string) : 0;

        let query = News.find().sort({ publishedAt: -1 });
        if (limitParam > 0) {
            query = query.limit(limitParam);
        }

        const news = await query.exec();
        res.json(news);
    } catch (error) {
        console.error("Error fetching news:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// @desc    Get single news article by ID
// @route   GET /api/news/:id
// @access  Public
export const getNewsById = async (req: Request, res: Response): Promise<void> => {
    try {
        const newsItem = await News.findById(req.params.id);

        if (!newsItem) {
            res.status(404).json({ message: "News article not found" });
            return;
        }

        res.json(newsItem);
    } catch (error) {
        console.error("Error fetching news article:", error);
        res.status(500).json({ message: "Server error" });
    }
};
