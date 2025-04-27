import cron from "node-cron";
import scheduleSchema from "../schemas/scheduleSchema";

export const clearSchedule = () => {
  cron.schedule("47 9 * * *", async () => {
    console.log("Cleaning up old schedules...");

    try {
      const today = new Date();
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(today.getDate() - 14);

      // ✅ Delete schedules older than 2 weeks
      console.log(twoWeeksAgo);
      const result = await scheduleSchema.deleteMany({ date: { $lt: twoWeeksAgo } });
      console.log(result);

      console.log(`Deleted ${result.deletedCount} old schedules.`);
    } catch (error) {
      console.error("Error deleting old schedules:", error);
    }
  });
};
