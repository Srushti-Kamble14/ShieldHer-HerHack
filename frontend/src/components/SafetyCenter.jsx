import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { calculateSafetyInsights } from "../services/safetyInsights";
import {
  clearSafetyActivity,
  readLocalSafetyValue,
  readSafetyActivity,
  RISK_LEVELS,
  SAFETY_ACTIVITY_EVENT,
  SAFETY_CHECK_IN_KEY,
  SAFE_JOURNEY_KEY,
  SAFETY_PLAN_KEY,
  writeLocalSafetyValue,
} from "../services/safetyLocalData";

const CHECK_IN_DURATIONS = [15, 30, 60, 120];
const JOURNEY_DURATIONS = [30, 60, 120, 240];
const JOURNEY_CHECK_IN_MINUTES = 15;
const cardStyle = {
  padding: "clamp(16px, 3vw, 22px)",
  background: "rgba(4,13,28,0.88)",
  border: "1px solid rgba(0,180,255,0.2)",
  borderRadius: 10,
};

const buttonStyle = {
  padding: "10px 14px",
  background: "rgba(0,207,255,0.12)",
  border: "1px solid rgba(0,207,255,0.42)",
  borderRadius: 6,
  color: "#a8f0ff",
  fontFamily: "'Courier New',monospace",
  fontSize: 11,
  letterSpacing: 0.8,
  cursor: "pointer",
};

const fieldStyle = {
  width: "100%",
  marginTop: 6,
  padding: "9px 10px",
  background: "rgba(0,20,55,0.7)",
  border: "1px solid rgba(0,180,255,0.25)",
  borderRadius: 5,
  color: "#a8f0ff",
};

const validTimedRecord = (record, statuses) =>
  record &&
  typeof record.id === "string" &&
  Number.isFinite(Date.parse(record.startedAt)) &&
  Number.isFinite(Date.parse(record.expiresAt)) &&
  statuses.includes(record.status) &&
  Number.isInteger(record.durationMinutes);

const readCheckIn = () => {
  const result = readLocalSafetyValue(SAFETY_CHECK_IN_KEY);
  const value = result.value;
  return {
    value: validTimedRecord(value, ["active", "completed", "expired", "cancelled"])
      ? {
          id: value.id,
          startedAt: value.startedAt,
          expiresAt: value.expiresAt,
          status: value.status,
          durationMinutes: value.durationMinutes,
        }
      : null,
    available: result.available,
  };
};

const readJourney = () => {
  const result = readLocalSafetyValue(SAFE_JOURNEY_KEY);
  const value = result.value;
  if (
    !validTimedRecord(value, [
      "active",
      "check-in-due",
      "completed",
      "expired",
      "cancelled",
    ])
  ) {
    return { value: null, available: result.available };
  }
  if (
    value.nextCheckInAt !== null &&
    value.nextCheckInAt !== undefined &&
    !Number.isFinite(Date.parse(value.nextCheckInAt))
  ) {
    return { value: null, available: result.available };
  }
  return {
    value: {
      id: value.id,
      startedAt: value.startedAt,
      expiresAt: value.expiresAt,
      status: value.status,
      durationMinutes: value.durationMinutes,
      destination:
        typeof value.destination === "string"
          ? value.destination.slice(0, 80)
          : "",
      nextCheckInAt: value.nextCheckInAt || null,
    },
    available: result.available,
  };
};

const readPlan = () => {
  const result = readLocalSafetyValue(SAFETY_PLAN_KEY);
  const value = result.value;
  return {
    value: {
      checkInMinutes: CHECK_IN_DURATIONS.includes(value?.checkInMinutes)
        ? value.checkInMinutes
        : 30,
    },
    available: result.available,
  };
};

