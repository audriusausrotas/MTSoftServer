import { Request, Response } from "express";
import response from "../modules/response";
import multer from "multer";
import path from "path";
import fs from "fs";
import projectSchema from "../schemas/projectSchema";
import productionSchema from "../schemas/productionSchema";
import installationSchema from "../schemas/installationSchema";

export default {
  uploadFiles: (req: Request, res: Response) => {
    upload(req, res, async (err) => {
      if (err) {
        return response(res, false, null, "Klaida įkeliant failus");
      }

      if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
        return response(res, false, null, "Failai neįkelti");
      }

      try {
        const filesArray = req.files as Express.Multer.File[];
        const filePaths = filesArray.map((file) => `/uploads/${file.filename}`);

        const { category, _id } = req.body;

        let data;

        if (category === "projects") {
          data = await projectSchema.findById(_id);
        } else if (category === "production") {
          data = await productionSchema.findById(_id);
        } else if (category === "installation") {
          data = await installationSchema.findById(_id);
        }

        if (!data) return response(res, false, null, "Klaida įkeliant failus");

        data.files = [...(data.files || []), ...filePaths];

        const newData = await data?.save();

        return response(res, true, newData, "Failai sėkmingai įkelti");
      } catch (error) {
        console.log("Klaida", error);
        return response(res, false, null, "Serverio klaida");
      }
    });
  },

  deleteFiles: async (req: Request, res: Response) => {
    try {
      const { files, category, _id } = req.body;

      let data;

      if (category === "projects") {
        data = await projectSchema.findById(_id);
      } else if (category === "production") {
        data = await productionSchema.findById(_id);
      } else if (category === "installation") {
        data = await installationSchema.findById(_id);
      }

      if (!data) return response(res, false, null, "Serverio klaida");

      if (!files || !Array.isArray(files) || files.length === 0) {
        return response(res, false, null, "Nurodykite failus, kuriuos norite ištrinti.");
      }

      const deletePromises = files.map((filePath: string) => {
        const sanitizedPath = path.join(__dirname, "..", filePath);

        return new Promise((resolve, reject) => {
          fs.unlink(sanitizedPath, (err) => {
            if (err) {
              console.error(`Klaida ${filePath}:`, err);
              return reject(`Nepavyko ištrinti failo: ${filePath}`);
            }
            resolve(`Failas ištrintas: ${filePath}`);
          });
        });
      });

      await Promise.all(deletePromises);

      data.files = data.files.filter((file: string) => !files.includes(file));

      const newData = await data.save();

      return response(res, true, newData, "Failai sėkmingai ištrinti");
    } catch (error) {
      console.log("Klaida", error);
      return response(res, false, null, "Serverio klaida");
    }
  },
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const originalName = file.originalname.replace(/\s+/g, "_");
    const uniqueFilename = `${timestamp}-${originalName}`;

    cb(null, uniqueFilename);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
}).array("files", 10);
