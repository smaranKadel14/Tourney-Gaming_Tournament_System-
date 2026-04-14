import mongoose, { Document, Schema } from "mongoose";

export interface IContact extends Document {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  status: "pending" | "read" | "replied";
  createdAt: Date;
  updatedAt: Date;
}

const contactSchema = new Schema<IContact>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "read", "replied"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IContact>("Contact", contactSchema);