const createId = () =>
  globalThis.crypto?.randomUUID?.() ||
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const formatRemaining = (expiresAt, now) => {
  if (!now) return "CHECKING...";
  const remaining = Math.max(0, Date.parse(expiresAt) - now);
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

function SafetyActivityInsights() {
  const [history, setHistory] = useState(readSafetyActivity);
  const [now, setNow] = useState(0);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const updateTime = () => setNow(Date.now());
    const initialTimer = window.setTimeout(updateTime, 0);
    const clockTimer = window.setInterval(updateTime, 60000);
    const refresh = () => {
      setHistory(readSafetyActivity());
      setNow(Date.now());
    };
    window.addEventListener(SAFETY_ACTIVITY_EVENT, refresh);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(clockTimer);
      window.removeEventListener(SAFETY_ACTIVITY_EVENT, refresh);
    };
  }, []);

  const insights = calculateSafetyInsights(history.entries, now);
  const maxCount = Math.max(1, ...Object.values(insights.riskCounts));
  const clearHistory = () => {
    const result = clearSafetyActivity();
    setHistory(result);
    setNotice(
      result.available
        ? ""
        : "History could not be cleared from this device.",
    );
  };

  return (
    <section aria-labelledby="safety-insights-title" style={cardStyle}>
      <h3 id="safety-insights-title" style={headingStyle}>
        SAFETY INSIGHTS
      </h3>
      <p style={subtleTextStyle}>
        Stored only on this device. Insights are calculated from saved
        assessment scores and timestamps; assessment answers are not retained.
      </p>
      {!history.available ? (
        <p role="status" style={warningTextStyle}>
          Local storage is unavailable. Safety insights cannot be loaded.
        </p>
      ) : history.entries.length === 0 ? (
        <p style={subtleTextStyle}>
          No safety assessments yet. Complete a risk assessment to start building
          your private safety insights.
        </p>
      ) : (
        <>
          <h4 style={subheadingStyle}>THIS WEEK</h4>
          <p style={bodyTextStyle}>
            Assessments: {insights.thisWeek.length}
            {insights.currentAverage !== null &&
              ` · Average risk score: ${insights.currentAverage}`}
          </p>
          <div style={{ display: "grid", gap: 7 }}>
            {RISK_LEVELS.map((level) => (
              <div
                key={level}
                style={{
                  display: "grid",
                  gridTemplateColumns: "76px minmax(0,1fr) 24px",
                  alignItems: "center",
                  gap: 8,
                  color: "rgba(168,240,255,0.78)",
                  fontSize: 11,
                }}
              >
                <span>{level}</span>
                <div
                  aria-hidden="true"
                  style={{
                    height: 6,
                    borderRadius: 4,
                    background: "rgba(0,180,255,0.12)",
                  }}
                >
                  <div
                    style={{
                      width: `${(insights.riskCounts[level] / maxCount) * 100}%`,
                      height: "100%",
                      borderRadius: 4,
                      background: "#00cfff",
                    }}
                  />
                </div>
                <span>{insights.riskCounts[level]}</span>
              </div>
            ))}
          </div>
          <dl style={definitionListStyle}>
            <dt>Trend</dt>
            <dd>{insights.trend}</dd>
            <dt>Most common risk level</dt>
            <dd>{insights.mostCommonLevel || "No assessments this week"}</dd>
            <dt>Most common assessment period</dt>
            <dd>
              {insights.mostCommonPeriod || "No assessments this week"}
            </dd>
          </dl>
        </>
      )}
      {notice && (
        <p role="alert" style={warningTextStyle}>
          {notice}
        </p>
      )}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
        <button
          type="button"
          style={buttonStyle}
          onClick={() => {
            setHistory(readSafetyActivity());
            setNow(Date.now());
            setNotice("");
          }}
        >
          REFRESH INSIGHTS
        </button>
        <button type="button" style={buttonStyle} onClick={clearHistory}>
          CLEAR HISTORY
        </button>
      </div>
    </section>
  );
}

