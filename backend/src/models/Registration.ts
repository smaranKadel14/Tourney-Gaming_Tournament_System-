import mongoose, { Document, Schema } from "mongoose";

export interface IRegistration extends Document {
    user: mongoose.Types.ObjectId;
    tournament: mongoose.Types.ObjectId;
    status: "pending" | "confirmed" | "cancelled" | "rejected";
    registeredAt: Date;
    updatedAt: Date;
}

const registrationSchema = new Schema<IRegistration>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        tournament: {
            type: Schema.Types.ObjectId,
            ref: "Tournament",
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "confirmed", "cancelled", "rejected"],
            default: "pending",
        },
        registeredAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent duplicate registrations
registrationSchema.index({ user: 1, tournament: 1 }, { unique: true });

export default mongoose.model<IRegistration>("Registration", registrationSchema);
