import cron from "node-cron";
import { exec } from "child_process";

const run = (cmd: string) =>
  new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) return reject(stderr);
      resolve(stdout);
    });
  });

export const backupDatabase = () => {
  cron.schedule("10 4 * * *", async () => {
    console.log("[CRON] MTSoft backup started");

    const date = new Date().toISOString().split("T")[0];
    const backupDir = "/var/www/mtsoft/backups";

    const gzBackupFile = `${backupDir}/mongo_backup_${date}.gz`;

    try {
      await run(`mongodump --gzip --archive=${gzBackupFile} --db=moderniTvora`);
      await run(`find ${backupDir} -name "*.gz" -mtime +7 -delete`);

      console.log("[CRON] MTSoft backup OK:", gzBackupFile);
    } catch (err) {
      console.error("[CRON] MTSoft backup failed:", err);
    }
  });
};