function SafetyCheckIn({ plan, contacts, onStatusChange, otherModeActive }) {
  const [initial] = useState(readCheckIn);
  const [record, setRecord] = useState(initial.value);
  const [available, setAvailable] = useState(initial.available);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [now, setNow] = useState(0);
  const [notice, setNotice] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (record?.status !== "active") return undefined;
    const update = () => {
      const currentTime = Date.now();
      setNow(currentTime);
      if (Date.parse(record.expiresAt) <= currentTime) {
        const expired = { ...record, status: "expired" };
        setRecord(expired);
        setAvailable(writeLocalSafetyValue(SAFETY_CHECK_IN_KEY, expired));
      }
    };
    const initialTimer = window.setTimeout(update, 0);
    const clockTimer = window.setInterval(update, 1000);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(clockTimer);
    };
  }, [record]);

  useEffect(() => {
    onStatusChange(record?.status || "not-started");
  }, [onStatusChange, record?.status]);

  const updateRecord = (updated) => {
    setRecord(updated);
    const saved = writeLocalSafetyValue(SAFETY_CHECK_IN_KEY, updated);
    setAvailable(saved);
    setNotice(saved ? "" : "This check-in could not be saved on this device.");
  };

  const start = () => {
    if (
      otherModeActive ||
      ["active", "check-in-due"].includes(readJourney().value?.status)
    ) {
      setNotice("Finish or stop the active Safe Journey before starting a check-in.");
      return;
    }
    if (!available) {
      setNotice("Local storage is unavailable; a refreshable check-in cannot start.");
      return;
    }
    const started = Date.now();
    setNow(started);
    const duration = selectedDuration ?? plan.checkInMinutes;
    updateRecord({
      id: createId(),
      startedAt: new Date(started).toISOString(),
      expiresAt: new Date(started + duration * 60000).toISOString(),
      status: "active",
      durationMinutes: duration,
    });
  };

  return (
    <section aria-labelledby="check-in-title" style={cardStyle}>
      <h3 id="check-in-title" style={headingStyle}>
        SAFETY CHECK-IN
      </h3>
      <p style={subtleTextStyle}>
        Set a local countdown reminder to confirm you are safe. It runs only
        while this page is open or after you return; expiry never sends SOS or
        notifies contacts automatically.
      </p>
      {record?.status === "active" ? (
        <>
          <p role="timer" aria-live="off" style={timerStyle}>
            {formatRemaining(record.expiresAt, now)}
          </p>
          <p style={bodyTextStyle}>Check-in reminder is active on this device.</p>
          <div style={actionRowStyle}>
            <button
              type="button"
              style={buttonStyle}
              onClick={() =>
                updateRecord({ ...record, status: "completed" })
              }
            >
              I'M SAFE
            </button>
            <button
              type="button"
              style={buttonStyle}
              onClick={() => updateRecord({ ...record, status: "cancelled" })}
            >
              CANCEL
            </button>
          </div>
        </>
      ) : record?.status === "expired" ? (
        <div role="alert" style={expiredBoxStyle}>
          <strong>Check-in expired. Are you safe?</strong>
          <p style={subtleTextStyle}>
            No SOS or contact notification was sent automatically.
          </p>
          <div style={actionRowStyle}>
            <button
              type="button"
              style={buttonStyle}
              onClick={() =>
                updateRecord({ ...record, status: "completed" })
              }
            >
              I'M SAFE
            </button>
            <button
              type="button"
              style={emergencyButtonStyle}
              onClick={() => navigate("/home#sos-assistance")}
            >
              OPEN SOS OPTIONS
            </button>
          </div>
          {contacts.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <p style={subtleTextStyle}>Call a saved trusted contact:</p>
              <div style={actionRowStyle}>
                {contacts
                  .filter((contact) => contact.phone)
                  .map((contact, index) => (
                    <a
                      key={`${contact.phone}-${index}`}
                      href={`tel:${contact.phone}`}
                      style={buttonLinkStyle}
                    >
                      CALL {contact.name || "CONTACT"}
                    </a>
                  ))}
              </div>
            </div>
          )}
          <p style={subtleTextStyle}>
            Live location sharing is available only within an active SOS
            confirmation flow; it is not started from this check-in.
          </p>
        </div>
      ) : (
        <>
          {record?.status === "completed" && (
            <p role="status" style={bodyTextStyle}>
              Check-in completed.
            </p>
          )}
          {record?.status === "cancelled" && (
            <p role="status" style={bodyTextStyle}>
              Previous check-in cancelled.
            </p>
          )}
          <label style={fieldLabelStyle}>
            Reminder after
            <select
              value={selectedDuration ?? plan.checkInMinutes}
              onChange={(event) =>
                setSelectedDuration(Number(event.target.value))
              }
              style={fieldStyle}
            >
              {CHECK_IN_DURATIONS.map((minutes) => (
                <option key={minutes} value={minutes}>
                  {minutes} minutes
                </option>
              ))}
            </select>
          </label>
          {otherModeActive && (
            <p style={subtleTextStyle}>
              Complete or stop the active Safe Journey before starting a
              separate check-in.
            </p>
          )}
          <button
            type="button"
            style={{ ...buttonStyle, marginTop: 12 }}
            onClick={start}
            disabled={!available || otherModeActive}
          >
            START CHECK-IN
          </button>
        </>
      )}
      {!available && (
        <p role="status" style={warningTextStyle}>
          Local storage is unavailable. Check-in persistence is unavailable on
          this device.
        </p>
      )}
      {notice && (
        <p role="alert" style={warningTextStyle}>
          {notice}
        </p>
      )}
    </section>
  );
}

