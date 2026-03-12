import mongoose, { Document, Schema } from "mongoose";

export interface INotification extends Document {
    recipient: mongoose.Types.ObjectId;
    actor?: mongoose.Types.ObjectId;
    type: "registration" | "payment" | "tournament_update" | "system";
    message: string;
    isRead: boolean;
    link?: string;
    createdAt: Date;
    updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
    {
        recipient: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        actor: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        type: {
            type: String,
            enum: ["registration", "payment", "tournament_update", "system"],
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        link: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Index for performance
notificationSchema.index({ recipient: 1, createdAt: -1 });

export default mongoose.model<INotification>("Notification", notificationSchema);
