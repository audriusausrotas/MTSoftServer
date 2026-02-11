import websiteSettingsSchema from "../schemas/websiteSettingsSchema";
import { Request, Response } from "express";
import response from "../modules/response";
import emit from "../sockets/emits";
import { Image } from "../data/interfaces";

export default {
  //////////////////// get requests ////////////////////////////////////

  getWebsiteSettings: async (req: Request, res: Response) => {
    try {
      const resnposeData = await websiteSettingsSchema.findOne({});

      if (!resnposeData) return response(res, false, null, "Nustatymai nerasti");

      return response(res, true, resnposeData);
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  getGallery: async (req: Request, res: Response) => {
    try {
      const resnposeData = await websiteSettingsSchema.findOne({});
      if (!resnposeData) return response(res, false, null, "Nustatymai nerasti");

      return response(res, true, resnposeData.gallery);
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  getFunded: async (req: Request, res: Response) => {
    try {
      const resnposeData = await websiteSettingsSchema.findOne({});
      if (!resnposeData) return response(res, false, null, "Nustatymai nerasti");

      return response(res, true, resnposeData.funded);
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// delete requests /////////////////////////////////

  deleteGalleryImage: async (req: Request, res: Response) => {
    try {
      const { url } = req.body;

      const data = await websiteSettingsSchema.findOneAndUpdate(
        {},
        {
          $pull: {
            gallery: { url },
          },
        },
        { new: true },
      );

      if (!data) return response(res, false, null, "Klaida trinant");

      emit.toAdmin("deleteGalleryImage", url);

      return response(res, true, null, "Ištrinta");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  deleteFundedImage: async (req: Request, res: Response) => {
    try {
      const { url } = req.body;

      const data = await websiteSettingsSchema.findOneAndUpdate(
        {},
        {
          $pull: {
            funded: { url },
          },
        },
        { new: true },
      );

      if (!data) return response(res, false, null, "Klaida trinant");

      emit.toAdmin("deleteFundedImage", url);

      return response(res, true, null, "Ištrinta");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// update requests /////////////////////////////////

  updateGalleryImage: async (req: Request, res: Response) => {
    try {
      const { name, url, alt, altEN, index } = req.body;

      const data = await websiteSettingsSchema.findOneAndUpdate(
        {},
        {
          $set: {
            [`gallery.${index}.name`]: name,
            [`gallery.${index}.url`]: url,
            [`gallery.${index}.alt`]: alt,
            [`gallery.${index}.altEN`]: altEN,
          },
        },
        { new: true },
      );

      if (!data) return response(res, false, null, "Klaida saugant duomenis");

      const responseData = { data: data.gallery[index], index };

      emit.toAdmin("updateGalleryImage", { index, image: responseData });

      return response(res, true, responseData, "Atnaujinta");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  updateFundedImage: async (req: Request, res: Response) => {
    try {
      const { name, url, alt, altEN, index } = req.body;

      const data = await websiteSettingsSchema.findOneAndUpdate(
        {},
        {
          $set: {
            [`funded.${index}.name`]: name,
            [`funded.${index}.url`]: url,
            [`funded.${index}.alt`]: alt,
            [`funded.${index}.altEN`]: altEN,
          },
        },
        { new: true },
      );

      if (!data) return response(res, false, null, "Klaida saugant duomenis");

      const responseData = { data: data.gallery[index], index };

      emit.toAdmin("updateFundedImage", { index, image: responseData });

      return response(res, true, responseData, "Atnaujinta");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// post requests ///////////////////////////////////

  newGalleryImage: async (req: Request, res: Response) => {
    try {
      const { name, url, alt, altEN } = req.body;

      const newImage: Image = { name, url, alt, altEN };

      const data = await websiteSettingsSchema.findOneAndUpdate(
        {},
        { $push: { gallery: newImage } },
        { new: true, upsert: true },
      );

      if (!data) return response(res, false, null, "Klaida saugant duomenis");

      const responseData = newImage;

      emit.toAdmin("newGalleryImage", responseData);

      return response(res, true, responseData, "Išsaugota");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  newFundedImage: async (req: Request, res: Response) => {
    try {
      const { name, url, alt, altEN } = req.body;

      const newImage: Image = { name, url, alt, altEN };

      const data = await websiteSettingsSchema.findOneAndUpdate(
        {},
        { $push: { funded: newImage } },
        { new: true, upsert: true },
      );

      if (!data) return response(res, false, null, "Klaida saugant duomenis");

      const responseData = newImage;

      emit.toAdmin("newFundedImage", responseData);

      return response(res, true, responseData, "Išsaugota");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },
};
