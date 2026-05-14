import { Request, Response } from "express";
import News from "../models/News";

// Returns all published news articles
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

// Returns a single news article by ID
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

// Creates a new news article (Admin only)
export const createNews = async (req: Request, res: Response) => {
    try {
        const { title, content } = req.body;

        const news = await News.create({
            title,
            content,
            excerpt: content.substring(0, 100) + (content.length > 100 ? "..." : ""),
            publishedAt: new Date()
        });

        res.status(201).json(news);
    } catch (error) {
        console.error("Error creating news:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Updates an existing news article (Admin only)
export const updateNews = async (req: Request, res: Response) => {
    try {
        const { title, content } = req.body;

        const news = await News.findById(req.params.id);

        if (!news) {
            return res.status(404).json({ message: "News article not found" });
        }

        news.title = title || news.title;
        news.content = content || news.content;

        const updatedNews = await news.save();
        res.json(updatedNews);
    } catch (error) {
        console.error("Error updating news:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Permanently deletes a news article (Admin only)
export const deleteNews = async (req: Request, res: Response) => {
    try {
        const news = await News.findById(req.params.id);

        if (!news) {
            return res.status(404).json({ message: "News article not found" });
        }

        await news.deleteOne();
        res.json({ message: "News article removed" });
    } catch (error) {
        console.error("Error deleting news:", error);
        res.status(500).json({ message: "Server error" });
    }
};
