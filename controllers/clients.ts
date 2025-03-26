import clientSchema from "../schemas/clientSchema";
import { Request, Response } from "express";
import response from "../modules/response";
import emit from "../sockets/emits";

export default {
  //////////////////// get requests ////////////////////////////////////

  getClients: async (req: Request, res: Response) => {
    try {
      const clients = await clientSchema.find();

      if (!clients.length)
        return response(res, false, null, "Klientai nerasti");

      return response(res, true, clients);
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// delete requests /////////////////////////////////

  deleteClient: async (req: Request, res: Response) => {
    try {
      const { _id } = req.params;

      const deletedClient = await clientSchema.findByIdAndDelete(_id);

      if (!deletedClient)
        return response(res, false, null, "Klientas nerastas");

      emit.toAdmin("deleteClient", _id);

      return response(res, true, { _id }, "Klientas ištrintas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// update requests /////////////////////////////////

  //////////////////// post requests ///////////////////////////////////

  newClient: async (req: Request, res: Response) => {
    try {
      const { username, email, phone, address } = req.body;

      const clientExist = await clientSchema.findOne({ email });

      if (clientExist)
        return response(res, false, null, "Klientas jau egzistuoja");

      const client = new clientSchema({
        username,
        email,
        phone,
        address,
      });

      const responseData = await client.save();

      emit.toAdmin("newClient", responseData);

      return response(res, true, responseData, "Klientas išsaugotas");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },
};
