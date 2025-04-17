import potentialUnsuscribedSchema from "../schemas/potentialUnsuscribedSchema";
import potentialClientSchema from "../schemas/potentialClientSchema";
import { Request, Response } from "express";
import response from "../modules/response";
import emit from "../sockets/emits";

export default {
  //////////////////// get requests ////////////////////////////////////

  getUsers: async (req: Request, res: Response) => {
    try {
      const responseData = await potentialClientSchema.find();

      if (responseData.length === 0) return response(res, false, null, "Vartotojai nerasti");

      const statusOrder = ["Nežinoma", "Domina", "Nelabai domina", "Nedomina"];

      responseData.sort((a, b) => {
        const statusA = statusOrder.indexOf(a.status);
        const statusB = statusOrder.indexOf(b.status);
        return statusA - statusB;
      });

      return response(res, true, responseData);
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// delete requests /////////////////////////////////

  deletePotentialClient: async (req: Request, res: Response) => {
    try {
      const { _id } = req.params;

      const user = await potentialClientSchema.findById(_id);

      if (!user) return response(res, false, null, "Klientas nerastas");

      await new potentialUnsuscribedSchema(user.toObject()).save();
      const data = await potentialClientSchema.findByIdAndDelete(_id);

      if (!data) return response(res, false, null, "Klaida trinant klientą");

      emit.toAdmin("deletePotentialClient", { _id });

      return response(res, true, { _id }, "Klientas perkeltas į atsisakiusiųjų sąrašą");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// update requests /////////////////////////////////

  updateClient: async (req: Request, res: Response) => {
    try {
      const { _id, name, email, phone, address, status } = req.body;

      const responseData = await potentialClientSchema.findByIdAndUpdate(
        _id,
        { name, email, phone, address, status },
        { new: true }
      );

      if (!responseData) return response(res, false, null, "Klaida atnaujinant duomenis");

      emit.toAdmin("updatePotentialClient", responseData);

      return response(res, true, responseData, "Klientas atnaujintas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  selectClients: async (req: Request, res: Response) => {
    try {
      const { _id, send, all, value } = req.body;

      if (all) {
        const data = await potentialClientSchema.updateMany({}, { send: value });

        if (data.modifiedCount < 1)
          return response(res, false, null, "Klaida atnaujinant duomenis");

        return response(res, true, { value }, "Atnaujinta");
      } else {
        const user = await potentialClientSchema.findByIdAndUpdate(_id, { send }, { new: true });

        if (!user) return response(res, false, null, "Klaida atnaujinant duomenis");

        const responseData = { _id, send };

        return response(res, true, responseData, "Atnaujinta");
      }
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// post requests ///////////////////////////////////

  newPotentialClient: async (req: Request, res: Response) => {
    try {
      const { name, email, phone, address, status } = req.body;

      console.log(name);
      const user = await potentialClientSchema.findOne({ email });

      const userUnsuscribed = await potentialUnsuscribedSchema.findOne({
        email,
      });

      if (user) return response(res, false, null, "Klientas jau egzistuoja");

      if (userUnsuscribed) return response(res, false, null, "Klientas atsisakė prenumeratos");

      const newUser = new potentialClientSchema({
        name,
        email,
        phone,
        address,
        status,
      });

      const responseData = await newUser.save();

      emit.toAdmin("newPotentialClient", responseData);

      return response(res, true, responseData, "Klientas sukurtas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },
};
