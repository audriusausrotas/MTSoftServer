import cron from "node-cron";
import { exec } from "child_process";
import dotenv from "dotenv";

dotenv.config();

export const databaseBackupToAtlas = () => {
  cron.schedule("12 4 * * *", async () => {
    console.log("[CRON] MTSoft restoring backup to Atlas...");

    const date = new Date().toISOString().split("T")[0];
    const backupDir = "/var/www/mtsoft/backups";
    const gzBackupFile = `${backupDir}/mongo_backup_${date}.gz`;

    const atlasURI = process.env.MONGODB_URI_REMOTE2;

    const restoreCmd = `mongorestore --gzip --archive=${gzBackupFile} --uri="${atlasURI}" --drop`;

    exec(restoreCmd, (error, stdout, stderr) => {
      if (error) {
        console.error("[CRON] MTSoft restore failed:", stderr);
      } else {
        console.log("[CRON] MTSoft Atlas restore OK");
      }
    });
  });
};
