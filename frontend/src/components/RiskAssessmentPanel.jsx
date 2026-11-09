import { useState } from "react";
import { assessSafetyRisk } from "../services/riskAssessmentService";

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
  const [timeOfDay, setTimeOfDay] = useState(timeOfDayForNow);
  const [travellingAlone, setTravellingAlone] = useState(false);
  const [situation, setSituation] = useState("walking");
  const [additionalIndicators, setAdditionalIndicators] = useState([]);
  const [includeLocation, setIncludeLocation] = useState(false);
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [locationNotice, setLocationNotice] = useState("");

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
          HERHACK AI TRACK
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
          AI Safety Risk Assessment
        </h2>
        <p style={{ color: "rgba(168,240,255,0.65)", fontSize: "13px" }}>
          An explainable, rule-based estimate from the context you provide. It
          does not replace your judgment or emergency services.
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
          {loading ? "ASSESSING..." : "ASSESS MY CURRENT SITUATION"}
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
                color: "#7de8ff",
                fontFamily: "'Orbitron',monospace",
                fontSize: "1.1rem",
              }}
            >
              {assessment.riskScore}/100
            </strong>
            <span style={{ color: "#00cfff", letterSpacing: "1px" }}>
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
          <p style={{ color: "#a8f0ff", margin: "12px 0" }}>
            {assessment.recommendation}
          </p>
          {assessment.riskFactors.length > 0 ? (
            <ul style={{ color: "rgba(168,240,255,0.7)", paddingLeft: "20px" }}>
              {assessment.riskFactors.map((factor) => (
                <li key={factor.code} style={{ marginBottom: "5px" }}>
                  {factor.description} (+{factor.contribution})
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: "rgba(168,240,255,0.55)", fontSize: "12px" }}>
              No additional risk factors were selected.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
