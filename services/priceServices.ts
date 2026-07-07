import { FenceSetup, Gates, Product } from "../data/interfaces";
import fenceSchema from "../schemas/fenceSchema";
import gatePriceSchema from "../schemas/gatePriceSchema";
import productSchema from "../schemas/productSchema";

export async function getFencePrices() {
  const data: FenceSetup[] = await fenceSchema.find().lean();
  if (data.length === 0) throw new Error("Tvoros nerastos");
  return data;
}

export async function getGatePrices() {
  const data: Gates[] = await gatePriceSchema.find();
  if (data.length === 0) throw new Error("Vartai nerasti");
  return data;
}

export async function getProductPrices() {
  const data: Product[] = await productSchema.find().lean();
  if (data.length === 0) throw new Error("Produktai nerasti");
  return data;
}
