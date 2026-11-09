import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { assessSafetyRisk } from "../services/riskAssessmentService";

const SAFETY_HISTORY_KEY = "shieldher.safetyActivity.v1";
const MAX_SAFETY_HISTORY_ENTRIES = 30;
const RISK_LEVELS = ["LOW", "MODERATE", "HIGH", "CRITICAL"];

const readSafetyHistory = () => {
  let stored;
  try {
    stored = window.localStorage.getItem(SAFETY_HISTORY_KEY);
  } catch {
    return { entries: [], available: false };
  }
  if (!stored) return { entries: [], available: true };

  let entries;
  try {
    entries = JSON.parse(stored);
  } catch {
    return { entries: [], available: true };
  }
  if (!Array.isArray(entries)) return { entries: [], available: true };

  return {
    entries: entries
      .filter(
        (entry) =>
          entry &&
          typeof entry.assessedAt === "string" &&
          Number.isFinite(Date.parse(entry.assessedAt)) &&
          Number.isInteger(entry.riskScore) &&
          entry.riskScore >= 0 &&
          entry.riskScore <= 100 &&
          RISK_LEVELS.includes(entry.riskLevel),
      )
      .map(({ assessedAt, riskScore, riskLevel }) => ({
        assessedAt,
        riskScore,
        riskLevel,
      }))
      .sort(
        (first, second) =>
          Date.parse(second.assessedAt) - Date.parse(first.assessedAt),
      )
      .slice(0, MAX_SAFETY_HISTORY_ENTRIES),
    available: true,
  };
};

const indicators = [
  ["isolated_area", "The area feels isolated"],
  ["unsafe_person_nearby", "Someone nearby feels unsafe"],
  ["unfamiliar_route", "I am on an unfamiliar route"],
  ["low_battery", "My phone battery is low"],
  ["feeling_unsafe", "I feel unsafe"],
];

const timeOfDayForNow = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  if (hour < 21) return "evening";
  return "night";
};

const getCurrentLocation = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Location is unavailable in this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        resolve({
          latitude: coords.latitude,
          longitude: coords.longitude,
        }),
      () => reject(new Error("Location is unavailable.")),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 },
    );
  });

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  background: "rgba(0,20,55,0.7)",
  border: "1px solid rgba(0,180,255,0.25)",
  borderRadius: "6px",
  color: "#a8f0ff",
  fontFamily: "'Courier New',monospace",
};

