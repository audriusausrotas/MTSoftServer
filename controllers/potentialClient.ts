import potentialUnsuscribedSchema from "../schemas/potentialUnsuscribedSchema";
import potentialClientSchema from "../schemas/potentialClientSchema";
import { Request, Response } from "express";
import response from "../modules/response";
import io from "../sockets/main";

export default {
  //////////////////// get requests ////////////////////////////////////

  getUsers: async (req: Request, res: Response) => {
    try {
      const users = await potentialClientSchema.find();

      if (users.length === 0)
        return response(res, false, null, "Vartotojai nerasti");

      const statusOrder = ["Nežinoma", "Domina", "Nelabai domina", "Nedomina"];

      users.sort((a, b) => {
        const statusA = statusOrder.indexOf(a.status);
        const statusB = statusOrder.indexOf(b.status);
        return statusA - statusB;
      });

      return response(res, true, users);
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// delete requests /////////////////////////////////

  deleteClient: async (req: Request, res: Response) => {
    try {
      const { _id } = req.params;

      const user = await potentialClientSchema.findById(_id);

      if (!user) return response(res, false, null, "Klientas nerastas");

      await new potentialUnsuscribedSchema(user.toObject()).save();
      await potentialClientSchema.findByIdAndDelete(_id);

      return response(
        res,
        true,
        null,
        "Klientas perkeltas į atsisakiusiųjų sąrašą"
      );
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// update requests /////////////////////////////////

  updateClient: async (req: Request, res: Response) => {
    try {
      const { _id, name, email, phone, address, status } = req.body;

      const user = await potentialClientSchema.findByIdAndUpdate(
        _id,
        { name, email, phone, address, status },
        { new: true }
      );

      if (!user)
        return response(res, false, null, "Klaida atnaujinant duomenis");

      return response(res, true, user, "Klientas atnaujintas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  selectClients: async (req: Request, res: Response) => {
    try {
      const { _id, send, all, value } = req.body;

      if (all) {
        const data = await potentialClientSchema.updateMany(
          {},
          { send: value }
        );

        if (data.modifiedCount > 0)
          return response(res, true, response, "Atnaujinta");
        else return response(res, false, null, "Klaida atnaujinant duomenis");
      } else {
        const user = await potentialClientSchema.findByIdAndUpdate(
          _id,
          { send },
          { new: true }
        );

        if (!user)
          return response(res, false, null, "Klaida atnaujinant duomenis");

        return response(res, true, user, "Atnaujinta");
      }
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// post requests ///////////////////////////////////

  newClient: async (req: Request, res: Response) => {
    try {
      const { name, email, phone, address, status } = req.body;

      const user = await potentialClientSchema.findOne({ email });
      const userUnsuscribed = await potentialUnsuscribedSchema.findOne({
        email,
      });

      if (user) return response(res, false, null, "Klientas jau egzistuoja");

      if (userUnsuscribed)
        return response(res, false, null, "Klientas atsisakė prenumeratos");

      const newUser = new potentialClientSchema({
        name,
        email,
        phone,
        address,
        status,
      });

      const data = await newUser.save();

      return response(res, true, data, "Klientas sukurtas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },
};
