export const SAFETY_ACTIVITY_KEY = "shieldher.safetyActivity.v1";
export const SAFETY_CHECK_IN_KEY = "shieldher.safetyCheckIn.v1";
export const SAFE_JOURNEY_KEY = "shieldher.safeJourney.v1";
export const SAFETY_PLAN_KEY = "shieldher.safetyPlan.v1";
export const SAFETY_ACTIVITY_EVENT = "shieldher:safety-activity-updated";

export const MAX_SAFETY_HISTORY_ENTRIES = 30;
export const RISK_LEVELS = ["LOW", "MODERATE", "HIGH", "CRITICAL"];

const isValidSafetyEntry = (entry) =>
  entry &&
  typeof entry.assessedAt === "string" &&
  Number.isFinite(Date.parse(entry.assessedAt)) &&
  Number.isInteger(entry.riskScore) &&
  entry.riskScore >= 0 &&
  entry.riskScore <= 100 &&
  RISK_LEVELS.includes(entry.riskLevel);

const normalizeEntries = (entries) =>
  entries
    .filter(isValidSafetyEntry)
    .map(({ assessedAt, riskScore, riskLevel }) => ({
      assessedAt,
      riskScore,
      riskLevel,
    }))
    .sort(
      (first, second) =>
        Date.parse(second.assessedAt) - Date.parse(first.assessedAt),
    )
    .slice(0, MAX_SAFETY_HISTORY_ENTRIES);

export const readSafetyActivity = () => {
  let stored;
  try {
    stored = window.localStorage.getItem(SAFETY_ACTIVITY_KEY);
  } catch {
    return { entries: [], available: false };
  }
  if (!stored) return { entries: [], available: true };

  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return { entries: [], available: true };
    return { entries: normalizeEntries(parsed), available: true };
  } catch {
    return { entries: [], available: true };
  }
};

export const saveSafetyActivity = (entry) => {
  if (!isValidSafetyEntry(entry)) {
    return { ...readSafetyActivity(), saved: false };
  }

  const current = readSafetyActivity();
  if (!current.available) return { ...current, saved: false };
  const entries = normalizeEntries([
    { assessedAt: entry.assessedAt, riskScore: entry.riskScore, riskLevel: entry.riskLevel },
    ...current.entries.filter((saved) => saved.assessedAt !== entry.assessedAt),
  ]);
  try {
    window.localStorage.setItem(SAFETY_ACTIVITY_KEY, JSON.stringify(entries));
    window.dispatchEvent(new Event(SAFETY_ACTIVITY_EVENT));
    return { entries, available: true, saved: true };
  } catch {
    return { entries: current.entries, available: false, saved: false };
  }
};

export const clearSafetyActivity = () => {
  try {
    window.localStorage.removeItem(SAFETY_ACTIVITY_KEY);
    window.dispatchEvent(new Event(SAFETY_ACTIVITY_EVENT));
    return { entries: [], available: true };
  } catch {
    return { ...readSafetyActivity(), available: false };
  }
};

export const readLocalSafetyValue = (key) => {
  try {
    const stored = window.localStorage.getItem(key);
    return {
      value: stored ? JSON.parse(stored) : null,
      available: true,
    };
  } catch {
    return { value: null, available: false };
  }
};

export const writeLocalSafetyValue = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};
