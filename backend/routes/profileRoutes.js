import express from "express";
import {
  createProfile,
  getProfile,
  updateProfile,
} from "../controller/profileController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createProfile);
router.get("/", authMiddleware, getProfile);
router.put("/", authMiddleware, updateProfile);

export default router;