export default function RiskAssessmentPanel() {
  const navigate = useNavigate();
  const [timeOfDay, setTimeOfDay] = useState(timeOfDayForNow);
  const [travellingAlone, setTravellingAlone] = useState(false);
  const [situation, setSituation] = useState("walking");
  const [additionalIndicators, setAdditionalIndicators] = useState([]);
  const [includeLocation, setIncludeLocation] = useState(false);
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [locationNotice, setLocationNotice] = useState("");
  const [safetyHistory, setSafetyHistory] = useState(readSafetyHistory);
  const [historyNotice, setHistoryNotice] = useState("");

  const toggleIndicator = (value) => {
    setAdditionalIndicators((current) =>
      current.includes(value)
        ? current.filter((indicator) => indicator !== value)
        : [...current, value],
    );
  };

  const handleAssess = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setAssessment(null);
    setLocationNotice("");

    let location;
    if (includeLocation) {
      try {
        location = await getCurrentLocation();
      } catch {
        setLocationNotice("Location unavailable; assessed without coordinates.");
      }
    }

    try {
      const result = await assessSafetyRisk({
        ...(location ? { location } : {}),
        timeOfDay,
        travellingAlone,
        situation,
        additionalIndicators,
      });
      setAssessment(result);
      const entry = {
        assessedAt: result.assessedAt,
        riskScore: result.riskScore,
        riskLevel: result.riskLevel,
      };
      const entries = [
        entry,
        ...safetyHistory.entries.filter(
          (savedEntry) => savedEntry.assessedAt !== entry.assessedAt,
        ),
      ].slice(0, MAX_SAFETY_HISTORY_ENTRIES);
      try {
        window.localStorage.setItem(SAFETY_HISTORY_KEY, JSON.stringify(entries));
        setSafetyHistory({ entries, available: true });
        setHistoryNotice("");
      } catch {
        setHistoryNotice(
          "This assessment could not be saved to local safety history.",
        );
        setSafetyHistory((current) => ({ ...current, available: false }));
      }
    } catch (requestError) {
      setError(requestError.message || "Safety assessment request failed.");
    } finally {
      setLoading(false);
    }
  };

  const fieldLabel = {
    display: "grid",
    gap: "7px",
    color: "rgba(125,232,255,0.8)",
    fontSize: "11px",
    letterSpacing: "1px",
    fontFamily: "'Courier New',monospace",
  };
  const clearSafetyHistory = () => {
    try {
      window.localStorage.removeItem(SAFETY_HISTORY_KEY);
      setSafetyHistory({ entries: [], available: true });
      setHistoryNotice("");
    } catch {
      setHistoryNotice("Safety history could not be cleared on this device.");
      setSafetyHistory((current) => ({ ...current, available: false }));
    }
  };
  const now = new Date();
  const todayEntries = safetyHistory.entries.filter((entry) => {
    const date = new Date(entry.assessedAt);
    return date.toDateString() === now.toDateString();
  });
  const weekEntries = safetyHistory.entries.filter(
    (entry) => {
      const age = now.getTime() - Date.parse(entry.assessedAt);
      return age >= 0 && age < 7 * 24 * 60 * 60 * 1000;
    },
  );
  const earlierEntries = safetyHistory.entries
    .filter((entry) => !todayEntries.includes(entry))
    .slice(0, 6);
  const weeklyCounts = RISK_LEVELS.reduce((counts, level) => {
    counts[level] = weekEntries.filter(
      (entry) => entry.riskLevel === level,
    ).length;
    return counts;
  }, {});
  const maxWeeklyCount = Math.max(1, ...Object.values(weeklyCounts));

  return (
    <section
      aria-labelledby="risk-assessment-title"
      style={{
        marginTop: "20px",
        padding: "clamp(16px, 3vw, 24px)",
        background: "rgba(4,13,28,0.88)",
        border: "1px solid rgba(0,180,255,0.24)",
        borderRadius: "12px",
        boxShadow: "0 0 28px rgba(0,120,220,0.08)",
      }}
    >
      <div style={{ marginBottom: "18px" }}>
        <div
          style={{
            color: "#00cfff",
            fontSize: "9px",
            letterSpacing: "3px",
            fontFamily: "'Courier New',monospace",
          }}
        >
          SHIELDHER SAFETY INTELLIGENCE
        </div>
        <h2
          id="risk-assessment-title"
          style={{
            margin: "8px 0",
            color: "#7de8ff",
            fontFamily: "'Orbitron',monospace",
            fontSize: "clamp(1rem, 2.5vw, 1.3rem)",
          }}
        >
          ShieldHer Safety Risk Assessment
        </h2>
        <p style={{ color: "rgba(168,240,255,0.65)", fontSize: "13px" }}>
          How this estimate works: ShieldHer uses a trained local risk model to
          estimate risk from the safety context you provide. It is
          informational and does not predict or guarantee danger. Model
          explanation factors reflect learned influences, not proof of
          causation.
        </p>
      </div>

      <form onSubmit={handleAssess}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(min(220px,100%),1fr))",
            gap: "14px",
          }}
        >
          <label style={fieldLabel}>
            TIME OF DAY
            <select
              value={timeOfDay}
              onChange={(event) => setTimeOfDay(event.target.value)}
              style={inputStyle}
            >
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
              <option value="night">Night</option>
            </select>
          </label>

          <label style={fieldLabel}>
            CURRENT SITUATION
            <select
              value={situation}
              onChange={(event) => setSituation(event.target.value)}
              style={inputStyle}
            >
              <option value="walking">Walking</option>
              <option value="public_transit">Public transit</option>
              <option value="rideshare">Rideshare</option>
              <option value="waiting">Waiting</option>
              <option value="at_home">At home</option>
              <option value="other">Other</option>
            </select>
          </label>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(min(220px,100%),1fr))",
            gap: "8px 18px",
            marginTop: "16px",
          }}
        >
          <label style={{ ...fieldLabel, display: "flex", alignItems: "center" }}>
            <input
              type="checkbox"
              checked={travellingAlone}
              onChange={(event) => setTravellingAlone(event.target.checked)}
            />
            I am travelling alone
          </label>
          <label style={{ ...fieldLabel, display: "flex", alignItems: "center" }}>
            <input
              type="checkbox"
              checked={includeLocation}
              onChange={(event) => setIncludeLocation(event.target.checked)}
            />
            Include current location (optional)
          </label>
        </div>

        <fieldset
          style={{
            border: "1px solid rgba(0,180,255,0.16)",
            borderRadius: "8px",
            padding: "12px",
            margin: "16px 0",
          }}
        >
          <legend style={{ ...fieldLabel, padding: "0 6px" }}>
            OPTIONAL SAFETY INDICATORS
          </legend>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(min(220px,100%),1fr))",
              gap: "10px",
            }}
          >
            {indicators.map(([value, label]) => (
              <label
                key={value}
                style={{
                  ...fieldLabel,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <input
                  type="checkbox"
                  checked={additionalIndicators.includes(value)}
                  onChange={() => toggleIndicator(value)}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "11px 16px",
            background: loading
              ? "rgba(0,207,255,0.06)"
              : "rgba(0,207,255,0.14)",
            border: "1px solid rgba(0,207,255,0.42)",
            borderRadius: "6px",
            color: "#7de8ff",
            fontFamily: "'Orbitron',monospace",
            letterSpacing: "1px",
            cursor: loading ? "wait" : "pointer",
          }}
        >
          {loading
            ? "ASSESSING..."
            : assessment
              ? "REASSESS CURRENT SITUATION"
              : "ASSESS MY CURRENT SITUATION"}
        </button>
      </form>

      {locationNotice && (
        <p role="status" style={{ color: "#ffd27d", fontSize: "12px" }}>
          {locationNotice}
        </p>
      )}
      {error && (
        <p role="alert" style={{ color: "#ff8ba7", fontSize: "13px" }}>
          {error}
        </p>
      )}

      {assessment && (
        <div
          aria-live="polite"
          style={{
            marginTop: "18px",
            padding: "16px",
            background: "rgba(0,20,55,0.5)",
            border: "1px solid rgba(0,180,255,0.2)",
            borderRadius: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <strong
              style={{
                color:
                  assessment.riskLevel === "CRITICAL"
                    ? "#ff9aaa"
                    : assessment.riskLevel === "HIGH"
                      ? "#ffd27d"
                      : "#7de8ff",
                fontFamily: "'Orbitron',monospace",
                fontSize: "clamp(1.5rem, 5vw, 2rem)",
              }}
            >
              {assessment.riskScore}/100
            </strong>
            <span
              style={{
                color:
                  assessment.riskLevel === "CRITICAL"
                    ? "#ff9aaa"
                    : assessment.riskLevel === "HIGH"
                      ? "#ffd27d"
                      : "#00cfff",
                letterSpacing: "1px",
                fontFamily: "'Orbitron',monospace",
                fontWeight: 700,
              }}
            >
              {assessment.riskLevel}
            </span>
            <time
              dateTime={assessment.assessedAt}
              style={{
                color: "rgba(168,240,255,0.5)",
                fontSize: "11px",
                marginLeft: "auto",
              }}
            >
              {new Date(assessment.assessedAt).toLocaleString()}
            </time>
          </div>
          <p style={{ color: "rgba(168,240,255,0.65)", margin: "8px 0 16px" }}>
            Based on the situation you described.
          </p>
          <h3
            style={{
              color: "#7de8ff",
              fontSize: 11,
              letterSpacing: 2,
              fontFamily: "'Courier New',monospace",
            }}
          >
            KEY RISK FACTORS
          </h3>
          {assessment.riskFactors.length > 0 ? (
            <ul
              style={{
                color: "rgba(168,240,255,0.7)",
                paddingLeft: "20px",
                marginBottom: "16px",
              }}
            >
              {assessment.riskFactors.map((factor) => (
                <li key={factor.code} style={{ marginBottom: "5px" }}>
                  {factor.description}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: "rgba(168,240,255,0.55)", fontSize: "12px" }}>
              No additional risk factors were identified in the information you
              provided.
            </p>
          )}
          <h3
            style={{
              color: "#7de8ff",
              fontSize: 11,
              letterSpacing: 2,
              fontFamily: "'Courier New',monospace",
            }}
          >
            RECOMMENDED ACTION
          </h3>
          <p style={{ color: "#a8f0ff", margin: "8px 0 16px", lineHeight: 1.5 }}>
            {assessment.recommendation}
          </p>
          {["HIGH", "CRITICAL"].includes(assessment.riskLevel) && (
            <div
              style={{
                margin: "16px 0",
                padding: "16px",
                background:
                  assessment.riskLevel === "CRITICAL"
                    ? "rgba(110,16,38,0.42)"
                    : "rgba(0,100,150,0.2)",
                border:
                  assessment.riskLevel === "CRITICAL"
                    ? "2px solid rgba(255,87,115,0.85)"
                    : "1px solid rgba(0,207,255,0.5)",
                borderRadius: "8px",
                boxShadow:
                  assessment.riskLevel === "CRITICAL"
                    ? "0 0 24px rgba(255,45,85,0.24)"
                    : "0 0 16px rgba(0,180,255,0.12)",
              }}
            >
              <h3
                style={{
                  margin: "0 0 8px",
                  color: assessment.riskLevel === "CRITICAL" ? "#ffb7c3" : "#b8efff",
                  fontFamily: "'Orbitron',monospace",
                  fontSize: 13,
                  letterSpacing: 1,
                }}
              >
                {assessment.riskLevel === "CRITICAL"
                  ? "IMMEDIATE SAFETY ACTION RECOMMENDED"
                  : "CONSIDER TAKING A SAFETY ACTION"}
              </h3>
              <p
                style={{
                  margin: "0 0 12px",
                  color:
                    assessment.riskLevel === "CRITICAL" ? "#ffd5dc" : "#b8efff",
                  fontWeight: assessment.riskLevel === "CRITICAL" ? 700 : 500,
                }}
              >
                {assessment.riskLevel === "CRITICAL"
                  ? "If you may be in immediate danger, move toward a populated, well-lit place if possible, and contact local emergency services or someone you trust."
                  : "Consider moving toward a populated, well-lit place and letting someone you trust know how you are."}
              </p>
              <button
                type="button"
                onClick={() => navigate("/home#sos-assistance")}
                style={{
                  width: "100%",
                  padding: assessment.riskLevel === "CRITICAL" ? "14px 18px" : "12px 16px",
                  background:
                    assessment.riskLevel === "CRITICAL"
                      ? "linear-gradient(90deg, #9e1735, #d52d4d)"
                      : "linear-gradient(90deg, rgba(0,100,180,0.65), rgba(0,170,210,0.42))",
                  border:
                    assessment.riskLevel === "CRITICAL"
                      ? "2px solid #ff8a9e"
                      : "1px solid rgba(0,207,255,0.72)",
                  borderRadius: "6px",
                  color: "#fff",
                  fontFamily: "'Orbitron',monospace",
                  fontSize: assessment.riskLevel === "CRITICAL" ? "0.95rem" : "0.85rem",
                  fontWeight: 700,
                  letterSpacing: "1px",
                  cursor: "pointer",
                  boxShadow:
                    assessment.riskLevel === "CRITICAL"
                      ? "0 0 20px rgba(255,45,85,0.35)"
                      : "0 0 12px rgba(0,180,255,0.2)",
                }}
              >
                {assessment.riskLevel === "CRITICAL"
                  ? "OPEN EMERGENCY SOS OPTIONS"
                  : "OPEN SOS OPTIONS"}
              </button>
              <p
                style={{
                  margin: "10px 0 0",
                  color: "rgba(230,240,255,0.78)",
                  fontSize: "12px",
                  lineHeight: 1.5,
                }}
              >
                This opens the existing SOS screen only; it does not send an
                SOS. To continue, tap ENABLE VOICE, say “HELP,” and allow
                location access when prompted.
              </p>
            </div>
          )}
        </div>
      )}

      <section
        aria-labelledby="safety-history-title"
        style={{
          marginTop: 18,
          padding: "16px",
          background: "rgba(0,20,55,0.35)",
          border: "1px solid rgba(0,180,255,0.16)",
          borderRadius: 8,
        }}
      >
        <h3
          id="safety-history-title"
          style={{
            margin: "0 0 6px",
            color: "#7de8ff",
            fontFamily: "'Orbitron',monospace",
            fontSize: 12,
            letterSpacing: 1,
          }}
        >
          MY SAFETY ACTIVITY
        </h3>
        <p style={{ margin: "0 0 14px", color: "rgba(168,240,255,0.55)", fontSize: 12 }}>
          Safety history is stored only on this device and is not uploaded to
          ShieldHer.
        </p>
        {!safetyHistory.available && (
          <p role="status" style={{ color: "#ffd27d", fontSize: 12 }}>
            Local storage is unavailable; safety history cannot be loaded or
            saved on this device.
          </p>
        )}
        {todayEntries.length > 0 && (
          <>
            <h4 style={{ color: "#a8f0ff", margin: "0 0 8px", fontSize: 12 }}>
              TODAY
            </h4>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: "0 0 14px",
                display: "grid",
                gap: 7,
              }}
            >
              {todayEntries.slice(0, 6).map((entry) => (
                <li
                  key={entry.assessedAt}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    color: "rgba(168,240,255,0.78)",
                    fontSize: 13,
                  }}
                >
                  <time dateTime={entry.assessedAt}>
                    {new Date(entry.assessedAt).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </time>
                  <span>
                    {entry.riskLevel} — {entry.riskScore}/100
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
        {earlierEntries.length > 0 && (
          <>
            <h4 style={{ color: "#a8f0ff", margin: "0 0 8px", fontSize: 12 }}>
              RECENT ASSESSMENTS
            </h4>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: "0 0 14px",
                display: "grid",
                gap: 7,
              }}
            >
              {earlierEntries.map((entry) => (
                <li
                  key={entry.assessedAt}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    color: "rgba(168,240,255,0.78)",
                    fontSize: 13,
                  }}
                >
                  <time dateTime={entry.assessedAt}>
                    {new Date(entry.assessedAt).toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </time>
                  <span>
                    {entry.riskLevel} — {entry.riskScore}/100
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
        <h4 style={{ color: "#a8f0ff", margin: "0 0 8px", fontSize: 12 }}>
          THIS WEEK
        </h4>
        <div style={{ display: "grid", gap: 7 }}>
          {RISK_LEVELS.map((level) => (
            <div
              key={level}
              style={{
                display: "grid",
                gridTemplateColumns: "76px minmax(0,1fr) 24px",
                alignItems: "center",
                gap: 8,
                color: "rgba(168,240,255,0.72)",
                fontSize: 11,
              }}
            >
              <span>{level}</span>
              <div
                aria-hidden="true"
                style={{
                  height: 6,
                  background: "rgba(0,180,255,0.12)",
                  borderRadius: 4,
                }}
              >
                <div
                  style={{
                    width: `${(weeklyCounts[level] / maxWeeklyCount) * 100}%`,
                    height: "100%",
                    background: "#00cfff",
                    borderRadius: 4,
                  }}
                />
              </div>
              <span aria-label={`${weeklyCounts[level]} ${level} assessments`}>
                {weeklyCounts[level]}
              </span>
            </div>
          ))}
        </div>
        {safetyHistory.entries.length === 0 && safetyHistory.available && (
          <p style={{ color: "rgba(168,240,255,0.55)", fontSize: 12 }}>
            No saved assessments yet. Complete an assessment to see your
            activity here.
          </p>
        )}
        {historyNotice && (
          <p role="alert" style={{ color: "#ffd27d", fontSize: 12 }}>
            {historyNotice}
          </p>
        )}
        <button
          type="button"
          onClick={clearSafetyHistory}
          style={{
            marginTop: 12,
            padding: "8px 12px",
            background: "transparent",
            border: "1px solid rgba(0,180,255,0.3)",
            borderRadius: 5,
            color: "#a8f0ff",
            cursor: "pointer",
            fontFamily: "'Courier New',monospace",
            fontSize: 11,
          }}
        >
          CLEAR HISTORY
        </button>
      </section>
    </section>
  );
}
