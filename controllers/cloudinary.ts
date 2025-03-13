import { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import response from "../modules/response";
require("dotenv").config();

export default {
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

  signature: async (req: Request, res: Response) => {
    const { paramsToSign } = req.body;
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.cloudinaryApiSecret!
    );
    return res.send({ signature });
  },
};
