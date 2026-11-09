import express from "express";
import { sendSOS } from "../controller/sosController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/", authMiddleware, sendSOS);
export default router;