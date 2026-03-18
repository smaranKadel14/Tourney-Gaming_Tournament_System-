import mongoose, { Document } from "mongoose";

export type LogCategory = "AUTH" | "SYSTEM" | "USER" | "TOURNAMENT";
export type LogSeverity = "info" | "success" | "warning" | "error";

export interface ILog extends Document {
  event: string;
  category: LogCategory;
  actor: string;
  severity: LogSeverity;
  details: string;
}

const logSchema = new mongoose.Schema<ILog>(
  {
    event: { type: String, required: true },
    category: { type: String, required: true, enum: ["AUTH", "SYSTEM", "USER", "TOURNAMENT"] },
    actor: { type: String, required: true },
    severity: { type: String, required: true, enum: ["info", "success", "warning", "error"] },
    details: { type: String, required: true },
  },
  { timestamps: true }
);

const Log = mongoose.model<ILog>("Log", logSchema);
export default Log;
