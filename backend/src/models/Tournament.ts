import mongoose, { Document, Schema } from "mongoose";

export interface ITournament extends Document {
    title: string;
    game: mongoose.Types.ObjectId;
    description: string;
    startDate: Date;
    endDate: Date;
    location: string;
    registrationDeadline: Date;
    prizePool: string;
    rules: string;
    maxParticipants: number;
    imageUrl: string;
    status: "upcoming" | "ongoing" | "completed";
    createdAt: Date;
    updatedAt: Date;
}

const tournamentSchema = new Schema<ITournament>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        game: {
            type: Schema.Types.ObjectId,
            ref: "Game",
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
        },
        location: {
            type: String, // e.g., "Online", "Los Angeles", "New York"
            required: true,
        },
        registrationDeadline: {
            type: Date,
            required: true,
        },
        prizePool: {
            type: String,
            default: "TBA",
        },
        rules: {
            type: String,
            default: "",
        },
        maxParticipants: {
            type: Number,
            default: 0, // 0 means unlimited
        },
        imageUrl: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["upcoming", "ongoing", "completed"],
            default: "upcoming",
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<ITournament>("Tournament", tournamentSchema);
