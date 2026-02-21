import mongoose, { Document, Schema } from "mongoose";

export interface INews extends Document {
    title: string;
    excerpt: string;
    content: string;
    imageUrl: string;
    author: string;
    publishedAt: Date;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

const newsSchema = new Schema<INews>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        excerpt: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        imageUrl: {
            type: String,
            required: true,
        },
        author: {
            type: String,
            default: "Admin",
        },
        publishedAt: {
            type: Date,
            default: Date.now,
        },
        tags: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<INews>("News", newsSchema);
