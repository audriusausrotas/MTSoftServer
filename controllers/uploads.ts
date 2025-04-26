// import installationSchema from "../schemas/installationSchema";
// import productionSchema from "../schemas/productionSchema";
// import projectSchema from "../schemas/projectSchema";
// import { Request, Response } from "express";
// import response from "../modules/response";
// import emit from "../sockets/emits";
// import multer from "multer";
// import path from "path";
// import fs from "fs";

// export default {
//   uploadFiles: (req: Request, res: Response) => {
//     console.log("Request received at /uploadFiles");
//     console.log("Body:", req.body);
//     console.log("Files:", req.files);
//     upload(req, res, async (err) => {
//       if (err) {
//         return response(res, false, null, "Klaida įkeliant failus");
//       }

//       if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
//         return response(res, false, null, "Failai neįkelti");
//       }
//       try {
//         const filesArray = req.files as Express.Multer.File[];
//         const filePaths = filesArray.map((file) => `/uploads/${file.filename}`);

//         const { category, _id } = req.body;
//         console.log(req.body);
//         let project;

//         if (category === "projects") project = await projectSchema.findById(_id);
//         else if (category === "production") project = await productionSchema.findById(_id);
//         else if (category === "installation") project = await installationSchema.findById(_id);
//         console.log(project);
//         if (!project) return response(res, false, null, "Klaida įkeliant failus");

//         project.files = [...(project.files || []), ...filePaths];

//         const newData = await project?.save();

//         if (!newData) response(res, false, null, "Klaida saugant duomenis");

//         const responseData = { _id, files: filePaths };

//         if (category === "projects") {
//           emit.toAdmin("updateProjectFiles", responseData);
//         } else if (category === "production") {
//           emit.toAdmin("updateProductionFiles", responseData);
//           emit.toProduction("updateProductionFiles", responseData);
//           emit.toWarehouse("updateProductionFiles", responseData);
//         } else if (category === "installation") {
//           emit.toAdmin("updateInstallationFiles", responseData);
//           emit.toProduction("updateInstallationFiles", responseData);
//           emit.toWarehouse("updateInstallationFiles", responseData);
//         }

//         return response(res, true, responseData, "Failai sėkmingai įkelti");
//       } catch (error) {
//         console.log("Klaida", error);
//         return response(res, false, null, "Serverio klaida");
//       }
//     });
//   },

//   deleteFiles: async (req: Request, res: Response) => {
//     try {
//       const { files, category, _id } = req.body;

//       let data;

//       if (category === "projects") {
//         data = await projectSchema.findById(_id);
//       } else if (category === "production") {
//         data = await productionSchema.findById(_id);
//       } else if (category === "installation") {
//         data = await installationSchema.findById(_id);
//       }

//       if (!data) return response(res, false, null, "Serverio klaida");

//       if (!files || !Array.isArray(files) || files.length === 0) {
//         return response(res, false, null, "Nepasirinkti failai");
//       }

//       const deletePromises = files.map((filePath: string) => {
//         const sanitizedPath = path.join(__dirname, "..", filePath);

//         return new Promise((resolve, reject) => {
//           fs.unlink(sanitizedPath, (err) => {
//             if (err) {
//               console.error(`Klaida ${filePath}:`, err);
//               return reject(`Nepavyko ištrinti failo: ${filePath}`);
//             }
//             resolve(`Failas ištrintas: ${filePath}`);
//           });
//         });
//       });

//       await Promise.all(deletePromises);

//       data.files = data.files.filter((file: string) => !files.includes(file));

//       const newData = await data.save();

//       const responseData = { _id, files: newData.files };

//       if (category === "projects") {
//         emit.toAdmin("updateProjectFiles", responseData);
//       } else if (category === "production") {
//         emit.toAdmin("updateProductionFiles", responseData);
//         emit.toProduction("updateProductionFiles", responseData);
//         emit.toWarehouse("updateProductionFiles", responseData);
//       } else if (category === "installation") {
//         emit.toAdmin("updateInstallationFiles", responseData);
//         emit.toProduction("updateInstallationFiles", responseData);
//         emit.toWarehouse("updateInstallationFiles", responseData);
//       }

