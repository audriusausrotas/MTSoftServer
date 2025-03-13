import type { Photo } from "../data/interfaces";
import { v2 as cloudinary } from "cloudinary";

export default async (photos: Photo[]) => {
  cloudinary.config({
    cloud_name: process.env.cloudinaryCloudName as string,
    api_key: process.env.cloudinaryApiKey as string,
    api_secret: process.env.cloudinaryApiSecret as string,
  });

  const deletePromises = photos.map((photo) =>
    cloudinary.uploader.destroy(photo.id)
  );
  await Promise.all(deletePromises);
};
