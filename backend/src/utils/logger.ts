import Log, { LogCategory, LogSeverity } from "../models/Log";

export const logSystemEvent = async (
  event: string,
  category: LogCategory,
  actor: string,
  severity: LogSeverity,
  details: string
) => {
  try {
    await Log.create({
      event,
      category,
      actor,
      severity,
      details,
    });
  } catch (error) {
    console.error("Failed to write system log:", error);
  }
};
