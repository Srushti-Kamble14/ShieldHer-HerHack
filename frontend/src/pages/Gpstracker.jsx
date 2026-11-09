
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { triggerSOS } from "../services/sosService";

export default function VoiceGPS() {
  const navigate = useNavigate();
  const [listening, setListening] = useState(false);
  const [sending, setSending] = useState(false);
  const [location, setLocation] = useState(null);

  const startVoice = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "en-US";

    recognition.onstart = () => setListening(true);

    recognition.onresult = (event) => {
      const text = event.results[event.results.length - 1][0].transcript
        .toLowerCase()
        .trim();
      console.log("Heard:", text);

      if (text.includes("help")) {
        sendSOS();
      }
    };

    recognition.onerror = (e) => {
      console.error("Voice error:", e.error);
      setListening(false);
    };

    recognition.start();
  };

  const sendSOS = () => {
    if (sending) return;
    setSending(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        // Show map immediately
        setLocation({ lat, lng });

        try {
         const res = await triggerSOS(lat, lng);
          console.log("SOS Response:", res);

          // ✅ Use res.contacts OR res.success — whichever has data
          const notifiedContacts = res.contacts?.length
            ? res.contacts
            : res.success?.length
            ? res.success
            : [];

          setTimeout(() => {
            navigate("/sos-confirmation", {
              state: {
                contacts: notifiedContacts,
                lat,
                lng,
              },
            });
          }, 2500);
        } catch (err) {
          console.error("SOS failed:", err);
          setSending(false);
        }
      },
      (err) => {
        alert("Location error: " + err.message);
        setSending(false);
      }
    );
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
        {/* Scan line */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: 1,
            background:
              "linear-gradient(90deg,transparent,rgba(0,207,255,.3),transparent)",
            animation: "scanLine 5s linear infinite",
            pointerEvents: "none",
          }}
        />

        {/* Pulse rings — while sending */}
        {sending &&
          [120, 160, 200].map((size, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: size,
                height: size,
                borderRadius: "50%",
                border: "1px solid rgba(0,255,136,.25)",
                animation: `pulseRing 2s ${i * 0.5}s ease-out infinite`,
                pointerEvents: "none",
              }}
            />
          ))}

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
          VOICE ACTIVATION
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
          Say <span style={{ color: "#00cfff" }}>"HELP"</span> to automatically
          detect and display your current location on the map.
        </p>

        {/* Listening indicator */}
        {listening && !sending && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              animation: "fadeUp .4s both",
            }}
          >
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#00ff88",
                boxShadow: "0 0 8px #00ff88",
                animation: "blink 1s infinite",
              }}
            />
            <span
              style={{
                fontFamily: "'Courier New',monospace",
                fontSize: 11,
                color: "rgba(0,207,255,.5)",
                letterSpacing: 2,
              }}
            >
              LISTENING FOR TRIGGER WORD
            </span>
          </div>
        )}

        {/* Sending indicator */}
        {sending && (
          <div
            style={{
              color: "#ffcc00",
              fontSize: 13,
              letterSpacing: 2,
              fontFamily: "'Orbitron',monospace",
              animation: "fadeUp .4s both",
            }}
          >
            SENDING SOS...
          </div>
        )}

        {/* Enable Voice Button */}
        <button
          onClick={startVoice}
          disabled={listening}
          style={{
            padding: "14px 36px",
            background: listening
              ? "rgba(0,255,150,0.1)"
              : "linear-gradient(90deg, rgba(0,100,200,0.4), rgba(0,207,255,0.3))",
            border: `1px solid ${listening ? "rgba(0,255,150,0.5)" : "rgba(0,207,255,0.6)"}`,
            borderRadius: "8px",
            color: "#7de8ff",
            fontSize: "13px",
            letterSpacing: "2px",
            fontFamily: "'Orbitron', monospace",
            fontWeight: 700,
            cursor: listening ? "default" : "pointer",
            boxShadow: listening
              ? "0 0 25px rgba(0,255,150,0.3)"
              : "0 0 25px rgba(0,207,255,0.2)",
            transition: "all 0.3s ease",
          }}
        >
          {listening ? "LISTENING..." : "ENABLE VOICE"}
        </button>

        {/* Expandable Map Box */}
        <div
          style={{
            width: location ? "80%" : "0px",
            height: location ? "45vh" : "0px",
            opacity: location ? 1 : 0,
            transition: "all 0.5s cubic-bezier(0.23,1,0.32,1)",
            border: location ? "1px solid rgba(0,207,255,0.4)" : "none",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          {location && (
            <div
              style={{
                padding: "6px 14px",
                background: "rgba(0,20,50,.9)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#00ff88",
                  boxShadow: "0 0 6px #00ff88",
                  animation: "blink 1.5s infinite",
                }}
              />
              <span
                style={{
                  fontFamily: "'Courier New',monospace",
                  fontSize: 10,
                  color: "rgba(0,207,255,.5)",
                  letterSpacing: 2,
                }}
              >
                LOCATION CAPTURED · REDIRECTING...
              </span>
              <span
                style={{
                  marginLeft: "auto",
                  fontFamily: "'Courier New',monospace",
                  fontSize: 10,
                  color: "rgba(0,255,136,.4)",
                }}
              >
                {location.lat.toFixed(4)}° N, {location.lng.toFixed(4)}° E
              </span>
            </div>
          )}

          {location && (
            <iframe
              title="map"
              width="100%"
              height="100%"
              style={{ border: "none", display: "block" }}
              src={`https://maps.google.com/maps?q=${location.lat},${location.lng}&z=15&output=embed`}
            />
          )}
        </div>
      </div>
    </div>
  );
}