//       return response(res, true, responseData, "Failai sėkmingai ištrinti");
//     } catch (error) {
//       console.log("Klaida", error);
//       return response(res, false, null, "Serverio klaida");
//     }
//   },
// };

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.join(__dirname, "../uploads"));
//   },
//   filename: (req, file, cb) => {
//     const timestamp = Date.now();
//     const originalName = file.originalname.replace(/\s+/g, "_");
//     const uniqueFilename = `${timestamp}-${originalName}`;

//     cb(null, uniqueFilename);
//   },
// });

// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 10 * 1024 * 1024 },
// }).array("files", 10);

import installationSchema from "../schemas/installationSchema";
import productionSchema from "../schemas/productionSchema";
import projectSchema from "../schemas/projectSchema";
import { Request, Response } from "express";
import response from "../modules/response";
import emit from "../sockets/emits";
import path from "path";
import fs from "fs";
import multer from "multer";

// export default {
//   uploadFiles: async (req: Request, res: Response) => {
//     if (!req.files || req.files.length === 0) {
//       return response(res, false, null, "Failai neįkelti");
//     }

//     try {
//       const filesArray = req.files as Express.Multer.File[];
//       const filePaths = filesArray.map((file) => `/uploads/${file.filename}`);

//       const { category, _id } = req.body;

//       let project;
//       if (category === "projects") project = await projectSchema.findById(_id);
//       else if (category === "production") project = await productionSchema.findById(_id);
//       else if (category === "installation") project = await installationSchema.findById(_id);

//       if (!project) return response(res, false, null, "Klaida įkeliant failus");

//       project.files = [...(project.files || []), ...filePaths];
//       const newData = await project.save();

//       if (!newData) return response(res, false, null, "Klaida saugant duomenis");

//       const responseData = { _id, files: filePaths };

//       if (category === "projects") {
//         emit.toAdmin("updateProjectFiles", responseData);
//       } else if (category === "production") {
//         emit.toAdmin("updateProductionFiles", responseData);
//         emit.toProduction("updateProductionFiles", responseData);
//         emit.toWarehouse("updateProductionFiles", responseData);
//       } else if (category === "installation") {
//         emit.toAdmin("updateInstallationFiles", responseData);
//         emit.toProduction("updateInstallationFiles", responseData);
//         emit.toWarehouse("updateInstallationFiles", responseData);
//       }

//       return response(res, true, responseData, "Failai sėkmingai įkelti");
//     } catch (error) {
//       console.error("Error:", error);
//       return response(res, false, null, "Serverio klaida");
//     }
//   },

//   deleteFiles: async (req: Request, res: Response) => {
//     try {
//       const { files, category, _id } = req.body;

//       let data;
//       if (category === "projects") data = await projectSchema.findById(_id);
//       else if (category === "production") data = await productionSchema.findById(_id);
//       else if (category === "installation") data = await installationSchema.findById(_id);

//       if (!data) return response(res, false, null, "Serverio klaida");

//       if (!files || !Array.isArray(files) || files.length === 0) {
//         return response(res, false, null, "Nepasirinkti failai");
//       }

//       const deletePromises = files.map((filePath: string) => {
//         const sanitizedPath = path.join(__dirname, "..", filePath);
//         return new Promise((resolve, reject) => {
//           fs.unlink(sanitizedPath, (err: any) => {
//             if (err) {
//               console.error(`Error deleting ${filePath}:`, err);
//               return reject(`Nepavyko ištrinti failo: ${filePath}`);
//             }
//             resolve(`Failas ištrintas: ${filePath}`);
//           });
//         });
//       });

//       await Promise.all(deletePromises);

