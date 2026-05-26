import multer from "multer";
import fs from "fs";

const uploadRoot = "/var/www/mtsoft/uploads";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(uploadRoot)) {
      fs.mkdirSync(uploadRoot, { recursive: true });
    }

    cb(null, uploadRoot);
  },

  //   filename: (req, file, cb) => {
  //     cb(null, file.originalname);
  //   },
  // });

  // const upload = multer({
  //   storage,
  //   limits: {
  //     fileSize: 20 * 1024 * 1024, // 20MB
  //   },
});

// export const uploadFiles = upload.array("files", 20);

export const uploadFiles = (req: any, res: any, next: any) => {
  const upload = multer({
    storage,
    limits: {
      fileSize: 20 * 1024 * 1024,
    },
  }).array("files", 20);

  upload(req, res, function (err) {
    if (err) {
      console.error("❌ MULTER ERROR:", err);
      return next(err);
    }

    console.log("✅ FILES RECEIVED:", req.files);
    console.log("📦 BODY:", req.body);

    next();
  });
};
