import supplierSchema from "../schemas/supplierSchema";
import { Request, Response } from "express";
import response from "../modules/response";
import emit from "../sockets/emits";

export default {
  //////////////////// get requests ////////////////////////////////////

  getSuppliers: async (req: Request, res: Response) => {
    try {
      const suppliers = await supplierSchema.find();

      if (!suppliers.length) return response(res, false, null, "Klientai nerasti");

      return response(res, true, suppliers);
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// delete requests /////////////////////////////////

  deleteSupplier: async (req: Request, res: Response) => {
    try {
      const { _id } = req.params;

      const deletedSupplier = await supplierSchema.findByIdAndDelete(_id);

      if (!deletedSupplier) return response(res, false, null, "Klientas nerastas");

      emit.toAdmin("deleteSupplier", { _id });

      return response(res, true, { _id }, "Tiekėjas ištrintas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// update requests /////////////////////////////////

  //////////////////// post requests ///////////////////////////////////

  newSupplier: async (req: Request, res: Response) => {
    try {
      const { username, email, phone, address } = req.body;

      const supplierExist = await supplierSchema.findOne({ email });

      if (supplierExist) return response(res, false, null, "Klientas jau egzistuoja");

      const supplier = new supplierSchema({
        username,
        email,
        phone,
        address,
      });

      const responseData = await supplier.save();

      emit.toAdmin("newSupplier", responseData);

      return response(res, true, responseData, "Klientas išsaugotas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },
};
