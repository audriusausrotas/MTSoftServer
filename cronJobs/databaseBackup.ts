import cron from "node-cron";
import { exec } from "child_process";

export const backupDatabase = () => {
  cron.schedule("0 0 * * *", () => {
    console.log("Running daily database backup...");

    // const backupFile = `/home/user/backups/backup-$(date +%F).gz`;
    // exec(
    //   `mongodump --uri="${process.env.MONGODB_URI}" --gzip --archive=${backupFile}`,
    //   (error, stdout, stderr) => {
    //     if (error) {
    //       console.error("Backup failed:", stderr);
    //     } else {
    //       console.log("Backup completed successfully.");
    //     }
    //   }
    // );
  });
};
