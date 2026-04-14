import mongoose, { Document, Schema } from "mongoose";

export interface ITeamJoinRequest extends Document {
    team: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    message?: string;
    status: "pending" | "accepted" | "rejected";
    createdAt: Date;
    updatedAt: Date;
}

const teamJoinRequestSchema = new Schema<ITeamJoinRequest>(
    {
        team: {
            type: Schema.Types.ObjectId,
            ref: "Team",
            required: true
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        message: {
            type: String,
            maxlength: 200
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "rejected"],
            default: "pending"
        }
    },
    {
        timestamps: true
    }
);

// Prevent duplicate pending requests
teamJoinRequestSchema.index({ team: 1, user: 1 }, { unique: true });

export default mongoose.model<ITeamJoinRequest>("TeamJoinRequest", teamJoinRequestSchema);
