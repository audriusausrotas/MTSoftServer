// import cron from "node-cron";
// import scheduleSchema from "../schemas/scheduleSchema";

// export const clearSchedule = () => {
//   cron.schedule("1 10 * * *", async () => {
//     console.log("Cleaning up old schedules...");

//     try {
//       const today = new Date();
//       const twoWeeksAgo = new Date();
//       twoWeeksAgo.setDate(today.getDate() - 14);

//       // ✅ Delete schedules older than 2 weeks
//       console.log(twoWeeksAgo);
//       const result = await scheduleSchema.deleteMany({ date: { $lte: twoWeeksAgo } });
//       console.log(result);

//       console.log(`Deleted ${result.deletedCount} old schedules.`);
//     } catch (error) {
//       console.error("Error deleting old schedules:", error);
//     }
//   });
// };

import cron from "node-cron";
import scheduleSchema from "../schemas/scheduleSchema";

export const clearSchedule = () => {
  cron.schedule("33 10 * * *", async () => {
    console.log("Cleaning up old schedules...");

    try {
      const today = new Date();
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(today.getDate() - 14);

      // 1. Get all schedules
      const schedules = await scheduleSchema.find();

      // 2. Filter out the old ones
      const oldSchedules = schedules.filter((s: any) => {
        const parsedDate = new Date(s.date); // same like in your getSchedules
        return parsedDate < twoWeeksAgo;
      });

      // 3. Delete them by IDs
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
