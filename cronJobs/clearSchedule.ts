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
import { Schedule } from "../data/interfaces";

export const clearSchedule = () => {
  cron.schedule("20 10 * * *", async () => {
    console.log("Cleaning up old schedules...");

    try {
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

      const allSchedules: Schedule[] = await scheduleSchema.find();

      const oldSchedules = allSchedules.filter((schedule) => {
        const scheduleDate = new Date(schedule.date);
        return scheduleDate < twoWeeksAgo;
      });

      console.log(oldSchedules.length);

      const idsToDelete = oldSchedules.map((schedule) => schedule._id);

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
