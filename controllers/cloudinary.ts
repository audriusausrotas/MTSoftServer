import { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import response from "../modules/response";
import projectSchema from "../schemas/projectSchema";
import installationSchema from "../schemas/installationSchema";
import productionSchema from "../schemas/productionSchema";
import { Photo } from "../data/interfaces";
import userSchema from "../schemas/userSchema";
require("dotenv").config();

export default {
  //////////////////// get requests ////////////////////////////////////
  //////////////////// delete requests /////////////////////////////////

  imageDelete: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      const result = await cloudinary.uploader.destroy(id);

      if (result.result !== "ok") {
        return response(res, false, null, "Nepavyko ištrinti nuotraukos");
      }

      return response(res, true, null, "Nuotrauka ištrinta");
    } catch (error) {
      console.error("Cloudinary Delete Error:", error);
      return response(res, false, error, "Klaida trinant nuotrauką");
    }
  },

  deletePhoto: async (req: Request, res: Response) => {
    try {
      const { _id, id, category } = req.body;

      let data: any;

      switch (category) {
        case "projects":
          data = await projectSchema.findById(_id);
          break;
        case "production":
          data = await productionSchema.findById(_id);
          break;
        case "installation":
          data = await installationSchema.findById(_id);
          break;

        default:
          break;
      }

      if (!data) return response(res, false, null, "Serverio klaida");

      data.files = data.files.filter((item: Photo) => item.id !== id);

      await data.save();

      cloudinary.config({
        cloud_name: process.env.cloudinaryCloudName,
        api_key: process.env.cloudinaryApiKey,
        api_secret: process.env.cloudinaryApiSecret,
      });

      cloudinary.uploader.destroy(id);

      return response(res, true, data, "Nuotrauka ištrinta");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// update requests /////////////////////////////////
  //////////////////// post requests ///////////////////////////////////

  addPhoto: async (req: Request, res: Response) => {
    try {
      const { photo, _id, category } = req.body;

      let data: any;

      switch (category) {
        case "profile":
          data = await userSchema.findById(_id);
          break;
        case "projects":
          data = await projectSchema.findById(_id);
          break;
        case "production":
          data = await productionSchema.findById(_id);
          break;
        case "installation":
          data = await installationSchema.findById(_id);
          break;

        default:
          break;
      }

      if (!data) return response(res, false, null, "Serverio klaida");

      if (category === "profile") data.photo = photo;
      else data.files.push(photo);

      const result = await data.save();

      if (category === "profile") result.password = "";

      return response(res, true, result, "Nuotrauka išsaugota");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// other ///////////////////////////////////////////

  signature: async (req: Request, res: Response) => {
    const { paramsToSign } = req.body;
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.cloudinaryApiSecret!
    );
    return res.send({ signature });
  },
};
