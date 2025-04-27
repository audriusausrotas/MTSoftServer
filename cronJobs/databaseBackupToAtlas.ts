import { exec } from "child_process";
import cron from "node-cron";
import fs from "fs";

export const databaseBackupToAtlas = () => {
  cron.schedule("4 21 * * *", () => {
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

    exec(
      `${mongoRestorePath} --gzip --archive=${backupFile} 
       --nsInclude=tvora.archive --drop
       --nsInclude=tvora.backup --drop
       --nsInclude=tvora.bonus --drop
       --nsInclude=tvora.clients --drop
       --nsInclude=tvora.defaultValues --drop
       --nsInclude=tvora.gamyba --drop
       --nsInclude=tvora.gates --drop
       --nsInclude=tvora.montavimas --drop
       --nsInclude=tvora.potentialClients --drop
       --nsInclude=tvora.potentialClientsUnsuscribed --drop
       --nsInclude=tvora.products --drop
       --nsInclude=tvora.projects --drop
       --nsInclude=tvora.projectsDeleted --drop
       --nsInclude=tvora.projectsUnconfirmed --drop
       --nsInclude=tvora.projectsVersions --drop
       --nsInclude=tvora.schedule --drop
       --nsInclude=tvora.selectData --drop
       --nsInclude=tvora.userRights --drop
       --nsInclude=tvora.users --drop
       --uri=${atlasURI}`,

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
