import cron from "node-cron";
import { exec } from "child_process";

export const clearSchedule = () => {
  cron.schedule("0 0 * * *", () => {
    console.log("Cleaning up old projects...");
    // Add logic to delete outdated projects from the database
  });
};
