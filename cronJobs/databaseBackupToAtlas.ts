import { exec } from "child_process";
import cron from "node-cron";
import fs from "fs";

export const databaseBackupToAtlas = () => {
  cron.schedule("24 20 * * *", () => {
    console.log("Starting database backup to Atlas...");

    const backupFile = `C:/MTwebsite/mongodbBackups/mongo_backup_${
      new Date().toISOString().split("T")[0]
    }.gz`;

    if (!fs.existsSync(backupFile)) {
      console.error("Backup file missing! Skipping Atlas sync.");
      return;
    }

    const mongoRestorePath = `"C:\\MTwebsite\\mongodb\\bin\\mongorestore.exe"`;
    const atlasURI = process.env.MONGODB_URI_REMOTE;
    console.log(atlasURI);

    exec(
      `${mongoRestorePath} --gzip --archive=${backupFile} --nsInclude=tvora.archive --nsInclude=tvora.backup --nsInclude=tvora.bonus --nsInclude=tvora.clients --nsInclude=tvora.defaultValues 
      --nsInclude=tvora.gamyba --nsInclude=tvora.gates --nsInclude=tvora.montavimas --nsInclude=tvora.potentialClients --nsInclude=tvora.potentialClientsUnsuscribed --nsInclude=tvora.products
      --nsInclude=tvora.projects --nsInclude=tvora.projectsDeleted --nsInclude=tvora.projectsUnconfirmed --nsInclude=tvora.projectsVersions --nsInclude=tvora.schedule --nsInclude=tvora.selectData
      --nsInclude=tvora.userRights --nsInclude=tvora.users --uri=${atlasURI}`,
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
