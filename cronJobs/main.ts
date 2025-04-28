import { backupDatabase } from "./databaseBackup";
import { clearSchedule } from "./clearSchedule";
import { clearUnconfirmed } from "./clearUnconfirmed";
import { databaseBackupToAtlas } from "./databaseBackupToAtlas";

backupDatabase();
clearSchedule();
clearUnconfirmed();
databaseBackupToAtlas();

console.log("Cron jobs initialized...");
