import mongoose, { Document } from "mongoose";

export type UserRole = "player" | "organizer" | "admin";

export interface IUser extends Document {
  fullName: string;
  email: string;
  password?: string;
  role: UserRole;
  avatarUrl?: string;
  bio?: string;
  googleId?: string;
  discordId?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: function() { return !this.googleId && !this.discordId; } },
    role: { type: String, enum: ["player", "organizer", "admin"], default: "player" },
    avatarUrl: { type: String, default: "" },
    bio: { type: String, default: "" },
    googleId: { type: String },
    discordId: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date }
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", userSchema);
export default User;
