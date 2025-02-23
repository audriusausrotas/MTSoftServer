"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userSchema_1 = __importDefault(require("../schemas/userSchema"));
const response_1 = __importDefault(require("../modules/response"));
const main_1 = __importDefault(require("../sockets/main"));
require("dotenv").config();
exports.default = {
    register: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { email, password, username } = req.body;
        const userExists = yield userSchema_1.default.findOne({ email });
        if (userExists) {
            return (0, response_1.default)(res, false, null, "Vartotojas jau egzistuoja");
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, parseInt(process.env.SALT));
        const user = new userSchema_1.default({
            username,
            email,
            password: hashedPassword,
        });
        const newUser = yield user.save;
        if (newUser) {
            newUser.password = "";
            main_1.default.emit("newUser", newUser);
        }
        return (0, response_1.default)(res, true, null, "Sėkmingai prisiregistruota");
    }),
    ///////////////////////////////////////////////////////////////////
    login: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { email, password } = req.body;
        const data = yield userSchema_1.default.findOne({ email });
        if (!data) {
            return (0, response_1.default)(res, false, null, "Vartotojas nerastas");
        }
        if (!data.verified) {
            return (0, response_1.default)(res, false, null, "Vartotojas nepatvirtintas");
        }
        const passwordMatch = yield bcrypt_1.default.compare(password, data.password);
        if (!passwordMatch) {
            return (0, response_1.default)(res, false, null, "Neteisingas slaptažodis");
        }
        const token = jsonwebtoken_1.default.sign({
            id: data._id,
            email: data.email,
            verified: data.verified,
            accountType: data.accountType,
        }, process.env.TOKEN_SECRET, { expiresIn: "90d" });
        data.password = "";
        res.cookie("mtud", token, {
            maxAge: 7776000 * 1000,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
        });
        return (0, response_1.default)(res, true, data, "Prisijungimas sėkmingas");
    }),
    ///////////////////////////////////////////////////////////////////
    getUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { user } = req.body;
        const foundUser = yield userSchema_1.default.findOne({ username: user });
        foundUser && (foundUser.password = "");
        return (0, response_1.default)(res, true, foundUser, "ok");
    }),
    ///////////////////////////////////////////////////////////////////
    getUsers: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const users = yield userSchema_1.default.find();
        return (0, response_1.default)(res, true, users, "ok");
    }),
    logout: (req, res) => {
        res.clearCookie("token");
        return (0, response_1.default)(res, true, null, "Logged out successfully");
    },
};
