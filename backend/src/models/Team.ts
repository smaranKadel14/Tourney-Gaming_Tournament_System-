import mongoose, { Document, Schema } from "mongoose";

export interface ITeam extends Document {
    name: string;
    logoUrl?: string;
    bio?: string;
    captain: mongoose.Types.ObjectId;
    members: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const teamSchema = new Schema<ITeam>(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            maxlength: 50
        },
        logoUrl: {
            type: String,
            default: ""
        },
        bio: {
            type: String,
            default: "",
            maxlength: 300
        },
        captain: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        members: [{
            type: Schema.Types.ObjectId,
            ref: "User"
        }]
    },
    {
        timestamps: true
    }
);

export default mongoose.model<ITeam>("Team", teamSchema);
