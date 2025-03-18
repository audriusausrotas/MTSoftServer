import response from "../modules/response";
import deletedSchema from "../schemas/deletedSchema";
import montavimasSchema from "../schemas/installationSchema";
import projectSchema from "../schemas/projectSchema";
import io from "../sockets/main";
import { Request, Response } from "express";
require("dotenv").config();

interface RegisterRequestBody {
  email: string;
  password: string;
  retypePassword: string;
  username: string;
}

export default {
  //////////////////// get requests ////////////////////////////////////
  //////////////////// delete requests /////////////////////////////////
  //////////////////// update requests /////////////////////////////////
  //////////////////// post requests ///////////////////////////////////
};
