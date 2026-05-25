import cron from "node-cron";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";

dotenv.config();

function getLatestBackup(dir: string) {
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".gz"))
    .map((f) => ({
      file: f,
      time: fs.statSync(path.join(dir, f)).mtime.getTime(),
    }))
    .sort((a, b) => b.time - a.time)[0]?.file;
}

export const databaseBackupToAtlas = () => {
  cron.schedule("12 1 * * *", () => {
    console.log("[CRON] Atlas restore started");

    const backupDir = "/var/www/mtsoft/backups";
    const atlasURI = process.env.MONGODB_URI_REMOTE2;

    if (!atlasURI) {
      console.error("Missing MONGODB_URI_REMOTE2");
      return;
    }

    const latest = getLatestBackup(backupDir);

    if (!latest) {
      console.error("No backup found");
      return;
    }

    const fullPath = path.join(backupDir, latest);

    console.log("[CRON] Using backup:", fullPath);

    const restore = spawn("mongorestore", [
      "--gzip",
      "--archive=" + fullPath,
      "--uri=" + atlasURI,
      "--drop",
    ]);

    restore.stdout.on("data", (d) => {
      console.log("[RESTORE]", d.toString());
    });

    restore.stderr.on("data", (d) => {
      console.error("[RESTORE ERROR]", d.toString());
    });

    restore.on("close", (code) => {
      if (code === 0) {
        console.log("[CRON] Atlas restore SUCCESS");
      } else {
        console.error("[CRON] Restore FAILED code:", code);
      }
    });
  });
};