function SafeJourney({ contacts, onStatusChange, otherModeActive }) {
  const [initial] = useState(readJourney);
  const [journey, setJourney] = useState(initial.value);
  const [available, setAvailable] = useState(initial.available);
  const [duration, setDuration] = useState(60);
  const [destination, setDestination] = useState("");
  const [now, setNow] = useState(0);
  const [notice, setNotice] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!["active", "check-in-due"].includes(journey?.status)) {
      return undefined;
    }
    const update = () => {
      const currentTime = Date.now();
      setNow(currentTime);
      let updated = journey;
      if (Date.parse(journey.expiresAt) <= currentTime) {
        updated = { ...journey, status: "expired" };
      } else if (
        journey.status === "active" &&
        journey.nextCheckInAt &&
        Date.parse(journey.nextCheckInAt) <= currentTime
      ) {
        updated = { ...journey, status: "check-in-due" };
      }
      if (updated !== journey) {
        setJourney(updated);
        setAvailable(writeLocalSafetyValue(SAFE_JOURNEY_KEY, updated));
      }
    };
    const initialTimer = window.setTimeout(update, 0);
    const clockTimer = window.setInterval(update, 1000);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(clockTimer);
    };
  }, [journey]);

  useEffect(() => {
    onStatusChange(journey?.status || "not-started");
  }, [journey?.status, onStatusChange]);

  const updateJourney = (updated) => {
    setJourney(updated);
    const saved = writeLocalSafetyValue(SAFE_JOURNEY_KEY, updated);
    setAvailable(saved);
    setNotice(saved ? "" : "Journey status could not be saved on this device.");
  };

  const start = () => {
    if (otherModeActive || readCheckIn().value?.status === "active") {
      setNotice("Finish or cancel the active check-in before starting a Safe Journey.");
      return;
    }
    if (!available) {
      setNotice("Local storage is unavailable; this refreshable journey cannot start.");
      return;
    }
    const started = Date.now();
    setNow(started);
    const expiresAt = started + duration * 60000;
    updateJourney({
      id: createId(),
      startedAt: new Date(started).toISOString(),
      expiresAt: new Date(expiresAt).toISOString(),
      destination: destination.trim().slice(0, 80),
      durationMinutes: duration,
      status: "active",
      nextCheckInAt: new Date(
        Math.min(
          started + JOURNEY_CHECK_IN_MINUTES * 60000,
          expiresAt,
        ),
      ).toISOString(),
    });
  };

  const checkIn = () => {
    const currentTime = Date.now();
    setNow(currentTime);
    const expiration = Date.parse(journey.expiresAt);
    if (expiration <= currentTime) {
      updateJourney({ ...journey, status: "expired" });
      return;
    }
    updateJourney({
      ...journey,
      status: "active",
      nextCheckInAt: new Date(
        Math.min(currentTime + JOURNEY_CHECK_IN_MINUTES * 60000, expiration),
      ).toISOString(),
    });
  };

  return (
    <section aria-labelledby="safe-journey-title" style={cardStyle}>
      <h3 id="safe-journey-title" style={headingStyle}>
        SAFE JOURNEY
      </h3>
      <p style={subtleTextStyle}>
        A local timer and manual check-in reminder, updated while this page is
        open or after you return. ShieldHer does not detect arrival or
        continuously track this journey.
      </p>
      {journey && ["active", "check-in-due"].includes(journey.status) ? (
        <>
          <p style={statusLabelStyle}>
            {journey.status === "check-in-due"
              ? "CHECK-IN DUE"
              : "SAFE JOURNEY ACTIVE"}
          </p>
          {journey.destination && (
            <p style={bodyTextStyle}>
              Destination: {journey.destination}
            </p>
          )}
          <p role="timer" aria-live="off" style={timerStyle}>
            {formatRemaining(journey.expiresAt, now)}
          </p>
          {journey.status === "check-in-due" && (
            <p role="alert" style={warningTextStyle}>
              Are you still on your way?
            </p>
          )}
          <div style={actionRowStyle}>
            <button type="button" style={buttonStyle} onClick={checkIn}>
              I'M OK
            </button>
            <button
              type="button"
              style={buttonStyle}
              onClick={() =>
                updateJourney({ ...journey, status: "completed" })
              }
            >
              ARRIVED SAFELY
            </button>
            <button
              type="button"
              style={buttonStyle}
              onClick={() =>
                updateJourney({ ...journey, status: "cancelled" })
              }
            >
              STOP JOURNEY
            </button>
          </div>
          <p style={subtleTextStyle}>
            Live location is not active. The existing live-sharing feature
            requires an active SOS confirmation and an explicit start action.
          </p>
        </>
      ) : journey?.status === "expired" ? (
        <div role="alert" style={expiredBoxStyle}>
          <strong>Your Safe Journey check-in has expired. Are you OK?</strong>
          <p style={subtleTextStyle}>
            This local reminder does not send an SOS or notify contacts.
          </p>
          <div style={actionRowStyle}>
            <button
              type="button"
              style={buttonStyle}
              onClick={() =>
                updateJourney({ ...journey, status: "completed" })
              }
            >
              I'M OK
            </button>
            <button
              type="button"
              style={emergencyButtonStyle}
              onClick={() => navigate("/home#sos-assistance")}
            >
              OPEN SOS OPTIONS
            </button>
          </div>
          {contacts.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <p style={subtleTextStyle}>Call a saved trusted contact:</p>
              <div style={actionRowStyle}>
                {contacts
                  .filter((contact) => contact.phone)
                  .map((contact, index) => (
                    <a
                      key={`${contact.phone}-${index}`}
                      href={`tel:${contact.phone}`}
                      style={buttonLinkStyle}
                    >
                      CALL {contact.name || "CONTACT"}
                    </a>
                  ))}
              </div>
            </div>
          )}
          <p style={subtleTextStyle}>
            Live sharing is available only in the confirmation flow of an
            explicitly started SOS.
          </p>
        </div>
      ) : (
        <>
          {journey?.status === "completed" && (
            <p role="status" style={bodyTextStyle}>
              Marked arrived safely.
            </p>
          )}
          {journey?.status === "cancelled" && (
            <p role="status" style={bodyTextStyle}>
              Previous journey stopped.
            </p>
          )}
          <label style={fieldLabelStyle}>
            Estimated journey duration
            <select
              value={duration}
              onChange={(event) => setDuration(Number(event.target.value))}
              style={fieldStyle}
            >
              {JOURNEY_DURATIONS.map((minutes) => (
                <option key={minutes} value={minutes}>
                  {minutes < 60 ? `${minutes} minutes` : `${minutes / 60} hour${minutes > 60 ? "s" : ""}`}
                </option>
              ))}
            </select>
          </label>
          <label style={{ ...fieldLabelStyle, marginTop: 10 }}>
            Destination label (optional, stored on this device)
            <input
              value={destination}
              maxLength={80}
              onChange={(event) => setDestination(event.target.value)}
              style={fieldStyle}
            />
          </label>
          {otherModeActive && (
            <p style={subtleTextStyle}>
              Complete or cancel the active check-in before starting a Safe
              Journey.
            </p>
          )}
          <button
            type="button"
            style={{ ...buttonStyle, marginTop: 12 }}
            onClick={start}
            disabled={!available || otherModeActive}
          >
            START SAFE JOURNEY
          </button>
        </>
      )}
      {!available && (
        <p role="status" style={warningTextStyle}>
          Local storage is unavailable. Journey persistence is unavailable on
          this device.
        </p>
      )}
      {notice && (
        <p role="alert" style={warningTextStyle}>
          {notice}
        </p>
      )}
    </section>
  );
}

