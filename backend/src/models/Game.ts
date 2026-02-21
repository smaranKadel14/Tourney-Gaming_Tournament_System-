import mongoose, { Document, Schema } from "mongoose";

export interface IGame extends Document {
    title: string;
    description: string;
    imageUrl: string;
    releaseDate: Date;
    developer: string;
    genre: string[];
    isFeatured: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const gameSchema = new Schema<IGame>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        imageUrl: {
            type: String,
            required: true,
        },
        releaseDate: {
            type: Date,
            required: true,
        },
        developer: {
            type: String,
            default: "Unknown",
        },
        genre: {
            type: [String],
            default: [],
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IGame>("Game", gameSchema);
