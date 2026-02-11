import mongoose from "mongoose";
import type { Image, WebsiteSettings } from "../data/interfaces";

const ImageSchema = new mongoose.Schema<Image>(
  {
    name: { type: String, required: false, default: "" },
    url: { type: String, required: false, default: "" },
    alt: { type: String, required: false, default: "" },
    altEN: { type: String, required: false, default: "" },
  },
  { _id: false },
);

const websiteSettingsSchema = new mongoose.Schema<WebsiteSettings>({
  gallery: { type: [ImageSchema], required: false, default: [] },
  funded: { type: [ImageSchema], required: false, default: [] },
});

websiteSettingsSchema.index({ "gallery.url": 1 }, { unique: true });

export default mongoose.model("websiteSettings", websiteSettingsSchema, "websiteSettings");
