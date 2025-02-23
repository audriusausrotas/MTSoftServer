"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const response_1 = __importDefault(require("../modules/response"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("dotenv").config();
exports.default = (req, res, next) => {
    var _a;
    const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.token;
    if (!token) {
        return (0, response_1.default)(res, false, null, "Auth error: No token provided");
    }
    try {
        const user = jsonwebtoken_1.default.verify(token, process.env.TOKEN_SECRET);
        req.user = {
            _id: user._id,
            email: user.email,
            verified: user.verified,
            accountType: user.accountType,
            password: "",
            username: user.username,
            lastName: user.lastName,
            phone: user.phone,
            photo: user.photo,
        };
        next();
    }
    catch (error) {
        return (0, response_1.default)(res, false, null, "Auth error: Invalid token");
    }
};