//       data.files = data.files.filter((file: string) => !files.includes(file));
//       const newData = await data.save();

//       const responseData = { _id, files: newData.files };

//       if (category === "projects") {
//         emit.toAdmin("updateProjectFiles", responseData);
//       } else if (category === "production") {
//         emit.toAdmin("updateProductionFiles", responseData);
//         emit.toProduction("updateProductionFiles", responseData);
//         emit.toWarehouse("updateProductionFiles", responseData);
//       } else if (category === "installation") {
//         emit.toAdmin("updateInstallationFiles", responseData);
//         emit.toProduction("updateInstallationFiles", responseData);
//         emit.toWarehouse("updateInstallationFiles", responseData);
//       }

//       return response(res, true, responseData, "Failai sėkmingai ištrinti");
//     } catch (error) {
//       console.error("Error:", error);
//       return response(res, false, null, "Serverio klaida");
//     }
//   },

//   upload: () => {
//     const storage = multer.diskStorage({
//       destination: (req, file, cb) => {
//         const uploadPath = path.join(__dirname, "../uploads");

//         if (!fs.existsSync(uploadPath)) {
//           fs.mkdirSync(uploadPath, { recursive: true });
//           console.log("📁 Created uploads directory:", uploadPath);
//         }

//         cb(null, uploadPath);
//       },
//       filename: (req, file, cb) => {
//         const timestamp = Date.now();
//         const uniqueFilename = `${timestamp}-${file.originalname.replace(/\s+/g, "_")}`;
//         cb(null, uniqueFilename);
//       },
//     });

//     return multer({
//       storage: storage,
//       limits: { fileSize: 20 * 1024 * 1024 },
//     }).array("files", 20);
//   },
// };

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
    const uniqueFilename = `${timestamp}-${file.originalname.replace(/\s+/g, "_")}`;
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
      if (category === "projects") project = await projectSchema.findById(_id);
      else if (category === "production") project = await productionSchema.findById(_id);
      else if (category === "installation") project = await installationSchema.findById(_id);

      if (!project) {
        console.error("❌ Project not found in DB!");
        return response(res, false, null, "Klaida įkeliant failus");
      }

      project.files = [...(project.files || []), ...filePaths];
      const newData = await project.save();

      if (!newData) {
        console.error("❌ Error saving project files!");
        return response(res, false, null, "Klaida saugant duomenis");
      }

      return response(res, true, { _id, files: filePaths }, "Failai sėkmingai įkelti");
    } catch (error) {
      console.error("❌ Server error during file upload:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  deleteFiles: async (req: Request, res: Response) => {
    try {
      const { files, category, _id } = req.body;

      let data;
      if (category === "projects") data = await projectSchema.findById(_id);
      else if (category === "production") data = await productionSchema.findById(_id);
      else if (category === "installation") data = await installationSchema.findById(_id);

      if (!data) return response(res, false, null, "Serverio klaida");

      if (!files || !Array.isArray(files) || files.length === 0) {
        return response(res, false, null, "Nepasirinkti failai");
      }

      const deletePromises = files.map((filePath: string) => {
        const sanitizedPath = path.join(__dirname, "..", filePath);
        return new Promise((resolve, reject) => {
          fs.unlink(sanitizedPath, (err: any) => {
            if (err) {
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

      if (category === "projects") {
        emit.toAdmin("updateProjectFiles", responseData);
      } else if (category === "production") {
        emit.toAdmin("updateProductionFiles", responseData);
        emit.toProduction("updateProductionFiles", responseData);
        emit.toWarehouse("updateProductionFiles", responseData);
      } else if (category === "installation") {
        emit.toAdmin("updateInstallationFiles", responseData);
        emit.toProduction("updateInstallationFiles", responseData);
        emit.toWarehouse("updateInstallationFiles", responseData);
      }

      return response(res, true, responseData, "Failai sėkmingai ištrinti");
    } catch (error) {
      console.error("Error:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },
};
