import { Request, Response } from "express";
import Contact from "../models/Contact";

export const submitMessage = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, message } = req.body;

    // Basic validation
    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    const newMessage = new Contact({
      firstName,
      lastName,
      email,
      message,
    });

    await newMessage.save();

    res.status(201).json({
      message: "Message sent successfully! We will get back to you soon.",
      data: newMessage,
    });
  } catch (error) {
    console.error("Submit Contact Error:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const skip = (page - 1) * limit;

    let query: any = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } }
      ];
    }

    const totalMessages = await Contact.countDocuments(query);
    const totalPages = Math.ceil(totalMessages / limit);

    const messages = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      messages,
      totalMessages,
      totalPages,
      currentPage: page
    });
  } catch (error) {
    console.error("Get Messages Error:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const message = await Contact.findByIdAndUpdate(id, { status: "read" }, { new: true });
    
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    
    res.json({ message: "Message marked as read", data: message });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
