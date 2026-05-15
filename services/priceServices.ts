import fenceSchema from "../schemas/fenceSchema";
import gatePriceSchema from "../schemas/gatePriceSchema";
import productSchema from "../schemas/productSchema";

export async function getFencePrices() {
  const data = await fenceSchema.find();
  if (data.length === 0) throw new Error("Tvoros nerastos");
  return data;
}

export async function getGatePrices() {
  const data = await gatePriceSchema.find();
  if (data.length === 0) throw new Error("Vartai nerasti");
  return data;
}

export async function getProductPrices() {
  const data = await productSchema.find();
  if (data.length === 0) throw new Error("Produktai nerasti");
  return data;
}
