import assert from "node:assert/strict";
import { beforeEach, afterEach, test } from "node:test";
import {
  clearSafetyActivity,
  MAX_SAFETY_HISTORY_ENTRIES,
  readSafetyActivity,
  SAFETY_ACTIVITY_KEY,
  saveSafetyActivity,
} from "../src/services/safetyLocalData.js";
import { calculateSafetyInsights } from "../src/services/safetyInsights.js";

let originalWindow;
let data;
let storage;

beforeEach(() => {
  originalWindow = globalThis.window;
  data = new Map();
  storage = {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
  };
  globalThis.window = {
    Event,
    localStorage: storage,
    dispatchEvent: () => true,
  };
});

afterEach(() => {
  if (originalWindow === undefined) {
    delete globalThis.window;
  } else {
    globalThis.window = originalWindow;
  }
});

test("saves only minimal assessment fields and keeps newest entries first", () => {
  const result = saveSafetyActivity({
    assessedAt: "2026-11-09T12:00:00.000Z",
    riskScore: 40,
    riskLevel: "MODERATE",
    location: { latitude: 12, longitude: 34 },
    answers: ["private"],
  });

  assert.equal(result.saved, true);
  assert.deepEqual(result.entries[0], {
    assessedAt: "2026-11-09T12:00:00.000Z",
    riskScore: 40,
    riskLevel: "MODERATE",
  });
  assert.equal(
    Object.keys(JSON.parse(data.get(SAFETY_ACTIVITY_KEY))[0]).length,
    3,
  );
});

test("caps activity history at the configured maximum", () => {
  for (let index = 0; index < MAX_SAFETY_HISTORY_ENTRIES + 5; index += 1) {
    const assessedAt = new Date(Date.UTC(2026, 0, index + 1)).toISOString();
    saveSafetyActivity({
      assessedAt,
      riskScore: index,
      riskLevel: "LOW",
    });
  }

  const { entries } = readSafetyActivity();
  assert.equal(entries.length, MAX_SAFETY_HISTORY_ENTRIES);
  assert.equal(entries[0].assessedAt, new Date(Date.UTC(2026, 1, 4)).toISOString());
});

test("ignores malformed and invalid stored assessment records", () => {
  data.set(
    SAFETY_ACTIVITY_KEY,
    JSON.stringify([
      { assessedAt: "not-a-date", riskScore: 40, riskLevel: "MODERATE" },
      { assessedAt: "2026-11-09T12:00:00.000Z", riskScore: 101, riskLevel: "HIGH" },
      { assessedAt: "2026-11-09T12:00:00.000Z", riskScore: 24, riskLevel: "LOW" },
    ]),
  );

  assert.deepEqual(readSafetyActivity().entries, [
    {
      assessedAt: "2026-11-09T12:00:00.000Z",
      riskScore: 24,
      riskLevel: "LOW",
    },
  ]);
  data.set(SAFETY_ACTIVITY_KEY, "{");
  assert.deepEqual(readSafetyActivity(), { entries: [], available: true });
});

test("reports local storage failures without throwing", () => {
  storage.getItem = () => {
    throw new Error("blocked");
  };
  assert.deepEqual(readSafetyActivity(), { entries: [], available: false });
  assert.equal(
    saveSafetyActivity({
      assessedAt: "2026-11-09T12:00:00.000Z",
      riskScore: 24,
      riskLevel: "LOW",
    }).saved,
    false,
  );
});

test("clears only the safety activity storage key", () => {
  data.set(SAFETY_ACTIVITY_KEY, "[]");
  data.set("unrelated", "keep");
  assert.deepEqual(clearSafetyActivity(), { entries: [], available: true });
  assert.equal(data.has(SAFETY_ACTIVITY_KEY), false);
  assert.equal(data.get("unrelated"), "keep");
});

test("calculates real weekly counts and leaves unavailable comparisons unstated", () => {
  const now = new Date(2026, 10, 9, 21, 0, 0).getTime();
  const entry = (date, riskScore, riskLevel) => ({
    assessedAt: date.toISOString(),
    riskScore,
    riskLevel,
  });
  const insights = calculateSafetyInsights(
    [
      entry(new Date(2026, 10, 9, 9), 20, "LOW"),
      entry(new Date(2026, 10, 8, 22), 60, "HIGH"),
      entry(new Date(2026, 9, 30, 10), 30, "MODERATE"),
    ],
    now,
  );

  assert.equal(insights.thisWeek.length, 2);
  assert.equal(insights.currentAverage, 40);
  assert.equal(insights.riskCounts.LOW, 1);
  assert.equal(insights.riskCounts.HIGH, 1);
  assert.equal(insights.mostCommonLevel.startsWith("Tie:"), true);
  assert.equal(insights.mostCommonPeriod, "Tie: morning, night");
  assert.equal(insights.trend.startsWith("Increasing"), true);

  const empty = calculateSafetyInsights([], now);
  assert.equal(empty.currentAverage, null);
  assert.equal(empty.mostCommonLevel, null);
  assert.equal(empty.mostCommonPeriod, null);
  assert.match(empty.trend, /Not enough saved data/);
});
