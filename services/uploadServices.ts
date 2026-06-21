import path from "path";
import fs from "fs/promises";

export async function deleteFiles(files: string[]) {
  const uploadRoot = "/var/www/mtsoft/uploads";

  await Promise.all(
    files.map(async (filePath) => {
      try {
        const cleanPath = filePath.replace(/^\/uploads\//, "");
        const fullPath = path.join(uploadRoot, cleanPath);

        await fs.unlink(fullPath);
      } catch (err: any) {
        if (err.code === "ENOENT") {
          console.warn(`File not found, skipping: ${filePath}`);
          return;
        }
        console.error(`Error deleting ${filePath}:`, err);
      }
    }),
  );
}
