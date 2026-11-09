import express from "express";
import { createRiskAssessment } from "../controller/riskAssessmentController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createRiskAssessment);

export default router;
