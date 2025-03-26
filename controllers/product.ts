import productSchema from "../schemas/productSchema";
import { Product } from "../data/interfaces";
import { Request, Response } from "express";
import response from "../modules/response";
import emit from "../sockets/emits";

export default {
  //////////////////// get requests ////////////////////////////////////

  getProducts: async (req: Request, res: Response) => {
    try {
      const data = await productSchema.find();

      if (!data) return response(res, false, null, "Produktai nerasti");

      const borteliai: Product[] = [];
      const darbai: Product[] = [];
      const kita: Product[] = [];
      const laikikliai: Product[] = [];
      const skersiniai: Product[] = [];
      const stulpai: Product[] = [];
      const tvoros: Product[] = [];
      const vartai: Product[] = [];

      data.forEach((item) => {
        if (item.category.toLowerCase() === "borteliai") borteliai.push(item);
        if (item.category.toLowerCase() === "darbai") darbai.push(item);
        if (item.category.toLowerCase() === "kita") kita.push(item);
        if (item.category.toLowerCase() === "laikikliai") laikikliai.push(item);
        if (item.category.toLowerCase() === "skersiniai") skersiniai.push(item);
        if (item.category.toLowerCase() === "stulpai") stulpai.push(item);
        if (item.category.toLowerCase() === "tvoros") tvoros.push(item);
        if (item.category.toLowerCase() === "vartai") vartai.push(item);
      });

      borteliai.sort(compare);
      darbai.sort(compare);
      kita.sort(compare);
      laikikliai.sort(compare);
      skersiniai.sort(compare);
      stulpai.sort(compare);
      tvoros.sort(compare);
      vartai.sort(compare);

      function compare(a: Product, b: Product) {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
      }

      const sortedData = [
        ...borteliai,
        ...darbai,
        ...kita,
        ...laikikliai,
        ...skersiniai,
        ...stulpai,
        ...tvoros,
        ...vartai,
      ];

      return response(res, true, sortedData);
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// delete requests /////////////////////////////////

  deleteProduct: async (req: Request, res: Response) => {
    try {
      const { _id } = req.params;

      const data = await productSchema.findByIdAndDelete(_id);

      if (!data) return response(res, false, null, "Produktas nerastas");

      emit.toAdmin("deleteProduct", { _id });

      return response(res, true, { _id }, "Produktas ištrintas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// update requests /////////////////////////////////

  updateProduct: async (req: Request, res: Response) => {
    try {
      const { name, price, cost, _id, category } = req.body;

      const updatedData = {
        name,
        price,
        cost,
        category,
      };

      const responseData = await productSchema.findByIdAndUpdate(
        _id,
        updatedData,
        {
          new: true,
        }
      );

      if (!responseData)
        return response(res, false, null, "Produktas neegzistuoja");

      emit.toAdmin("updateProduct", responseData);

      return response(res, true, responseData, "Pakeitimai atlikti");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// post requests ///////////////////////////////////

  newProduct: async (req: Request, res: Response) => {
    try {
      const { name, price, cost, image, category } = req.body;

      const doesExist = await productSchema.findOne({ name });

      if (doesExist)
        return response(res, false, null, "Produktas jau egzistuoja");

      const product = new productSchema({
        name,
        price: price || 0,
        cost: cost || 0,
        image: image || "",
        category: category || "Kita",
      });

      const responseData = await product.save();

      emit.toAdmin("newProduct", responseData);

      return response(res, true, responseData, "Pakeitimai atlikti");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },
};
