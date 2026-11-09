import { assessRisk } from "./riskAssessmentEngine.js";

export const assessSafetyRisk = (context) => {
  const result = assessRisk({
    timeOfDay: context.timeOfDay,
    travellingAlone: context.travellingAlone,
    situation: context.situation,
    additionalIndicators: context.additionalIndicators || [],
  });

  return {
    ...result,
    assessedAt: new Date().toISOString(),
  };
};
