// import { exec } from "child_process";
// import cron from "node-cron";
// import fs from "fs";

// export const databaseBackupToAtlas = () => {
//   cron.schedule("38 21 * * *", () => {
//     console.log("Starting database backup to Atlas...");

//     const backupFile = `C:/MTwebsite/mongodbBackups/mongo_backup_${
//       new Date().toISOString().split("T")[0]
//     }.gz`;

//     if (!fs.existsSync(backupFile)) {
//       console.error("Backup file missing! Skipping Atlas sync.");
//       return;
//     }

//     const mongoRestorePath = `"C:\\MTwebsite\\mongodb\\bin\\mongorestore.exe"`;
//     const atlasURI = process.env.MONGODB_URI_REMOTE;

//     exec(
//       `${mongoRestorePath} --gzip --archive=${backupFile}
//        --nsInclude=moderniTvora.archive --drop
//        --nsInclude=moderniTvora.backup --drop
//        --nsInclude=moderniTvora.bonus --drop
//        --nsInclude=moderniTvora.clients --drop
//        --nsInclude=moderniTvora.defaultValues --drop
//        --nsInclude=moderniTvora.gamyba --drop
//        --nsInclude=moderniTvora.gates --drop
//        --nsInclude=moderniTvora.montavimas --drop
//        --nsInclude=moderniTvora.potentialClients --drop
//        --nsInclude=moderniTvora.potentialClientsUnsuscribed --drop
//        --nsInclude=moderniTvora.products --drop
//        --nsInclude=moderniTvora.projects --drop
//        --nsInclude=moderniTvora.projectsDeleted --drop
//        --nsInclude=moderniTvora.projectsUnconfirmed --drop
//        --nsInclude=moderniTvora.projectsVersions --drop
//        --nsInclude=moderniTvora.schedule --drop
//        --nsInclude=moderniTvora.selectData --drop
//        --nsInclude=moderniTvora.userRights --drop
//        --nsInclude=moderniTvora.users --drop
//        --uri=${atlasURI}`,

//       (restoreError, restoreStdout, restoreStderr) => {
//         if (restoreError) {
//           console.error("Restore to Atlas failed:", restoreStderr);
//           return;
//         }
//         console.log("Database successfully synced to Atlas.");
//       }
//     );
//   });
// };
import { exec } from "child_process";
import cron from "node-cron";
import fs from "fs";
import dotenv from "dotenv";

// Load environment variables (optional, if you use .env file)
dotenv.config();

export const databaseBackupToAtlas = () => {
  // Schedule the backup job
  cron.schedule("55 22 * * *", () => {
    console.log("🚀 Starting database backup to Atlas...");

    const todayDate = new Date().toISOString().split("T")[0];
    const backupFile = `C:/MTwebsite/mongodbBackups/mongo_backup_${todayDate}.gz`;

    // Check if backup file exists
    if (!fs.existsSync(backupFile)) {
      console.error("❌ Backup file missing! Skipping Atlas sync.");
      return;
    }

    const mongoRestorePath = `"C:\\MTwebsite\\mongodb\\bin\\mongorestore.exe"`;
    const atlasURI = process.env.MONGODB_URI_REMOTE2;

    // STEP 1: Restore the Backup
    const restoreCommand = `
      ${mongoRestorePath} 
      --gzip 
      --archive="${backupFile}" 
      --nsFrom=moderniTvora.* 
      --nsTo=ModerniTvora.* 
      --drop 
      --uri="${atlasURI}"
    `;

    console.log("🔄 Restoring backup to Atlas...");

    exec(restoreCommand.replace(/\s+/g, " "), (error, stdout, stderr) => {
      if (error) {
        console.error("❌ Restore to Atlas failed:", stderr);
        return;
      }
      console.log("✅ Database successfully synced to Atlas!");
      console.log(stdout);
    });
  });
};
