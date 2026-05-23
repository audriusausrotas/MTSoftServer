// import cron from "node-cron";
// import { exec } from "child_process";
// import dotenv from "dotenv";

// dotenv.config();

// export const databaseBackupToAtlas = () => {
//   cron.schedule("12 1 * * *", async () => {
//     console.log("[CRON] MTSoft restoring backup to Atlas...");

//     const date = new Date().toISOString().split("T")[0];
//     const backupDir = "/var/www/mtsoft/backups";
//     const gzBackupFile = `${backupDir}/mongo_backup_${date}.gz`;

//     const atlasURI = process.env.MONGODB_URI_REMOTE2;

//     const restoreCmd = `mongorestore --gzip --archive=${gzBackupFile} --uri="${atlasURI}" --drop`;

//     exec(restoreCmd, (error, stdout, stderr) => {
//       if (error) {
//         console.error("[CRON] MTSoft restore failed:", stderr);
//       } else {
//         console.log("[CRON] MTSoft Atlas restore OK");
//       }
//     });
//   });
// };

import cron from "node-cron";
import { exec } from "child_process";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const run = (cmd: string) =>
  new Promise<string>((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) return reject(stderr || error.message);
      resolve(stdout);
    });
  });

export const databaseBackupToAtlas = () => {
  cron.schedule("12 1 * * *", async () => {
    console.log("[CRON] MTSoft restoring backup to Atlas...");

    const backupDir = "/var/www/mtsoft/backups";
    const atlasURI = process.env.MONGODB_URI_REMOTE2;

    try {
      if (!atlasURI) {
        throw new Error("Missing MONGODB_URI_REMOTE2");
      }

      const latestBackup = fs
        .readdirSync(backupDir)
        .filter((f) => f.endsWith(".gz"))
        .map((f) => `${backupDir}/${f}`)
        .sort((a, b) => fs.statSync(b).mtime.getTime() - fs.statSync(a).mtime.getTime())[0];

      if (!latestBackup) {
        throw new Error("No backup files found");
      }

      console.log("[CRON] Using backup:", latestBackup);

      // 🔥 restore
      const cmd = `mongorestore --gzip --archive=${latestBackup} --uri="${atlasURI}" --drop`;

      const output = await run(cmd);

      console.log("[CRON] Restore OUTPUT:");
      console.log(output);

      console.log("[CRON] MTSoft Atlas restore DONE");
    } catch (err) {
      console.error("[CRON] MTSoft restore FAILED:");
      console.error(err);
    }
  });
};
