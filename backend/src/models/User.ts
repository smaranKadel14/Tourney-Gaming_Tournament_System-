import mongoose, { Document } from "mongoose";

export type UserRole = "player" | "organizer" | "admin";

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["player", "organizer", "admin"], default: "player" }
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", userSchema);
export default User;