function SafetyPlan({ contacts, plan, onPlanChange, available }) {
  const speechSupported = Boolean(
    window.SpeechRecognition || window.webkitSpeechRecognition,
  );
  const geolocationSupported = Boolean(navigator.geolocation);

  return (
    <section aria-labelledby="safety-plan-title" style={cardStyle}>
      <h3 id="safety-plan-title" style={headingStyle}>
        SAFETY PLAN
      </h3>
      <p style={subtleTextStyle}>
        Preferences are stored only on this device. Profile contacts remain in
        your existing profile.
      </p>
      <label style={fieldLabelStyle}>
        Default check-in reminder
        <select
          value={plan.checkInMinutes}
          onChange={(event) =>
            onPlanChange({
              ...plan,
              checkInMinutes: Number(event.target.value),
            })
          }
          style={fieldStyle}
        >
          {CHECK_IN_DURATIONS.map((minutes) => (
            <option key={minutes} value={minutes}>
              {minutes} minutes
            </option>
          ))}
        </select>
      </label>
      <div style={{ marginTop: 14 }}>
        <h4 style={subheadingStyle}>PREPARATION CHECKLIST</h4>
        <ul style={checklistStyle}>
          <li>{contacts.length} emergency contact(s) saved in profile</li>
          <li>
            Browser location request:{" "}
            {geolocationSupported ? "supported (permission not verified)" : "unavailable"}
          </li>
          <li>
            Browser speech recognition:{" "}
            {speechSupported ? "supported" : "not supported"}
          </li>
          <li>Phone battery status: not verified by this app</li>
          <li>Emergency number: not configured in ShieldHer</li>
          <li>Live sharing: available during an active SOS session</li>
        </ul>
      </div>
      <p style={subtleTextStyle}>
        Voice SOS uses browser speech recognition while the page is open. It
        does not provide background or locked-phone detection.
      </p>
      <button
        type="button"
        style={buttonStyle}
        disabled={!available}
        onClick={() => onPlanChange(plan, true)}
      >
        SAVE PREFERENCES
      </button>
    </section>
  );
}

