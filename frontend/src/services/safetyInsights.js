import { RISK_LEVELS } from "./safetyLocalData.js";

const DAY_MS = 24 * 60 * 60 * 1000;

const average = (entries) =>
  entries.length
    ? Math.round(
        entries.reduce((sum, entry) => sum + entry.riskScore, 0) /
          entries.length,
      )
    : null;

const commonValue = (counts, labels) => {
  const maximum = Math.max(...Object.values(counts));
  if (maximum === 0) return null;
  const matches = labels.filter((label) => counts[label] === maximum);
  return matches.length > 1
    ? `Tie: ${matches.join(", ")}`
    : matches[0];
};

export const calculateSafetyInsights = (entries, now) => {
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const thisWeekStart = startOfToday.getTime() - 6 * DAY_MS;
  const previousWeekStart = thisWeekStart - 7 * DAY_MS;
  const thisWeek = entries.filter((entry) => {
    const time = Date.parse(entry.assessedAt);
    return time >= thisWeekStart && time <= now;
  });
  const previousWeek = entries.filter((entry) => {
    const time = Date.parse(entry.assessedAt);
    return time >= previousWeekStart && time < thisWeekStart;
  });
  const riskCounts = Object.fromEntries(
    RISK_LEVELS.map((level) => [
      level,
      thisWeek.filter((entry) => entry.riskLevel === level).length,
    ]),
  );
  const periods = ["morning", "afternoon", "evening", "night"];
  const periodCounts = Object.fromEntries(
    periods.map((period) => [
      period,
      thisWeek.filter((entry) => {
        const hour = new Date(entry.assessedAt).getHours();
        return period === "morning"
          ? hour < 12
          : period === "afternoon"
            ? hour >= 12 && hour < 17
            : period === "evening"
              ? hour >= 17 && hour < 21
              : hour >= 21;
      }).length,
    ]),
  );
  const currentAverage = average(thisWeek);
  const previousAverage = average(previousWeek);
  const trend =
    currentAverage === null || previousAverage === null
      ? "Not enough saved data to compare weeks."
      : currentAverage > previousAverage
        ? "Increasing compared with the previous week, based on saved assessments."
        : currentAverage < previousAverage
          ? "Decreasing compared with the previous week, based on saved assessments."
          : "Stable compared with the previous week, based on saved assessments.";

  return {
    thisWeek,
    riskCounts,
    periodCounts,
    currentAverage,
    mostCommonLevel: commonValue(riskCounts, RISK_LEVELS),
    mostCommonPeriod: commonValue(periodCounts, periods),
    trend,
  };
};
