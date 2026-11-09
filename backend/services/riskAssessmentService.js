import { assessRisk, getRecommendation } from "./riskAssessmentEngine.js";
import {
  loadRiskModel,
  MODEL_PATH,
  predictRisk,
} from "./riskAssessmentModel.js";

const toFallbackContext = (context) => ({
  timeOfDay: context.timeOfDay,
  travellingAlone: context.travellingAlone,
  situation: context.situation,
  additionalIndicators: context.additionalIndicators || [],
});

export const assessSafetyRisk = (
  context,
  { modelPath = MODEL_PATH, loadModel = loadRiskModel, infer = predictRisk } = {},
) => {
  let result;

  try {
    result = infer(context, loadModel(modelPath));
  } catch {
    console.warn(
      "[risk-assessment] Local ML model unavailable; using deterministic fallback.",
    );
    result = assessRisk(toFallbackContext(context));
  }

  return {
    ...result,
    recommendation: getRecommendation(result.riskLevel),
    assessedAt: new Date().toISOString(),
  };
};
