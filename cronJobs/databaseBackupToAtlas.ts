////////////// from json

// import { exec } from "child_process";
// import cron from "node-cron";
// import fs from "fs";
// import dotenv from "dotenv";

// dotenv.config();

// export const databaseBackupToAtlas = () => {
//   cron.schedule("23 23 * * *", () => {
//     console.log("🚀 Restoring MongoDB backup to Atlas...");

//     const collections = [
//       "schedule", // Add other collections here
//       "clients",
//       // Add more collections
//     ];

//     const atlasURI = process.env.MONGODB_URI_REMOTE2;

//     collections.forEach(collection => {
//       const backupFile = `C:/MTwebsite/mongodbBackups/${collection}_backup_${
//         new Date().toISOString().split("T")[0]
//       }.json`;

//       if (!fs.existsSync(backupFile)) {
//         console.error(`❌ Backup file for collection ${collection} missing! Skipping Atlas restore.`);
//         return;
//       }

//       // Restore command
//       const restoreCommand = `"C:\\MTwebsite\\mongodb\\bin\\mongoimport.exe" --uri="${atlasURI}" --db=ModerniTvora --collection=${collection} --file="${backupFile}" --jsonArray --drop`;

//       console.log(`Executing restore command for collection ${collection}: ${restoreCommand}`);

//       exec(restoreCommand, (error, stdout, stderr) => {
//         if (error) {
//           console.error(`❌ Restore failed for collection ${collection}:`, stderr);
//         } else {
//           console.log(`✅ Collection ${collection} successfully synced to Atlas!`);
//           console.log("STDOUT:", stdout);
//         }
//       });
//     });
//   });
// };

///////////////// from gz

import cron from "node-cron";
import { exec } from "child_process";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

export const databaseBackupToAtlas = () => {
  cron.schedule("11 00 * * *", () => {
    console.log("🚀 Restoring MongoDB backup from .gz file to Atlas...");

    const collections = ["schedule", "clients"];
    const atlasURI = process.env.MONGODB_URI_REMOTE2;

    collections.forEach((collection) => {
      const backupFile = `C:/MTwebsite/mongodbBackups/${collection}_backup_${
        new Date().toISOString().split("T")[0]
      }.gz`;

      if (!fs.existsSync(backupFile)) {
        console.error(
          `❌ Backup file for collection ${collection} missing! Skipping Atlas restore.`
        );
        return;
      }

      const restoreCommand = `"C:\\MTwebsite\\mongodb\\bin\\mongorestore.exe" --gzip --archive="${backupFile}" --uri="${atlasURI}" --nsFrom=moderniTvora.${collection} --nsTo=ModerniTvora.${collection} --drop`;

      exec(restoreCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`❌ Restore failed for collection ${collection}:`, stderr);
        } else {
          console.log(`✅ Collection ${collection} successfully restored from .gz file to Atlas!`);
          console.log("STDOUT:", stdout);
        }
      });
    });
  });
};
