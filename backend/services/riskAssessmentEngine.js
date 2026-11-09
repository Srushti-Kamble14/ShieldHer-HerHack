const RISK_LEVELS = [
  { minimum: 75, level: "CRITICAL" },
  { minimum: 50, level: "HIGH" },
  { minimum: 25, level: "MODERATE" },
  { minimum: 0, level: "LOW" },
];

const RECOMMENDATIONS = {
  LOW: "Stay aware of your surroundings and keep your phone accessible.",
  MODERATE:
    "Share your route or ETA with someone you trust and stay in well-lit, public areas.",
  HIGH:
    "Move to a well-lit public place, contact someone you trust, and consider changing your route.",
  CRITICAL:
    "If you feel in immediate danger, contact local emergency services or use ShieldHer SOS now.",
};

const TIME_FACTORS = {
  morning: null,
  afternoon: null,
  evening: { code: "time_evening", description: "It is evening.", contribution: 5 },
  night: { code: "time_night", description: "It is night.", contribution: 10 },
};

const SITUATION_FACTORS = {
  walking: null,
  public_transit: {
    code: "situation_public_transit",
    description: "You are using public transit.",
    contribution: 5,
  },
  rideshare: {
    code: "situation_rideshare",
    description: "You are using a rideshare.",
    contribution: 10,
  },
  waiting: {
    code: "situation_waiting",
    description: "You are waiting somewhere.",
    contribution: 5,
  },
  at_home: null,
  other: null,
};

const INDICATOR_FACTORS = {
  isolated_area: {
    code: "isolated_area",
    description: "You indicated that the area is isolated.",
    contribution: 15,
  },
  unsafe_person_nearby: {
    code: "unsafe_person_nearby",
    description: "You indicated that someone nearby feels unsafe.",
    contribution: 25,
  },
  unfamiliar_route: {
    code: "unfamiliar_route",
    description: "You indicated that the route is unfamiliar.",
    contribution: 10,
  },
  low_battery: {
    code: "low_battery",
    description: "You indicated that your phone battery is low.",
    contribution: 5,
  },
  feeling_unsafe: {
    code: "feeling_unsafe",
    description: "You indicated that you feel unsafe.",
    contribution: 15,
  },
};

export const getRiskLevel = (riskScore) =>
  RISK_LEVELS.find(({ minimum }) => riskScore >= minimum).level;

export const getRecommendation = (riskLevel) => RECOMMENDATIONS[riskLevel];

// Deterministic weights are additive, mutually exclusive where applicable,
// and total at most 100. Coordinates are intentionally not used for scoring.
export const assessRisk = (context) => {
  const riskFactors = [];
  const timeFactor = TIME_FACTORS[context.timeOfDay];
  const situationFactor = SITUATION_FACTORS[context.situation];

  if (timeFactor) riskFactors.push(timeFactor);
  if (context.travellingAlone) {
    riskFactors.push({
      code: "travelling_alone",
      description: "You are travelling alone.",
      contribution: 10,
    });
  }
  if (situationFactor) riskFactors.push(situationFactor);

  context.additionalIndicators.forEach((indicator) => {
    riskFactors.push(INDICATOR_FACTORS[indicator]);
  });

  const riskScore = Math.min(
    100,
    riskFactors.reduce((total, factor) => total + factor.contribution, 0),
  );
  const riskLevel = getRiskLevel(riskScore);

  return {
    riskScore,
    riskLevel,
    riskFactors,
    recommendation: getRecommendation(riskLevel),
  };
};
