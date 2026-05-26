import multer from "multer";
import fs from "fs";
import path from "path";

const uploadRoot = "/var/www/mtsoft/uploads";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(uploadRoot)) {
      fs.mkdirSync(uploadRoot, { recursive: true });
    }

    cb(null, uploadRoot);
  },

  filename: (req, file, cb) => {
    // ✔ paliekam originalų pavadinimą
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  },
});

export const uploadFiles = upload.array("files", 20);
