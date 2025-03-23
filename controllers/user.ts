import userSchema from "../schemas/userSchema";
import { Request, Response } from "express";
import response from "../modules/response";
import { User } from "../data/interfaces";
import io from "../sockets/main";
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
      const { selectedUserId, password } = req.body;

      const user = res.locals.user;

      const data: User | null = await userSchema.findById(user._id);

      if (!data) return response(res, false, null, "Vartotojas nerastas");

      const selectedUser: any = await userSchema.findById(selectedUserId);

      if (!selectedUser) return response(res, false, null, "Pasirinktas vartotojas nerastas");

      const isPasswordValid = await bcrypt.compare(password, data.password);

      if (isPasswordValid) {
        await userSchema.findByIdAndDelete(selectedUserId);
        return response(res, true, null, "Pakeitimai atlikti");
      } else return response(res, false, null, "Klaidingas slaptažodis");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// update requests /////////////////////////////////

  updateProfile: async (req: Request, res: Response) => {
    try {
      const { _id, field, value } = req.body;
      const data = await userSchema.findById(_id);

      if (!data) return response(res, false, null, "Vartotojas nerastas");

      if (field === "phone") data.phone = value;
      if (field === "name") data.lastName = value;
      if (field === "password") {
        if (value.trim() !== "") {
          data.password = await bcrypt.hash(value, +process.env.salt!);
        }
      }

      const newData = await data.save();

      newData.password = "";

      return response(res, true, newData, "Pakeitimai išsaugoti");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  updateUser: async (req: Request, res: Response) => {
    try {
      const { selectedUserId, value, changeType } = req.body;

      const selectedUser: any = await userSchema.findById(selectedUserId);

      if (!selectedUser) return response(res, false, null, "Pasirinktas vartotojas nerastas");

      if (changeType === "admin") {
        selectedUser.accountType = value;

        const newUser = await selectedUser.save();
        newUser.password = "";

        return response(res, true, newUser, "Pakeitimai atlikti");
      }

      if (changeType === "verify") {
        selectedUser.verified = !selectedUser.verified;

        const newUser = await selectedUser.save();
        newUser.password = "";

        return response(res, true, newUser, "Pakeitimai atlikti");
      } else return response(res, false, null, "Neteisinga užklausa");
    } catch (error) {
      console.error("Klaida:", error);
      return response(res, false, null, "Serverio klaida");
    }
  },

  //////////////////// post requests ///////////////////////////////////
};
