import userSchema from "../schemas/userSchema";
import { Request, Response } from "express";
import response from "../modules/response";
import { User } from "../data/interfaces";
import emit from "../sockets/emits";
import bcrypt from "bcrypt";
require("dotenv").config();

export default {
  //////////////////// get requests ////////////////////////////////////

  getUsers: async (req: Request, res: Response) => {
    try {
      const data: User[] = await userSchema.find();

      if (!data) return response(res, false, null, "Vartotojai nerasti");

      const updatedData = data.map((item) => {
        item.password = "";
        return item;
      });

      return response(res, true, updatedData);
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// delete requests /////////////////////////////////

  deleteUser: async (req: Request, res: Response) => {
    try {
      const { _id, password } = req.body;

      const user = res.locals.user;

      const data: User | null = await userSchema.findById(user._id);

      if (!data) return response(res, false, null, "Vartotojas nerastas");

      const userToDelete: any = await userSchema.findById(_id);

      if (!userToDelete)
        return response(res, false, null, "Pasirinktas vartotojas nerastas");

      const isPasswordValid = await bcrypt.compare(password, data.password);

      if (!isPasswordValid)
        return response(res, false, null, "Klaidingas slaptažodis");

      const deletedUser = await userSchema.findByIdAndDelete(_id);

      if (!deletedUser)
        return response(res, false, null, "Klaidinga trinant vartotoją");

      emit.toAdmin("deleteUser", { _id });

      return response(res, true, null, "Pakeitimai atlikti");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// update requests /////////////////////////////////

  updateProfile: async (req: Request, res: Response) => {
    try {
      const { _id, field, value } = req.body;
      const user = await userSchema.findById(_id);

      if (!user) return response(res, false, null, "Vartotojas nerastas");

      if (field === "phone") user.phone = value;
      if (field === "name") user.lastName = value;
      if (field === "password") {
        if (value.trim() !== "") {
          user.password = await bcrypt.hash(value, +process.env.salt!);
        }
      }

      const data = await user.save();

      data.password = "";

      emit.toAdmin("updateUser", data);

      return response(res, true, data, "Pakeitimai išsaugoti");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  updateUser: async (req: Request, res: Response) => {
    try {
      const { _id, value, changeType } = req.body;

      const user: any = await userSchema.findById(_id);

      if (!user)
        return response(res, false, null, "Pasirinktas vartotojas nerastas");

      if (changeType === "admin") {
        user.accountType = value;
      }

      if (changeType === "verify") {
        user.verified = !user.verified;
      }

      const data = await user.save();
      data.password = "";

      emit.toAdmin("updateUser", data);

      return response(res, true, data, "Pakeitimai atlikti");
      // } else return response(res, false, null, "Neteisinga užklausa");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// post requests ///////////////////////////////////
};
