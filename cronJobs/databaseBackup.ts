import cron from "node-cron";
import { exec } from "child_process";

export const backupDatabase = () => {
  cron.schedule("20 0 * * *", () => {
    console.log("Running daily MongoDB backup...");

    const mongoDumpPath = `"C:\\MTwebsite\\mongodb\\bin\\mongodump.exe"`;
    const backupFile = `C:/MTwebsite/mongodbBackups/mongo_backup_${
      new Date().toISOString().split("T")[0]
    }.gz`;

    exec(
      `${mongoDumpPath} --gzip --archive=${backupFile} --db=moderniTvora`,
      (error, stdout, stderr) => {
        if (error) {
          console.error("Backup failed:", stderr);
        } else {
          console.log("Backup completed successfully:", backupFile);
        }
      }
    );

    // ✅ Delete backups older than 7 days
    exec(
      `forfiles /p "C:\\MTwebsite\\mongodbBackups" /m mongo_backup_*.gz /d -7 /c "cmd /c del @file"`,
      (error, stdout, stderr) => {
        if (error) {
          console.error("Old backup cleanup failed:", stderr);
        } else {
          console.log("Old backups deleted.");
        }
      }
    );
  });
};
