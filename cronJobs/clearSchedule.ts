import cron from "node-cron";
import scheduleSchema from "../schemas/scheduleSchema";

export const clearSchedule = () => {
  cron.schedule("00 4 * * *", async () => {
    console.log("Cleaning up old schedules...");

    try {
      const today = new Date();
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(today.getDate() - 14);

      const schedules = await scheduleSchema.find();

      const oldSchedules = schedules.filter((s: any) => {
        const parsedDate = new Date(s.date);
        return parsedDate < twoWeeksAgo;
      });

      const idsToDelete = oldSchedules.map((s) => s._id);

      if (idsToDelete.length > 0) {
        const result = await scheduleSchema.deleteMany({ _id: { $in: idsToDelete } });
        console.log(`Deleted ${result.deletedCount} old schedules.`);
      } else {
        console.log("No old schedules found.");
      }
    } catch (error) {
      console.error("Error deleting old schedules:", error);
    }
  });
};
