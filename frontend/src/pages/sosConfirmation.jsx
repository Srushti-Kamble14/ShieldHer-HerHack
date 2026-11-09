
import { useLocation, useNavigate } from "react-router-dom";
import voice from "../assets/voice.jpg";

/* ─── CSS ────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Rajdhani:wght@400;500;600;700&display=swap');
  *,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
  body{background:#060d1a;color:#a8f0ff;font-family:'Rajdhani',sans-serif;min-height:100vh;overflow-x:hidden;}
  ::-webkit-scrollbar{width:3px;}
  ::-webkit-scrollbar-track{background:#060d1a;}
  ::-webkit-scrollbar-thumb{background:#00cfff;border-radius:2px;}

  @keyframes fadeUp    {from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);}}
  @keyframes fadeIn    {from{opacity:0;}to{opacity:1;}}
  @keyframes blink     {0%,100%{opacity:1;}50%{opacity:0.2;}}
  @keyframes glow      {0%,100%{text-shadow:0 0 18px rgba(0,207,255,0.4);}50%{text-shadow:0 0 40px rgba(0,207,255,0.8);}}
  @keyframes spin      {from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
  @keyframes spinR     {from{transform:rotate(0deg);}to{transform:rotate(-360deg);}}
  @keyframes float     {0%,100%{transform:translateY(0);}50%{transform:translateY(-8px);}}
  @keyframes scanLine  {0%{top:0%;opacity:.6;}100%{top:100%;opacity:0;}}
  @keyframes pulseRing {0%,100%{box-shadow:0 0 0 0 rgba(0,207,255,0.45);}50%{box-shadow:0 0 0 14px rgba(0,207,255,0);}}
  @keyframes shieldOn  {0%,100%{box-shadow:0 0 20px rgba(0,207,255,0.3),0 0 60px rgba(0,100,200,0.15);}50%{box-shadow:0 0 40px rgba(0,207,255,0.55),0 0 100px rgba(0,100,200,0.3);}}
  @keyframes statusPing{0%{transform:scale(1);opacity:.7;}100%{transform:scale(2.2);opacity:0;}}
  @keyframes slideIn   {from{opacity:0;transform:translateX(-16px);}to{opacity:1;transform:translateX(0);}}
  @keyframes mapPing   {0%{transform:scale(1);opacity:.8;}100%{transform:scale(3);opacity:0;}}
  @keyframes radarSpin {from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
  @keyframes countUp   {from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
  @keyframes borderGlow{0%,100%{border-color:rgba(0,180,255,0.18);}50%{border-color:rgba(0,207,255,0.42);}}

  /* ── Responsive Layout ── */

  /* Stat grid: 4 cols → 2 cols → 2 cols (xs) */
  .stat-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 28px;
  }

  /* Main 3-col grid → 1 col on mobile */
  .main-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 20px;
    align-items: start;
  }

  /* Contacts auto-fill grid */
  .contacts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 12px;
  }

  /* Navbar */
  .nav-inner {
    padding: 0 32px;
  }
  .nav-title {
    font-family: 'Courier New', monospace;
    font-size: 20px;
    letter-spacing: 3px;
    color: rgba(0,207,255,0.42);
  }
  .nav-shield-label {
    font-size: 10px;
    letter-spacing: 2px;
  }
  .nav-shield-pill {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 6px 14px;
    background: rgba(0,207,255,0.06);
    border: 1px solid rgba(0,207,255,0.22);
    border-radius: 20px;
  }

  /* Trigger words grid */
  .trigger-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  /* SCard inner padding */
  .scard-body {
    padding: 22px 20px;
  }

  /* StatCard value font size */
  .stat-value {
    font-family: 'Orbitron', monospace;
    font-size: 1.5rem;
    font-weight: 700;
  }

  /* Welcome heading */
  .welcome-h1 {
    font-family: 'Orbitron', monospace;
    font-size: clamp(1.2rem, 3vw, 2.2rem);
    font-weight: 700;
    letter-spacing: 3px;
    color: #7de8ff;
    text-shadow: 0 0 28px rgba(0,207,255,0.35);
    animation: glow 5s ease-in-out infinite;
  }

  .sos-btn {
    padding: 14px 32px;
    font-size: 12px;
    letter-spacing: 2.5px;
  }

  /* Main padding */
  .main-pad {
    padding: 84px 24px 60px;
  }

  /* ── Tablet ── */
  @media (max-width: 900px) {
    .stat-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    .main-grid {
      grid-template-columns: 1fr;
    }
    .trigger-grid {
      grid-template-columns: 1fr;
      gap: 12px;
    }
    .nav-title {
      font-size: 14px;
      letter-spacing: 2px;
    }
  }

  /* ── Mobile ── */
  @media (max-width: 600px) {
    .stat-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-bottom: 18px;
    }
    .stat-value {
      font-size: 1.1rem !important;
    }
    .main-grid {
      grid-template-columns: 1fr;
      gap: 14px;
    }
    .contacts-grid {
      grid-template-columns: 1fr;
    }
    .trigger-grid {
      grid-template-columns: 1fr;
      gap: 12px;
    }
    .nav-inner {
      padding: 0 12px;
    }
    .nav-title {
      font-size: 11px !important;
      letter-spacing: 1px !important;
    }
    .nav-shield-pill {
      padding: 5px 8px;
    }
    .nav-shield-label {
      display: none;
    }
    .scard-body {
      padding: 14px 12px;
    }
    .main-pad {
      padding: 72px 12px 48px;
    }
    .sos-btn {
      padding: 10px 18px;
      font-size: 10px;
      letter-spacing: 1.5px;
      white-space: nowrap;
    }
    .welcome-h1 {
      font-size: clamp(1rem, 5vw, 1.5rem) !important;
      letter-spacing: 2px !important;
    }
    .stat-card-pad {
      padding: 14px 12px !important;
    }
    .stat-icon {
      font-size: 18px !important;
    }
    .contact-badge-pad {
      padding: 10px 10px !important;
      gap: 10px !important;
    }
    .contact-avatar {
      width: 34px !important;
      height: 34px !important;
      font-size: 12px !important;
    }
    .contact-name {
      font-size: 13px !important;
    }
    .contact-sub {
      font-size: 11px !important;
    }
  }