function SafePlaces() {
  return (
    <section aria-labelledby="safe-places-title" style={cardStyle}>
      <h3 id="safe-places-title" style={headingStyle}>
        SAFE PLACES
      </h3>
      <p style={subtleTextStyle}>
        Nearby place search is not configured. ShieldHer has no real places
        provider connected, so it cannot show verified police stations,
        hospitals, pharmacies, or public places.
      </p>
      <p style={subtleTextStyle}>
        No location has been requested for this unavailable feature.
      </p>
    </section>
  );
}

function CapabilityCard({ title, description, status, href }) {
  return (
    <a
      href={href}
      style={{
        ...cardStyle,
        display: "block",
        color: "inherit",
        textDecoration: "none",
      }}
    >
      <h3 style={{ ...headingStyle, marginBottom: 8 }}>{title}</h3>
      <p style={{ ...subtleTextStyle, marginBottom: 8 }}>{description}</p>
      <span style={statusLabelStyle}>{status}</span>
    </a>
  );
}

const headingStyle = {
  margin: "0 0 8px",
  color: "#7de8ff",
  fontFamily: "'Orbitron',monospace",
  fontSize: 12,
  letterSpacing: 1.2,
};

const subheadingStyle = {
  margin: "12px 0 7px",
  color: "#a8f0ff",
  fontSize: 11,
  letterSpacing: 1.2,
};

