"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const auth_1 = __importDefault(require("../controllers/auth"));
const inputVerification_1 = __importDefault(require("../middleware/inputVerification"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
router.post("/register", inputVerification_1.default, auth_1.default.register);
router.post("/login", inputVerification_1.default, auth_1.default.login);
router.post("/getUser", authMiddleware_1.default, auth_1.default.getUser);
router.get("/getUsers", authMiddleware_1.default, auth_1.default.getUsers);
exports.default = router;
