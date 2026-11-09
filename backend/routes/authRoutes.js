import { registerUser, loginUser, googleLogin } from "../controller/authController.js";
import express from "express";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleLogin);

export default router;