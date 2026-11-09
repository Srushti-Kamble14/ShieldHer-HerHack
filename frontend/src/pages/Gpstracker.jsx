
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { triggerSOS } from "../services/sosService";

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

export default function VoiceGPS() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("ready");
  const [countdown, setCountdown] = useState(3);
  const [error, setError] = useState("");
  const recognitionRef = useRef(null);
  const countdownRef = useRef(null);
  const countdownDelayRef = useRef(null);
  const countdownDeadlineRef = useRef(null);
  const redirectRef = useRef(null);
  const sosStartedRef = useRef(false);

  const stopRecognition = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
  };

  const clearCountdown = () => {
    if (countdownRef.current !== null) {
      window.clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    if (countdownDelayRef.current !== null) {
      window.clearTimeout(countdownDelayRef.current);
      countdownDelayRef.current = null;
    }
  };

  useEffect(
    () => () => {
      stopRecognition();
      clearCountdown();
      if (redirectRef.current !== null) {
        window.clearTimeout(redirectRef.current);
      }
    },
    [],
  );

  const sendSOS = () => {
    if (sosStartedRef.current) return;
    sosStartedRef.current = true;
    clearCountdown();
    stopRecognition();
    setError("");
    setStatus("capturing-location");

    if (!navigator.geolocation) {
      setError("Location is unavailable in this browser. No SOS request was sent.");
      setStatus("error");
      sosStartedRef.current = false;
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setStatus("sending-sos");
        try {
          const result = await triggerSOS(
            position.coords.latitude,
            position.coords.longitude,
          );
          const contacts = result.contacts?.length
            ? result.contacts
            : result.success?.length
              ? result.success
              : [];
          setStatus("sos-sent");
          redirectRef.current = window.setTimeout(
            () =>
              navigate("/sos-confirmation", {
                state: {
                  contacts,
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                  sharingSessionId: result.sharingSessionId,
                },
              }),
            500,
          );
        } catch (requestError) {
          sosStartedRef.current = false;
          setError(
            requestError.message ||
              "The SOS request failed. No successful response was received.",
          );
          setStatus("error");
        }
      },
      (locationError) => {
        sosStartedRef.current = false;
        const message =
          locationError.code === 1
            ? "Location permission was denied. No SOS request was sent."
            : locationError.code === 3
              ? "Location capture timed out. No SOS request was sent."
              : "Location is unavailable. No SOS request was sent.";
        setError(message);
        setStatus("error");
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 30000 },
    );
  };

  const scheduleVoiceSOS = () => {
    stopRecognition();
    setStatus("voice-detected");
    setError("");
    countdownDelayRef.current = window.setTimeout(() => {
      countdownDelayRef.current = null;
      setStatus("preparing-sos");
      setCountdown(3);
      countdownDeadlineRef.current = Date.now() + 3000;
      countdownRef.current = window.setInterval(() => {
        const remaining = Math.ceil(
          (countdownDeadlineRef.current - Date.now()) / 1000,
        );
        if (remaining <= 0) {
          clearCountdown();
          setCountdown(0);
          sendSOS();
        } else {
          setCountdown(remaining);
        }
      }, 250);
    }, 350);
  };

  const startVoice = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatus("unsupported");
      setError("Voice SOS is not supported in this browser. Use the SOS button below.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setError("");
      setStatus("listening");
    };

    recognition.onresult = (event) => {
      const text = event.results[event.results.length - 1][0].transcript
        .toLowerCase()
        .trim();
      if (text.includes("help") && recognitionRef.current === recognition) {
        scheduleVoiceSOS();
      }
    };

    recognition.onerror = () => {
      recognitionRef.current = null;
      setStatus("error");
      setError("Browser voice recognition failed. You can use the SOS button below.");
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      setStatus((current) => (current === "listening" ? "ready" : current));
    };

    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setStatus("error");
      setError("Voice listening could not start. Use the SOS button below.");
    }
  };

  const cancelVoiceSOS = () => {
    clearCountdown();
    stopRecognition();
    setStatus("ready");
    setError("SOS cancelled. No SOS request was sent.");
  };

  const busy = [
    "capturing-location",
    "sending-sos",
    "sos-sent",
  ].includes(status);
  const statusLabels = {
    ready: "READY",
    unsupported: "VOICE SOS UNAVAILABLE",
    listening: "LISTENING",
    "voice-detected": "VOICE DETECTED",
    "preparing-sos": `SENDING SOS IN ${countdown} SECONDS`,
    "capturing-location": "CAPTURING LOCATION",
    "sending-sos": "SENDING SOS",
    "sos-sent": "SOS SENT",
    error: "ERROR",
  };

  return (
    <div
      style={{
        height: "100vh",
        background: "#040d1c",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.2} }
        @keyframes scanLine { 0%{top:0;opacity:.5} 100%{top:100%;opacity:0} }
        @keyframes pulseRing { 0%{transform:scale(1);opacity:.6} 100%{transform:scale(2.4);opacity:0} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div
        style={{
          width: "100vw",
          height: "100vh",
          position: "relative",
          background: `linear-gradient(rgba(4,13,28,0.55), rgba(4,13,28,0.65)),
          url("https://i.pinimg.com/1200x/32/62/95/3262954384b2d2e2d9da54bbabad6fdf.jpg")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "20px",
          textAlign: "center",
          padding: "20px",
          overflow: "hidden",
        }}
      >
        <h1
          style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: "36px",
            color: "#00cfff",
            letterSpacing: "3px",
            textShadow: "0 0 20px rgba(0,207,255,0.5)",
            margin: 0,
          }}
        >
          SOS ASSISTANCE
        </h1>

        <p
          style={{
            color: "#aaa",
            fontSize: "18px",
            maxWidth: "400px",
            lineHeight: "1.6",
            fontWeight: 500,
          }}
        >
          Voice SOS uses browser speech recognition while this page is open. It
          does not provide background or locked-phone detection. You can enable
          listening and say <span style={{ color: "#00cfff" }}>HELP</span>, or
          send an SOS manually below.
        </p>

        <p
          role="status"
          aria-live="polite"
          style={{
            color: status === "error" || status === "unsupported" ? "#ffd27d" : "#7de8ff",
            fontFamily: "'Courier New',monospace",
            fontSize: 12,
            letterSpacing: 1,
          }}
        >
          {statusLabels[status]}
        </p>
        {error && (
          <p role="alert" style={{ maxWidth: 420, color: "#ffd27d", fontSize: 13 }}>
            {error}
          </p>
        )}

        <button
          onClick={startVoice}
          disabled={busy || status === "listening" || status === "preparing-sos"}
          style={{
            padding: "14px 36px",
            background: status === "listening"
              ? "rgba(0,255,150,0.1)"
              : "linear-gradient(90deg, rgba(0,100,200,0.4), rgba(0,207,255,0.3))",
            border: `1px solid ${status === "listening" ? "rgba(0,255,150,0.5)" : "rgba(0,207,255,0.6)"}`,
            borderRadius: "8px",
            color: "#7de8ff",
            fontSize: "13px",
            letterSpacing: "2px",
            fontFamily: "'Orbitron', monospace",
            fontWeight: 700,
            cursor: status === "listening" || busy ? "default" : "pointer",
            boxShadow: status === "listening"
              ? "0 0 25px rgba(0,255,150,0.3)"
              : "0 0 25px rgba(0,207,255,0.2)",
            transition: "all 0.3s ease",
          }}
        >
          {status === "listening" ? "LISTENING..." : "ENABLE VOICE"}
        </button>

        {status === "preparing-sos" && (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            <p style={{ width: "100%", color: "#ffd5dc", fontSize: 14 }}>
              Emergency phrase detected. Sending SOS in {countdown} seconds.
            </p>
            <button type="button" onClick={cancelVoiceSOS} style={{ ...buttonStyle, borderColor: "#ff8a9e" }}>
              CANCEL
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={sendSOS}
          disabled={busy}
          style={{
            ...buttonStyle,
            padding: "14px 28px",
            background: "linear-gradient(90deg, #9e1735, #d52d4d)",
            border: "1px solid #ff8a9e",
            color: "#fff",
            opacity: busy ? 0.65 : 1,
            fontFamily: "'Orbitron', monospace",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {busy ? statusLabels[status] : "SEND SOS NOW"}
        </button>
        <p style={{ maxWidth: 420, color: "rgba(168,240,255,.62)", fontSize: 12, lineHeight: 1.5 }}>
          Starting either SOS option requests a one-time location and sends the
          initial notification. Live location sharing is separate and always
          requires an explicit start on the confirmation page.
        </p>
      </div>
    </div>
  );
}
