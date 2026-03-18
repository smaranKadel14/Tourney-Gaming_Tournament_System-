import mongoose, { Document } from "mongoose";

export interface ISetting extends Document {
  systemName: string;
  supportEmail: string;
  platformFee: number;
  maintenanceMode: boolean;
}

const settingSchema = new mongoose.Schema<ISetting>(
  {
    systemName: { type: String, default: "Tourney Gaming System" },
    supportEmail: { type: String, default: "support@tourney.com" },
    platformFee: { type: Number, default: 5.0 },
    maintenanceMode: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Setting = mongoose.model<ISetting>("Setting", settingSchema);
export default Setting;
