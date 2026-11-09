import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { assessRisk, getRiskLevel } from "../services/riskAssessmentEngine.js";
import {
  encodeFeatures,
  FEATURE_SCHEMA,
  loadRiskModel,
  MODEL_PATH,
  predictRisk,
} from "../services/riskAssessmentModel.js";
import { assessSafetyRisk } from "../services/riskAssessmentService.js";

const context = {
  timeOfDay: "night",
  travellingAlone: true,
  situation: "rideshare",
  additionalIndicators: [
    "isolated_area",
    "unsafe_person_nearby",
    "feeling_unsafe",
  ],
};

const withCapturedWarnings = (callback) => {
  const originalWarn = console.warn;
  const warnings = [];
  console.warn = (...args) => warnings.push(args);
  try {
    return { result: callback(), warnings };
  } finally {
    console.warn = originalWarn;
  }
};

test("encodes inputs in the exported feature-schema order", () => {
  const features = encodeFeatures(context);
  assert.equal(features.length, FEATURE_SCHEMA.length);
  assert.deepEqual(features, [
    0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1,
  ]);
});

test("loads the versioned trained local model", () => {
  const model = loadRiskModel();
  assert.equal(model.modelVersion, "1.0.0");
  assert.equal(model.trainingRows, 1536);
  assert.deepEqual(model.featureSchema, FEATURE_SCHEMA);
});

test("produces a valid model prediction with learned-feature explanations", () => {
  const prediction = predictRisk(context);
  assert.ok(prediction.riskScore >= 0 && prediction.riskScore <= 100);
  assert.equal(prediction.riskLevel, getRiskLevel(prediction.riskScore));
  assert.ok(prediction.riskFactors.length > 0);
  assert.ok(
    prediction.riskFactors.every(
      ({ code, description, contribution }) =>
        code && description && Number.isInteger(contribution) && contribution > 0,
    ),
  );
  assert.ok(
    prediction.riskFactors.some(
      (factor) => factor.code === "unsafe_person_nearby",
    ),
  );
});

test("maps the inclusive score boundaries to the existing risk levels", () => {
  for (const [score, level] of [
    [0, "LOW"],
    [24, "LOW"],
    [25, "MODERATE"],
    [49, "MODERATE"],
    [50, "HIGH"],
    [74, "HIGH"],
    [75, "CRITICAL"],
    [100, "CRITICAL"],
  ]) {
    assert.equal(getRiskLevel(score), level);
  }
});

test("trained model can produce each existing risk level", () => {
  const scenarios = [
    {
      ...context,
      timeOfDay: "morning",
      travellingAlone: false,
      situation: "walking",
      additionalIndicators: [],
    },
    {
      ...context,
      timeOfDay: "morning",
      travellingAlone: false,
      situation: "walking",
      additionalIndicators: ["unsafe_person_nearby"],
    },
    {
      ...context,
      timeOfDay: "morning",
      travellingAlone: false,
      situation: "walking",
      additionalIndicators: [
        "isolated_area",
        "unsafe_person_nearby",
        "unfamiliar_route",
      ],
    },
    {
      ...context,
      timeOfDay: "morning",
      travellingAlone: false,
      situation: "rideshare",
      additionalIndicators: [
        "isolated_area",
        "unsafe_person_nearby",
        "unfamiliar_route",
        "feeling_unsafe",
      ],
    },
  ];
  assert.deepEqual(
    scenarios.map((scenario) => predictRisk(scenario).riskLevel),
    ["LOW", "MODERATE", "HIGH", "CRITICAL"],
  );
});

test("falls back to the deterministic engine and logs safely when the artifact is missing", () => {
  const { result, warnings } = withCapturedWarnings(() =>
    assessSafetyRisk(context, {
      modelPath: path.join(os.tmpdir(), "missing-risk-model.json"),
    }),
  );
  const { assessedAt, ...assessment } = result;
  assert.deepEqual(assessment, assessRisk(context));
  assert.ok(Number.isFinite(Date.parse(assessedAt)));
  assert.equal(warnings.length, 1);
  assert.match(warnings[0][0], /deterministic fallback/);
  assert.doesNotMatch(warnings[0].join(" "), /latitude|longitude|unsafe_person_nearby/);
});

test("falls back when the model artifact is malformed", (t) => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "shieldher-model-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const malformedPath = path.join(directory, "bad-model.json");
  writeFileSync(malformedPath, JSON.stringify({ formatVersion: 1 }), "utf8");

  const { result, warnings } = withCapturedWarnings(() =>
    assessSafetyRisk(context, { modelPath: malformedPath }),
  );
  const { assessedAt, ...assessment } = result;
  assert.deepEqual(assessment, assessRisk(context));
  assert.equal(warnings.length, 1);
});

test("falls back when the model feature schema does not match", (t) => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "shieldher-schema-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const mismatchedPath = path.join(directory, "mismatched-model.json");
  const model = JSON.parse(readFileSync(MODEL_PATH, "utf8"));
  model.featureSchema.reverse();
  writeFileSync(mismatchedPath, JSON.stringify(model), "utf8");

  const { result, warnings } = withCapturedWarnings(() =>
    assessSafetyRisk(context, { modelPath: mismatchedPath }),
  );
  const { assessedAt, ...assessment } = result;
  assert.deepEqual(assessment, assessRisk(context));
  assert.equal(warnings.length, 1);
});

test("falls back when model inference throws", () => {
  const { result, warnings } = withCapturedWarnings(() =>
    assessSafetyRisk(context, {
      infer: () => {
        throw new Error("injected");
      },
    }),
  );
  const { assessedAt, ...assessment } = result;
  assert.deepEqual(assessment, assessRisk(context));
  assert.equal(warnings.length, 1);
});

test("returns exactly the established API response shape", () => {
  const assessment = assessSafetyRisk(context);
  assert.deepEqual(Object.keys(assessment).sort(), [
    "assessedAt",
    "recommendation",
    "riskFactors",
    "riskLevel",
    "riskScore",
  ]);
  assert.ok(Number.isFinite(Date.parse(assessment.assessedAt)));
});

test("coordinates do not affect model inference", () => {
  const withoutCoordinates = predictRisk(context);
  const withCoordinates = predictRisk({
    ...context,
    location: { latitude: 37.7749, longitude: -122.4194 },
  });
  assert.deepEqual(withCoordinates, withoutCoordinates);
});

test("assessment service has no SOS invocation or dependency", () => {
  const source = readFileSync(
    new URL("../services/riskAssessmentService.js", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(
    source,
    /\b(?:triggerSOS|sendSOS)\b|sosService|sosController/i,
  );
});

test("fallback recommendation and deterministic response remain unchanged", () => {
  const result = assessRisk({
    timeOfDay: "morning",
    travellingAlone: false,
    situation: "walking",
    additionalIndicators: [],
  });
  assert.equal(result.riskLevel, "LOW");
  assert.equal(result.riskScore, 0);
  assert.equal(
    result.recommendation,
    "Stay aware of your surroundings and keep your phone accessible.",
  );
});

test("model loader reads the checked-in JSON artifact", () => {
  assert.ok(readFileSync(MODEL_PATH, "utf8").includes("coefficients"));
});
