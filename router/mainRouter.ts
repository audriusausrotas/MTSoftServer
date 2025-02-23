import express from "express";
const router = express.Router();
import auth from "../controllers/auth";
import inputVerification from "../middleware/inputVerification";
import authMiddleware from "../middleware/authMiddleware";

router.post("/register", inputVerification, auth.register);
router.post("/login", inputVerification, auth.login);
router.post("/getUser", authMiddleware, auth.getUser);
router.get("/getUsers", authMiddleware, auth.getUsers);

export default router;