const subtleTextStyle = {
  margin: "0 0 10px",
  color: "rgba(168,240,255,0.62)",
  fontSize: 12,
  lineHeight: 1.5,
};

const bodyTextStyle = {
  color: "rgba(168,240,255,0.86)",
  fontSize: 13,
  lineHeight: 1.5,
};

const warningTextStyle = {
  color: "#ffd27d",
  fontSize: 12,
  lineHeight: 1.5,
};

const timerStyle = {
  margin: "10px 0",
  color: "#7de8ff",
  fontFamily: "'Orbitron',monospace",
  fontSize: 30,
  fontWeight: 700,
};

const statusLabelStyle = {
  display: "inline-block",
  color: "#7de8ff",
  fontFamily: "'Courier New',monospace",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: 1,
};

const fieldLabelStyle = {
  display: "block",
  color: "rgba(168,240,255,0.8)",
  fontSize: 12,
};

const actionRowStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  margin: "12px 0",
};

const emergencyButtonStyle = {
  ...buttonStyle,
  background: "linear-gradient(90deg, #9e1735, #d52d4d)",
  border: "1px solid #ff8a9e",
  color: "#fff",
  fontWeight: 700,
};

const buttonLinkStyle = {
  ...buttonStyle,
  display: "inline-block",
  textDecoration: "none",
};

const expiredBoxStyle = {
  marginTop: 12,
  padding: 14,
  background: "rgba(110,16,38,0.25)",
  border: "1px solid rgba(255,87,115,0.58)",
  borderRadius: 8,
  color: "#ffd5dc",
};

const definitionListStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(120px,auto) 1fr",
  gap: "7px 12px",
  margin: "14px 0 0",
  color: "rgba(168,240,255,0.75)",
  fontSize: 12,
};

const checklistStyle = {
  display: "grid",
  gap: 7,
  paddingLeft: 18,
  color: "rgba(168,240,255,0.78)",
  fontSize: 12,
  lineHeight: 1.45,
};

