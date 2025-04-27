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

export const databaseBackupToAtlas = () => {
  cron.schedule("3 22 * * *", () => {
    console.log("🚀 Starting database backup to Atlas...");

    const backupFile = `C:/MTwebsite/mongodbBackups/mongo_backup_${
      new Date().toISOString().split("T")[0]
    }.gz`;

    if (!fs.existsSync(backupFile)) {
      console.error("❌ Backup file missing! Skipping Atlas sync.");
      return;
    }

    const mongoRestorePath = `"C:\\MTwebsite\\mongodb\\bin\\mongorestore.exe"`;
    const mongoShellPath = `"C:\\MTwebsite\\mongodb\\bin\\mongosh.exe"`;
    const atlasURI = process.env.MONGODB_URI_REMOTE;

    // STEP 1: Drop the Entire Database in Atlas Before Restoring

    exec(
      `"C:\\MTwebsite\\mongodb\\bin\\mongosh.exe" "mongodb+srv://audrius:Man0pass@tvora.gpj0kpq.mongodb.net/ModerniTvora" --eval "db.dropDatabase();"`,
      (dropError, dropStdout, dropStderr) => {
        if (dropError) {
          console.error("❌ Failed to drop old database:", dropStderr);
          return;
        }
        console.log("✅ Old database dropped successfully!");

        // STEP 2: Restore the Backup After Dropping
        exec(
          `${mongoRestorePath} --gzip --archive=${backupFile} 
           --nsFrom=moderniTvora.* --nsTo=ModerniTvora.* --drop
           --uri=${atlasURI}`,

          (restoreError, restoreStdout, restoreStderr) => {
            if (restoreError) {
              console.error("❌ Restore to Atlas failed:", restoreStderr);
              return;
            }
            console.log("✅ Database successfully synced to Atlas!");
          }
        );
      }
    );
  });
};