`;

export default function SOSConfirmation() {

  const { state } = useLocation();
  const navigate = useNavigate();

  // ✅ contacts comes from Gpstracker navigation state
  const calledContacts = state?.contacts || [];
  const lat = state?.lat || 0;
  const lng = state?.lng || 0;

  return (
    <>
      <style>{CSS}</style>
    <div
      style={{
        minHeight: "100vh",
        background: "#040d1c",
        fontFamily: "'Rajdhani', sans-serif",
      }}
    >
      

      <div
        style={{
          width: "100vw",
          minHeight: "100vh",
          position: "relative",
          background: `linear-gradient(rgba(4,13,28,0.62), rgba(4,13,28,0.72)), url(${voice})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "18px",
          textAlign: "center",
          padding: "32px 20px",
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
              "linear-gradient(90deg,transparent,rgba(0,255,136,.2),transparent)",
            animation: "scanLine 5s linear infinite",
            pointerEvents: "none",
          }}
        />

        {/* Pulse rings */}
        {[130, 175, 220].map((size, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: size,
              height: size,
              borderRadius: "50%",
              border: "1px solid rgba(0,255,136,.18)",
              animation: `pulseRing 2.8s ${i * 0.65}s ease-out infinite`,
              pointerEvents: "none",
            }}
          />
        ))}

        {/* Check icon */}
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: "50%",
            background: "rgba(0,255,136,.07)",
            border: "2px solid rgba(0,255,136,.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 35px rgba(0,255,136,.18)",
            animation: "checkPop .6s cubic-bezier(0.23,1,0.32,1) both",
          }}
        >
          <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
            <polyline
              points="6,19 15.5,28.5 32,10"
              stroke="#00ff88"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1
          style={{
            fontFamily: "'Orbitron',monospace",
            fontSize: "clamp(18px,4vw,24px)",
            color: "#00ff88",
            letterSpacing: 3,
            textShadow: "0 0 22px rgba(0,255,136,.38)",
            animation: "fadeUp .6s .2s both",
          }}
        >
          CALLS & SMS SENT SUCCESSFULLY
        </h1>

        <p
          style={{
            fontFamily: "'Courier New',monospace",
            fontSize: 11,
            color: "rgba(168,240,255,.45)",
            letterSpacing: 2.5,
            animation: "fadeUp .6s .35s both",
          }}
        >
          CALLS + SMS DISPATCHED TO ALL CONTACTS
        </p>

        <div
          style={{
            width: 180,
            height: 1,
            background:
              "linear-gradient(90deg,transparent,rgba(0,207,255,.28),transparent)",
            margin: "4px 0",
          }}
        />

        {/* ✅ Contacts list — FIXED & UNCOMMENTED */}
        <div
          style={{
            width: "100%",
            maxWidth: 400,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div
            style={{
              fontSize: 9,
              letterSpacing: 4,
              color: "rgba(0,207,255,.38)",
              fontFamily: "'Courier New',monospace",
              marginBottom: 4,
            }}
          >
            ◈ CONTACTS NOTIFIED
          </div>

          {calledContacts.length > 0 ? (
            calledContacts.map((c, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(0,20,50,.65)",
                  border: "1px solid rgba(0,180,255,.14)",
                  borderRadius: 8,
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  animation: `cardIn .5s ${0.45 + i * 0.12}s both`,
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "rgba(0,100,200,.2)",
                    border: "1px solid rgba(0,207,255,.28)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#00cfff",
                    fontFamily: "'Orbitron',monospace",
                    fontSize: 13,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {c.name?.[0]?.toUpperCase() || "?"}
                </div>

                {/* Name & relation */}
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div
                    style={{ fontSize: 14, color: "#a8f0ff", fontWeight: 600 }}
                  >
                    {c.name}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: "rgba(0,180,255,.42)",
                      fontFamily: "'Courier New',monospace",
                      letterSpacing: 1,
                    }}
                  >
                    {c.relation?.toUpperCase() || "CONTACT"}
                  </div>
                </div>

                {/* Status badges */}
                <div style={{ display: "flex", gap: 5 }}>
                  {["CALL ✓", "SMS ✓"].map((label) => (
                    <span
                      key={label}
                      style={{
                        fontSize: 9,
                        padding: "3px 8px",
                        borderRadius: 4,
                        background: label.startsWith("CALL")
                          ? "rgba(0,255,136,.1)"
                          : "rgba(0,207,255,.1)",
                        border: `1px solid ${
                          label.startsWith("CALL")
                            ? "rgba(0,255,136,.35)"
                            : "rgba(0,207,255,.35)"
                        }`,
                        color: label.startsWith("CALL") ? "#00ff88" : "#00cfff",
                        fontFamily: "'Courier New',monospace",
                        letterSpacing: 1.5,
                      }}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p
              style={{
                fontFamily: "'Courier New',monospace",
                fontSize: "11px",
                color: "rgba(255,180,100,0.6)",
                letterSpacing: 1,
              }}
            >
              ⚠ NO CONTACTS RETURNED — CHECK SERVER LOGS
            </p>
          )}
        </div>

        {/* Map */}
        {lat !== 0 && lng !== 0 && (
          <div
            style={{
              width: "100%",
              maxWidth: 400,
              marginTop: 8,
              borderRadius: 10,
              overflow: "hidden",
              border: "1px solid rgba(0,207,255,.2)",
              animation: "fadeUp .6s .85s both",
            }}
          >
            <div
              style={{
                padding: "6px 14px",
                background: "rgba(0,20,50,.92)",
                display: "flex",
                alignItems: "center",
                gap: 7,
              }}
            >
              <div
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "#00ff88",
                  boxShadow: "0 0 5px #00ff88",
                  animation: "blink 1.5s infinite",
                }}
              />
              <span
                style={{
                  fontFamily: "'Courier New',monospace",
                  fontSize: 9,
                  color: "rgba(0,207,255,.45)",
                  letterSpacing: 2,
                }}
              >
                LOCATION SHARED
              </span>
              <span
                style={{
                  marginLeft: "auto",
                  fontFamily: "'Courier New',monospace",
                  fontSize: 9,
                  color: "rgba(0,255,136,.35)",
                }}
              >
                {lat.toFixed(4)}°N, {lng.toFixed(4)}°E
              </span>
            </div>
            <iframe
              title="sos-map"
              width="100%"
              height="180"
              style={{ border: "none", display: "block" }}
              src={`https://maps.google.com/maps?q=${lat},${lng}&z=17&output=embed`}
            />
          </div>
        )}

        {/* Live tracking badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            animation: "fadeUp .6s 1.1s both",
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#00ff88",
              boxShadow: "0 0 8px #00ff88",
              animation: "blink 1.4s ease-in-out infinite",
            }}
          />
          <span
            style={{
              fontFamily: "'Courier New',monospace",
              fontSize: 10,
              color: "rgba(0,207,255,.4)",
              letterSpacing: 2,
            }}
          >
            GPS LOCATION SENT · CONTACTS ALERTED
          </span>
        </div>

        {/* Action buttons */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            justifyContent: "center",
            marginTop: 8,
            animation: "fadeUp .6s 1.2s both",
          }}
        >
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              padding: "12px 28px",
              background: "rgba(0,207,255,0.08)",
              border: "1px solid rgba(0,207,255,.3)",
              borderRadius: 8,
              color: "rgba(168,240,255,.65)",
              fontFamily: "'Orbitron',monospace",
              fontSize: 10,
              letterSpacing: 2,
              cursor: "pointer",
              transition: "all .2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(0,207,255,.6)";
              e.currentTarget.style.color = "#7de8ff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(0,207,255,.3)";
              e.currentTarget.style.color = "rgba(168,240,255,.65)";
            }}
          >
            DASHBOARD
          </button>
          <button
            onClick={() => navigate("/home")}
            style={{
              padding: "12px 28px",
              background: "transparent",
              border: "1px solid rgba(0,180,255,.2)",
              borderRadius: 8,
              color: "rgba(168,240,255,.45)",
              fontFamily: "'Orbitron',monospace",
              fontSize: 10,
              letterSpacing: 2,
              cursor: "pointer",
            }}
          >
            HOME
          </button>
        </div>
      </div>
    </div>
    </>
  );
}