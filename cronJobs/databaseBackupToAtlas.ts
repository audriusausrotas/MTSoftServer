import { exec } from "child_process";
import cron from "node-cron";
import fs from "fs";

export const databaseBackupToAtlas = () => {
  cron.schedule("45 10 * * *", () => {
    console.log("Starting database backup to Atlas...");

    const backupFile = `C:/MTwebsite/mongodbBackups/mongo_backup_${
      new Date().toISOString().split("T")[0]
    }.gz`;

    console.log(backupFile);

    if (!fs.existsSync(backupFile)) {
      console.error("Backup file missing! Skipping Atlas sync.");
      return;
    }

    const mongoRestorePath = `"C:\\MTwebsite\\mongodb\\bin\\mongorestore.exe"`;
    const atlasURI = process.env.MONGODB_URI_REMOTE;

    exec(
      `${mongoRestorePath} --gzip --archive=${backupFile} --uri=${atlasURI}`,
      (restoreError, restoreStdout, restoreStderr) => {
        if (restoreError) {
          console.error("Restore to Atlas failed:", restoreStderr);
          return;
        }
        console.log("Database successfully synced to Atlas.");
      }
    );
  });
};
