// import cron from "node-cron";
// import { exec } from "child_process";

// export const backupDatabase = () => {
//   cron.schedule("37 21 * * *", () => {
//     console.log("Running daily MongoDB backup...");

//     const mongoDumpPath = `"C:\\MTwebsite\\mongodb\\bin\\mongodump.exe"`;
//     const backupFile = `C:/MTwebsite/mongodbBackups/mongo_backup_${
//       new Date().toISOString().split("T")[0]
//     }.gz`;

//     exec(
//       `${mongoDumpPath} --gzip --archive=${backupFile} --db=moderniTvora`,
//       (error, stdout, stderr) => {
//         if (error) {
//           console.error("Backup failed:", stderr);
//         } else {
//           console.log("Backup completed successfully:", backupFile);
//         }
//       }
//     );

//     exec(
//       `forfiles /p "C:\\MTwebsite\\mongodbBackups" /m mongo_backup_*.gz /d -7 /c "cmd /c del @file"`,
//       (error, stdout, stderr) => {
//         if (error) {
//           console.error("Old backup cleanup failed:", stderr);
//         } else {
//           console.log("Old backups deleted.");
//         }
//       }
//     );
//   });
// };

import { exec } from "child_process";
import cron from "node-cron";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

export const backupDatabase = () => {
  cron.schedule("52 23 * * *", () => {
    console.log("🚀 Restoring MongoDB backup to Atlas...");

    const collections = [
      "schedule", // Add other collections here
      "clients",
      // Add more collections
    ];

    const atlasURI = process.env.MONGODB_URI_REMOTE2;

    collections.forEach((collection) => {
      const backupFile = `C:/MTwebsite/mongodbBackups/${collection}_backup_${
        new Date().toISOString().split("T")[0]
      }.json`;

      if (!fs.existsSync(backupFile)) {
        console.error(
          `❌ Backup file for collection ${collection} missing! Skipping Atlas restore.`
        );
        return;
      }

      // Restore command
      const restoreCommand = `"C:\\MTwebsite\\mongodb\\bin\\mongoimport.exe" --uri="${atlasURI}" --db=ModerniTvora --collection=${collection} --file="${backupFile}" --jsonArray --drop`;

      console.log(`Executing restore command for collection ${collection}: ${restoreCommand}`);

      exec(restoreCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`❌ Restore failed for collection ${collection}:`, stderr);
        } else {
          console.log(`✅ Collection ${collection} successfully synced to Atlas!`);
          console.log("STDOUT:", stdout);
        }
      });
    });
  });
};
