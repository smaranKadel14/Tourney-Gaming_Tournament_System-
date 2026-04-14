import mongoose, { Document, Schema } from "mongoose";

export interface IRegistration extends Document {
    user: mongoose.Types.ObjectId;
    team?: mongoose.Types.ObjectId;
    tournament: mongoose.Types.ObjectId;
    status: "pending" | "confirmed" | "cancelled" | "rejected";
    paymentStatus: "pending" | "completed" | "failed";
    paymentMethod: string;
    transactionId?: string;
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
        team: {
            type: Schema.Types.ObjectId,
            ref: "Team"
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
        paymentStatus: {
            type: String,
            enum: ["pending", "completed", "failed"],
            default: "pending",
        },
        paymentMethod: {
            type: String,
            default: "esewa",
        },
        transactionId: {
            type: String,
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
