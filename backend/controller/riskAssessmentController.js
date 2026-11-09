import { assessSafetyRisk } from "../services/riskAssessmentService.js";

const timeOfDayValues = new Set(["morning", "afternoon", "evening", "night"]);
const situationValues = new Set([
  "walking",
  "public_transit",
  "rideshare",
  "waiting",
  "at_home",
  "other",
]);
const indicatorValues = new Set([
  "isolated_area",
  "unsafe_person_nearby",
  "unfamiliar_route",
  "low_battery",
  "feeling_unsafe",
]);

const hasOnlyKeys = (value, allowedKeys) =>
  Object.keys(value).every((key) => allowedKeys.includes(key));

const validateRequest = (body) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return "A JSON object is required";
  }

  if (
    !hasOnlyKeys(body, [
      "location",
      "timeOfDay",
      "travellingAlone",
      "situation",
      "additionalIndicators",
    ])
  ) {
    return "Request contains unsupported fields";
  }

  if (!timeOfDayValues.has(body.timeOfDay)) {
    return "Unsupported timeOfDay value";
  }

  if (typeof body.travellingAlone !== "boolean") {
    return "travellingAlone must be a boolean";
  }

  if (!situationValues.has(body.situation)) {
    return "Unsupported situation value";
  }

  if (body.location !== undefined) {
    if (
      !body.location ||
      typeof body.location !== "object" ||
      Array.isArray(body.location) ||
      !hasOnlyKeys(body.location, ["latitude", "longitude"]) ||
      !Object.hasOwn(body.location, "latitude") ||
      !Object.hasOwn(body.location, "longitude")
    ) {
      return "location must contain only latitude and longitude";
    }

    const { latitude, longitude } = body.location;
    if (
      typeof latitude !== "number" ||
      !Number.isFinite(latitude) ||
      latitude < -90 ||
      latitude > 90
    ) {
      return "latitude must be a number from -90 to 90";
    }

    if (
      typeof longitude !== "number" ||
      !Number.isFinite(longitude) ||
      longitude < -180 ||
      longitude > 180
    ) {
      return "longitude must be a number from -180 to 180";
    }
  }

  if (body.additionalIndicators !== undefined) {
    if (
      !Array.isArray(body.additionalIndicators) ||
      body.additionalIndicators.length > indicatorValues.size ||
      body.additionalIndicators.some(
        (indicator) => !indicatorValues.has(indicator),
      ) ||
      new Set(body.additionalIndicators).size !== body.additionalIndicators.length
    ) {
      return "additionalIndicators must contain unique supported values";
    }
  }

  return null;
};

export const createRiskAssessment = (req, res) => {
  const validationError = validateRequest(req.body);
  if (validationError) {
    return res.status(400).json({ msg: validationError });
  }

  try {
    const assessment = assessSafetyRisk(req.body);
    return res.json(assessment);
  } catch (error) {
    console.error("Risk assessment failed:", error);
    return res.status(500).json({ msg: "Risk assessment failed" });
  }
};
