import { Request, Response, NextFunction } from "express";
import response from "../modules/response";
import { User } from "../data/interfaces";
require("dotenv").config();

export default (req: Request, res: Response, next: NextFunction) => {
  const user: User = res.locals.user;

  if (user.accountType === "Gamyba") {
    const { selectedMachine, selectedHolesInfo, field } = req.body;

    if (!selectedMachine) return response(res, false, null, "Pasirinkite stakles");

    if (selectedMachine.includes("Lenkimo")) {
      if (!selectedHolesInfo) return response(res, false, null, "Pasirinkite skylučių informaciją");
      if (field === "cut") return response(res, false, null, "Pasirinktos neitnkamos staklės");
    }

    if (selectedMachine.includes("Pjovimo")) {
      if (field === "done" || field === "holes")
        return response(res, false, null, "Pasirinktos neitnkamos staklės");
    }

    if (selectedMachine.includes("Skylučių")) {
      if (field === "done" || field === "cut")
        return response(res, false, null, "Pasirinktos neitnkamos staklės");
    }
  }
  next();
};
