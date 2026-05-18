import defaultValuesSchema from "../schemas/defaultValuesSchema";

export async function getDefaultValues() {
  const data = await defaultValuesSchema.find();
  if (!data) throw new Error("Default values not found");
  return data;
}
