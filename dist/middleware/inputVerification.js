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
const response_1 = __importDefault(require("../modules/response"));
exports.default = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password, retypePassword } = req.body;
    if (retypePassword && password !== retypePassword)
        return (0, response_1.default)(res, false, null, "Passwords doesn't match");
    if (email) {
        if (!email.includes("@"))
            return (0, response_1.default)(res, false, null, "Neteisingas elektroninis paštas");
        if (email.length < 4)
            return (0, response_1.default)(res, false, null, "Elektroninis paštas per trumpas");
    }
    if (username) {
        if (username.length < 4)
            return (0, response_1.default)(res, false, null, "Vartotojo vardas per trumpas");
        if (username.length > 20)
            return (0, response_1.default)(res, false, null, "Vartotojo vardas per ilgas");
    }
    if (password) {
        if (password.length < 4)
            return (0, response_1.default)(res, false, null, "Slaptažodis per trumpas");
        if (password.length > 20)
            return (0, response_1.default)(res, false, null, "Slaptažodis per ilgas");
    }
    next();
});
