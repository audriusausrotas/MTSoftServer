// import cron from "node-cron";
// import { exec } from "child_process";

// export const backupDatabase = () => {
//   cron.schedule("6 00 * * *", () => {
//     console.log("🚀 Running daily MongoDB backup...");

//     const mongoDumpPath = "C:\\MTwebsite\\mongodb\\bin\\mongodump.exe";
//     const backupFile = `C:/MTwebsite/mongodbBackups/mongo_backup_${
//       new Date().toISOString().split("T")[0]
//     }.gz`;

//     exec(
//       `${mongoDumpPath} --gzip --archive=${backupFile} --db=moderniTvora`,
//       (error, stdout, stderr) => {
//         if (error) {
//           console.error("❌ Backup failed:", stderr);
//         } else {
//           console.log("✅ Backup completed successfully:", backupFile);
//         }
//       }
//     );

//     // Clean up old backups (older than 7 days)
//     exec(
//       `forfiles /p "C:\\MTwebsite\\mongodbBackups" /m mongo_backup_*.gz /d -7 /c "cmd /c del @file"`,
//       (error, stdout, stderr) => {
//         if (error) {
//           console.error("❌ Old backup cleanup failed:", stderr);
//         } else {
//           console.log("✅ Old backups deleted.");
//         }
//       }
//     );
//   });
// };

// import { exec } from "child_process";
// import cron from "node-cron";
// import fs from "fs";
// import dotenv from "dotenv";

// dotenv.config();

// export const backupDatabase = () => {
//   cron.schedule("52 23 * * *", () => {
//     console.log("🚀 Restoring MongoDB backup to Atlas...");

//     const collections = ["schedule", "clients"];

//     const atlasURI = process.env.MONGODB_URI_REMOTE2;

//     collections.forEach((collection) => {
//       const backupFile = `C:/MTwebsite/mongodbBackups/${collection}_backup_${
//         new Date().toISOString().split("T")[0]
//       }.json`;

//       if (!fs.existsSync(backupFile)) {
//         console.error(`Backup file for collection ${collection} missing! Skipping Atlas restore.`);
//         return;
//       }

//       const restoreCommand = `"C:\\MTwebsite\\mongodb\\bin\\mongoimport.exe" --uri="${atlasURI}" --db=ModerniTvora --collection=${collection} --file="${backupFile}" --jsonArray --drop`;

//       exec(restoreCommand, (error, stdout, stderr) => {
//         if (error) {
//           console.error(`Restore failed for collection ${collection}:`, stderr);
//         } else {
//           console.log(`Collection ${collection} successfully synced to Atlas!`);
//         }
//       });
//     });
//   });
// };

import cron from "node-cron";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

export const backupDatabase = () => {
  cron.schedule("37 00 * * *", () => {
    console.log("Running daily MongoDB backup...");

    const mongoDumpPath = "C:\\MTwebsite\\mongodb\\bin\\mongodump.exe";
    const gzBackupFile = `C:/MTwebsite/mongodbBackups/mongo_backup_${
      new Date().toISOString().split("T")[0]
    }.gz`;
    const jsonBackupDir = "C:/MTwebsite/mongodbBackups/json";

    if (!fs.existsSync(jsonBackupDir)) {
      fs.mkdirSync(jsonBackupDir, { recursive: true });
    }

    const atlasURI = process.env.MONGODB_URI_REMOTE2;

    // Run mongodump to create .gz backup
    exec(
      `${mongoDumpPath} --gzip --archive=${gzBackupFile} --db=moderniTvora`,
      (error, stdout, stderr) => {
        if (error) {
          console.error("Backup failed:", stderr);
        } else {
          console.log("Backup completed successfully:", gzBackupFile);
        }
      }
    );

    // Run mongoexport to create .json backup for collections
    const collections = ["schedule", "clients"];

    collections.forEach((collection) => {
      const jsonBackupFile: any = `C:/MTwebsite/mongodbBackups/${collection}_backup_${
        new Date().toISOString().split("T")[0]
      }.json`;

      if (!fs.existsSync(jsonBackupFile)) {
        console.error(`Backup file for collection ${collection} missing! Skipping Atlas restore.`);
        return;
      }

      const restoreCommand = `"C:\\MTwebsite\\mongodb\\bin\\mongoimport.exe" --uri="${atlasURI}" --db=ModerniTvora --collection=${collection} --file="${jsonBackupFile}" --jsonArray --drop`;

      exec(restoreCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`Restore failed for collection ${collection}:`, stderr);
        } else {
          console.log(`Collection ${collection} successfully synced to Atlas!`);
        }
      });
    });

    // Clean up old backups (older than 7 days)
    exec(
      `forfiles /p "C:/MTwebsite/mongodbBackups/" /m mongo_backup_*.gz /d -7 /c "cmd /c del @file"`,
      (error, stdout, stderr) => {
        if (error) {
          console.error("❌ GZ Old backup cleanup failed:", stderr);
        } else {
          console.log("✅ GZ Old backups deleted.");
        }
      }
    );

    exec(
      `forfiles /p "${jsonBackupDir}" /m *_backup_*.json /d -7 /c "cmd /c del @file"`,
      (error, stdout, stderr) => {
        if (error) {
          console.error("❌ JSON Old backup cleanup failed:", stderr);
        } else {
          console.log("✅ JSON Old backups deleted.");
        }
      }
    );
  });
};
