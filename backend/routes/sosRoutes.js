import express from "express";
import {
  sendSOS,
  startLiveSharing,
  stopLiveSharing,
  updateLiveLocation,
} from "../controller/sosController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/", authMiddleware, sendSOS);
router.post("/live/start", authMiddleware, startLiveSharing);
router.post("/live/update", authMiddleware, updateLiveLocation);
router.post("/live/stop", authMiddleware, stopLiveSharing);
export default router;