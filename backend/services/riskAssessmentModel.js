import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { getRiskLevel } from "./riskAssessmentEngine.js";

export const MODEL_PATH = fileURLToPath(
  new URL("../ml/risk_model_v1.json", import.meta.url),
);

export const FEATURE_SCHEMA = Object.freeze([
  "timeOfDay=morning",
  "timeOfDay=afternoon",
  "timeOfDay=evening",
  "timeOfDay=night",
  "travellingAlone=true",
  "situation=walking",
  "situation=public_transit",
  "situation=rideshare",
  "situation=waiting",
  "situation=at_home",
  "situation=other",
  "indicator=isolated_area",
  "indicator=unsafe_person_nearby",
  "indicator=unfamiliar_route",
  "indicator=low_battery",
  "indicator=feeling_unsafe",
]);

const MODEL_FORMAT_VERSION = 1;
const MODEL_VERSION = "1.0.0";
const TRAINING_DATA_VERSION = "synthetic_exhaustive_scenarios_v1";
const TRAINING_ROWS = 1536;
const CLASS_SCORE_ANCHORS = [12, 37, 62, 87];
const RISK_FACTORS = {
  evening: {
    code: "time_evening",
    description: "It is evening.",
    feature: "timeOfDay=evening",
    baseline: "timeOfDay=morning",
  },
  night: {
    code: "time_night",
    description: "It is night.",
    feature: "timeOfDay=night",
    baseline: "timeOfDay=morning",
  },
  travellingAlone: {
    code: "travelling_alone",
    description: "You are travelling alone.",
    feature: "travellingAlone=true",
  },
  public_transit: {
    code: "situation_public_transit",
    description: "You are using public transit.",
    feature: "situation=public_transit",
    baseline: "situation=walking",
  },
  rideshare: {
    code: "situation_rideshare",
    description: "You are using a rideshare.",
    feature: "situation=rideshare",
    baseline: "situation=walking",
  },
  waiting: {
    code: "situation_waiting",
    description: "You are waiting somewhere.",
    feature: "situation=waiting",
    baseline: "situation=walking",
  },
  at_home: {
    code: "situation_at_home",
    description: "You indicated that you are at home.",
    feature: "situation=at_home",
    baseline: "situation=walking",
  },
  other: {
    code: "situation_other",
    description: "You indicated another situation.",
    feature: "situation=other",
    baseline: "situation=walking",
  },
  isolated_area: {
    code: "isolated_area",
    description: "You indicated that the area is isolated.",
    feature: "indicator=isolated_area",
  },
  unsafe_person_nearby: {
    code: "unsafe_person_nearby",
    description: "You indicated that someone nearby feels unsafe.",
    feature: "indicator=unsafe_person_nearby",
  },
  unfamiliar_route: {
    code: "unfamiliar_route",
    description: "You indicated that the route is unfamiliar.",
    feature: "indicator=unfamiliar_route",
  },
  low_battery: {
    code: "low_battery",
    description: "You indicated that your phone battery is low.",
    feature: "indicator=low_battery",
  },
  feeling_unsafe: {
    code: "feeling_unsafe",
    description: "You indicated that you feel unsafe.",
    feature: "indicator=feeling_unsafe",
  },
};

const featureIndex = new Map(
  FEATURE_SCHEMA.map((feature, index) => [feature, index]),
);

const isFiniteNumber = (value) =>
  typeof value === "number" && Number.isFinite(value);

export const encodeFeatures = (context) => {
  const indicators = context.additionalIndicators || [];
  return FEATURE_SCHEMA.map((feature) => {
    if (feature.startsWith("timeOfDay=")) {
      return Number(feature.slice("timeOfDay=".length) === context.timeOfDay);
    }
    if (feature === "travellingAlone=true") {
      return Number(context.travellingAlone);
    }
    if (feature.startsWith("situation=")) {
      return Number(feature.slice("situation=".length) === context.situation);
    }
    return Number(
      indicators.includes(feature.slice("indicator=".length)),
    );
  });
};

const validateModel = (model) => {
  if (
    !model ||
    model.formatVersion !== MODEL_FORMAT_VERSION ||
    model.modelVersion !== MODEL_VERSION ||
    model.modelType !== "sklearn-logistic-regression-multinomial" ||
    model.trainingData !== TRAINING_DATA_VERSION ||
    model.trainingRows !== TRAINING_ROWS ||
    JSON.stringify(model.featureSchema) !== JSON.stringify(FEATURE_SCHEMA) ||
    JSON.stringify(model.classes) !== JSON.stringify([0, 1, 2, 3]) ||
    JSON.stringify(model.classScoreAnchors) !==
      JSON.stringify(CLASS_SCORE_ANCHORS) ||
    !Array.isArray(model.coefficients) ||
    model.coefficients.length !== model.classes.length ||
    model.coefficients.some(
      (row) =>
        !Array.isArray(row) ||
        row.length !== FEATURE_SCHEMA.length ||
        row.some((value) => !isFiniteNumber(value)),
    ) ||
    !Array.isArray(model.intercepts) ||
    model.intercepts.length !== model.classes.length ||
    model.intercepts.some((value) => !isFiniteNumber(value))
  ) {
    throw new Error("Risk model artifact is invalid or incompatible.");
  }
  return model;
};

export const loadRiskModel = (modelPath = MODEL_PATH) =>
  validateModel(JSON.parse(readFileSync(modelPath, "utf8")));

const scoreVector = (features, model) => {
  const logits = model.coefficients.map((weights, classIndex) =>
    weights.reduce(
      (total, weight, index) => total + weight * features[index],
      model.intercepts[classIndex],
    ),
  );
  const maxLogit = Math.max(...logits);
  const exponentials = logits.map((logit) => Math.exp(logit - maxLogit));
  const total = exponentials.reduce((sum, value) => sum + value, 0);
  const probabilities = exponentials.map((value) => value / total);

  return Math.round(
    probabilities.reduce(
      (sum, probability, index) =>
        sum + probability * model.classScoreAnchors[index],
      0,
    ),
  );
};

export const predictRisk = (context, model = loadRiskModel()) => {
  const features = encodeFeatures(context);
  const riskScore = Math.min(100, Math.max(0, scoreVector(features, model)));
  const riskFactors = [];

  const presentFactors = [
    ...(context.timeOfDay === "evening" ? [RISK_FACTORS.evening] : []),
    ...(context.timeOfDay === "night" ? [RISK_FACTORS.night] : []),
    ...(context.travellingAlone ? [RISK_FACTORS.travellingAlone] : []),
    ...(context.situation !== "walking"
      ? [RISK_FACTORS[context.situation]]
      : []),
    ...(context.additionalIndicators || []).map(
      (indicator) => RISK_FACTORS[indicator],
    ),
  ];

  for (const factor of presentFactors) {
    const counterfactual = [...features];
    const factorIndex = featureIndex.get(factor.feature);
    counterfactual[factorIndex] = 0;
    if (factor.baseline) counterfactual[featureIndex.get(factor.baseline)] = 1;

    // This feature-ablation difference is a model contribution, not proof of causation.
    const contribution = riskScore - scoreVector(counterfactual, model);
    if (contribution > 0) {
      riskFactors.push({
        code: factor.code,
        description: factor.description,
        contribution,
      });
    }
  }

  return {
    riskScore,
    riskLevel: getRiskLevel(riskScore),
    riskFactors,
  };
};
