import installationSchema from "../schemas/installationSchema";
import productionSchema from "../schemas/productionSchema";
import projectSchema from "../schemas/projectSchema";
import { Request, Response } from "express";
import response from "../modules/response";
import emit from "../sockets/emits";
import path from "path";
import fs from "fs";
import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads");

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const uniqueFilename = `${timestamp}-${file.originalname.replace(
      /\s+/g,
      "_"
    )}`;
    cb(null, uniqueFilename);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 },
}).array("files", 20);

export default {
  upload,
  uploadFiles: async (req: Request, res: Response) => {
    if (!req.files || req.files.length === 0) {
      return response(res, false, null, "Failai neįkelti");
    }

    try {
      const filesArray = req.files as Express.Multer.File[];
      const filePaths = filesArray.map((file) => `/uploads/${file.filename}`);

      const { category, _id } = req.body;

      let project;
      if (category === "production")
        project = await productionSchema.findById(_id);
      else project = await projectSchema.findById(_id);

      if (!project) {
        return response(res, false, null, "Klaida įkeliant failus");
      }

      project.files = [...(project.files || []), ...filePaths];
      const newData = await project.save();

      if (!newData) {
        return response(res, false, null, "Klaida saugant duomenis");
      }
      const responseData = { _id, files: newData.files };

      if (category === "production") {
        emit.toAdmin("updateProductionFiles", responseData);
        emit.toProduction("updateProductionFiles", responseData);
        emit.toWarehouse("updateProductionFiles", responseData);
      } else {
        emit.toAdmin("updateProjectFiles", responseData);
        emit.toInstallation("updateProjectFiles", responseData);
        emit.toProduction("updateProjectFiles", responseData);
        emit.toWarehouse("updateProjectFiles", responseData);
      }

      return response(res, true, responseData, "Failai sėkmingai įkelti");
    } catch (error) {
      console.error("Error:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  deleteFiles: async (req: Request, res: Response) => {
    try {
      const { files, category, _id } = req.body;

      let data;
      if (category === "production")
        data = await productionSchema.findById(_id);
      else data = await projectSchema.findById(_id);

      if (!data) return response(res, false, null, "Serverio klaida");

      if (!files || !Array.isArray(files) || files.length === 0) {
        return response(res, false, null, "Nepasirinkti failai");
      }

      const deletePromises = files.map((filePath: string) => {
        const sanitizedPath = path.join(__dirname, "..", filePath);
        return new Promise((resolve, reject) => {
          fs.unlink(sanitizedPath, (err: any) => {
            if (err) {
              if (err.code === "ENOENT") {
                console.warn(`File not found, skipping: ${filePath}`);
                return resolve(`File not found, skipped: ${filePath}`);
              }
              console.error(`Error deleting ${filePath}:`, err);
              return reject(`Nepavyko ištrinti failo: ${filePath}`);
            }
            resolve(`Failas ištrintas: ${filePath}`);
          });
        });
      });

      await Promise.all(deletePromises);
      data.files = data.files.filter((file: string) => !files.includes(file));
      const newData = await data.save();

      const responseData = { _id, files: newData.files };

      if (category === "production") {
        emit.toAdmin("updateProductionFiles", responseData);
        emit.toProduction("updateProductionFiles", responseData);
        emit.toWarehouse("updateProductionFiles", responseData);
      } else {
        emit.toAdmin("updateProjectFiles", responseData);
        emit.toProduction("updateProjectFiles", responseData);
        emit.toWarehouse("updateProjectFiles", responseData);
        emit.toInstallation("updateProjectFiles", responseData);
      }

      return response(res, true, responseData, "Failai sėkmingai ištrinti");
    } catch (error) {
      console.error("Error:", error);
      return response(res, false, null, `Serverio klaida: ${error.message}`);
    }
  },
};