export default function SafetyCenter({ contacts = [] }) {
  const [planState] = useState(readPlan);
  const [plan, setPlan] = useState(planState.value);
  const [planAvailable, setPlanAvailable] = useState(planState.available);
  const [planNotice, setPlanNotice] = useState("");
  const [checkInStatus, setCheckInStatus] = useState(
    () => readCheckIn().value?.status || "not-started",
  );
  const [journeyStatus, setJourneyStatus] = useState(
    () => readJourney().value?.status || "not-started",
  );
  const [planSaved, setPlanSaved] = useState(false);

  const savePlan = (updatedPlan, shouldSave = false) => {
    setPlan(updatedPlan);
    setPlanSaved(false);
    if (shouldSave) {
      const saved = writeLocalSafetyValue(SAFETY_PLAN_KEY, updatedPlan);
      setPlanAvailable(saved);
      setPlanSaved(saved);
      setPlanNotice(
        saved ? "" : "Preferences could not be saved on this device.",
      );
    }
  };

  return (
    <section
      aria-labelledby="safety-center-title"
      style={{ margin: "20px 0 28px" }}
    >
      <div style={{ marginBottom: 14 }}>
        <div style={{ ...statusLabelStyle, marginBottom: 6 }}>
          USER-CONTROLLED SAFETY FEATURES
        </div>
        <h2
          id="safety-center-title"
          style={{
            margin: 0,
            color: "#7de8ff",
            fontFamily: "'Orbitron',monospace",
            fontSize: "clamp(1.05rem, 3vw, 1.4rem)",
            letterSpacing: 1.5,
          }}
        >
          SAFETY CENTER
        </h2>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(min(260px,100%),1fr))",
          gap: 14,
        }}
      >
        <CapabilityCard
          title="Risk Assessment"
          description="Assess your current situation."
          status="AVAILABLE · ON DEMAND"
          href="#risk-assessment"
        />
        <CapabilityCard
          title="Safety Check-In"
          description="Set a local reminder to confirm you are safe."
          status={
            checkInStatus === "active"
              ? "ACTIVE"
              : checkInStatus === "expired"
                ? "CHECK-IN EXPIRED"
                : checkInStatus === "completed"
                  ? "COMPLETED"
                  : checkInStatus === "cancelled"
                    ? "CANCELLED"
                    : "NOT STARTED"
          }
          href="#safety-check-in"
        />
        <CapabilityCard
          title="Safe Journey"
          description="Use a local timer and manual journey check-ins."
          status={
            journeyStatus === "active" || journeyStatus === "check-in-due"
              ? journeyStatus === "check-in-due"
                ? "CHECK-IN DUE"
                : "ACTIVE"
              : journeyStatus === "expired"
                ? "EXPIRED"
                : journeyStatus === "completed"
                  ? "COMPLETED"
                  : journeyStatus === "cancelled"
                    ? "CANCELLED"
                    : "NOT STARTED"
          }
          href="#safe-journey"
        />
        <CapabilityCard
          title="Live Location Sharing"
          description="Share updates only after an SOS is started and you opt in."
          status="AVAILABLE DURING ACTIVE SOS"
          href="/home#sos-assistance"
        />
        <CapabilityCard
          title="Safety Insights"
          description="Review private assessment history on this device."
          status="LOCAL HISTORY"
          href="#safety-insights"
        />
        <CapabilityCard
          title="Safety Plan"
          description="Review browser capabilities and save local preferences."
          status="AVAILABLE"
          href="#safety-plan"
        />
        <CapabilityCard
          title="Safe Places"
          description="Nearby search needs a real places provider."
          status="NOT CONFIGURED"
          href="#safe-places"
        />
        <CapabilityCard
          title="SOS"
          description="Open the existing voice SOS screen; sending requires your action."
          status="AVAILABLE · USER-INITIATED"
          href="/home#sos-assistance"
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(min(300px,100%),1fr))",
          gap: 14,
          marginTop: 14,
        }}
      >
        <div id="safety-check-in">
          <SafetyCheckIn
            plan={plan}
            contacts={contacts}
            onStatusChange={setCheckInStatus}
            otherModeActive={["active", "check-in-due"].includes(journeyStatus)}
          />
        </div>
        <div id="safe-journey">
          <SafeJourney
            contacts={contacts}
            onStatusChange={setJourneyStatus}
            otherModeActive={checkInStatus === "active"}
          />
        </div>
      </div>
      {(["active"].includes(checkInStatus) ||
        ["active", "check-in-due"].includes(journeyStatus)) && (
        <p role="status" style={{ ...subtleTextStyle, marginTop: 10 }}>
          A local safety timer is running. It will not automatically contact
          anyone or trigger SOS.
        </p>
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(min(300px,100%),1fr))",
          gap: 14,
          marginTop: 14,
        }}
      >
        <div id="safety-insights">
          <SafetyActivityInsights />
        </div>
        <div id="safety-plan">
          <SafetyPlan
            contacts={contacts}
            plan={plan}
            onPlanChange={savePlan}
            available={planAvailable}
          />
          {planNotice && (
            <p role="alert" style={warningTextStyle}>
              {planNotice}
            </p>
          )}
          {planSaved && (
            <p role="status" style={subtleTextStyle}>
              Preferences saved on this device.
            </p>
          )}
        </div>
        <div id="safe-places">
          <SafePlaces />
        </div>
      </div>
    </section>
  );
}
