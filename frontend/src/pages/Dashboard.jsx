import { useState, useEffect, useRef } from "react";
import bg from "../assets/bg.jpg";
import { Navigate, useNavigate } from "react-router-dom";
import { use } from "react";

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

  /* ── RESPONSIVE ── */
  .stat-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 28px;
  }
  .main-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    align-items: start;
  }
  .nav-center { display: block; }
  .shield-badge { display: flex; }
  .welcome-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
  }
  .sos-btn { width: auto; }

  @media (max-width: 1024px) {
    .main-grid { grid-template-columns: repeat(2, 1fr); }
    .stat-grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 768px) {
    .stat-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .main-grid { grid-template-columns: 1fr; }
    .nav-center { display: none; }
    .shield-badge span { display: none; }
    .shield-badge { padding: 6px 8px !important; }
  }

  @media (max-width: 480px) {
    .stat-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
    .main-grid { grid-template-columns: 1fr; }
    .sos-btn { width: 100% !important; }
    .welcome-row { flex-direction: column; align-items: flex-start; }
    .nav-center { display: none; }
  }
`;

/* ─── BG Canvas ──────────────────────────────────────────────── */
function BG() {
  const ref = useRef(null);
  const raf = useRef(null);
  const T = useRef(0);
  const lst = useRef(null);
  const pts = useRef([]);
  useEffect(() => {
    const c = ref.current,
      ctx = c.getContext("2d");
    const resize = () => {
      c.width = window.innerWidth;
      c.height = window.innerHeight;
      pts.current = Array.from({ length: 55 }, () => ({
        x: Math.random() * c.width,
        y: Math.random() * c.height,
        r: 0.4 + Math.random() * 1.6,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -0.05 - Math.random() * 0.2,
        alpha: 0.08 + Math.random() * 0.38,
        pulse: Math.random() * Math.PI * 2,
        hue: 185 + Math.random() * 35,
      }));
    };
    resize();
    window.addEventListener("resize", resize);
    const render = (now) => {
      const W = c.width,
        H = c.height,
        dt = Math.min(now - (lst.current || now), 50) / 1000;
      lst.current = now;
      T.current += dt;
      const t = T.current;
      ctx.clearRect(0, 0, W, H);
      const bg = ctx.createRadialGradient(
        W * 0.5,
        H * 0.35,
        0,
        W * 0.5,
        H * 0.5,
        Math.max(W, H) * 0.8,
      );
      bg.addColorStop(0, "#060f22");
      bg.addColorStop(0.5, "#040c1a");
      bg.addColorStop(1, "#020810");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      [
        [0.15, 0.2, 0.25],
        [0.85, 0.75, 0.18],
        [0.5, 0.95, 0.14],
      ].forEach(([rx, ry, s]) => {
        const g = ctx.createRadialGradient(
          W * rx,
          H * ry,
          0,
          W * rx,
          H * ry,
          Math.min(W, H) * s,
        );
        g.addColorStop(
          0,
          `rgba(0,80,160,${0.06 + Math.sin(t * 0.35 + rx * 8) * 0.02})`,
        );
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      });
      ctx.save();
      ctx.globalAlpha = 0.02;
      ctx.strokeStyle = "#00cfff";
      ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += 80) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += 80) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      ctx.restore();
      pts.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += dt * 1.2;
        if (p.y < -10) {
          p.y = H + 10;
          p.x = Math.random() * W;
        }
        const a = p.alpha * (0.4 + Math.sin(p.pulse) * 0.4);
        ctx.save();
        ctx.globalAlpha = a * 0.7;
        ctx.fillStyle = `hsl(${p.hue},100%,65%)`;
        ctx.shadowColor = `hsl(${p.hue},100%,65%)`;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      raf.current = requestAnimationFrame(render);
    };
    raf.current = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return (
    <canvas
      ref={ref}
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
    />
  );
}

/* ─── Navbar ─────────────────────────────────────────────────── */
function Navbar({ name }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigate = useNavigate();
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        height: "64px",
        padding: "0 clamp(12px, 3vw, 32px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(6,13,26,0.94)",
        backdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(0,180,255,0.14)",
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div
          onClick={() => navigate("/home")}
          style={{
            width: "32px",
            height: "32px",
            border: "1.5px solid rgba(0,207,255,0.6)",
            borderRadius: "7px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,207,255,0.07)",
            boxShadow: "0 0 12px rgba(0,207,255,0.2)",
            flexShrink: 0,
            cursor: "pointer",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 2L17 5L17 10C17 14.5 13.5 17.5 10 19C6.5 17.5 3 14.5 3 10L3 5Z"
              fill="rgba(0,207,255,0.2)"
              stroke="#00cfff"
              strokeWidth="1.5"
            />
            <circle cx="10" cy="9" r="2.2" fill="#00cfff" />
          </svg>
        </div>
        <span
          style={{
            fontFamily: "'Orbitron',monospace",
            fontSize: "clamp(11px, 2.5vw, 15px)",
            fontWeight: 700,
            color: "#00cfff",
            letterSpacing: "clamp(1px, 1vw, 3px)",
            textShadow: "0 0 14px rgba(0,207,255,0.35)",
          }}
        >
          SHIELDHER
        </span>
      </div>

      {/* Center — hidden on mobile via CSS class */}
      <span
        className="nav-center"
        style={{
          fontFamily: "'Courier New',monospace",
          fontSize: "clamp(11px, 2vw, 20px)",
          letterSpacing: "clamp(1px, 1vw, 3px)",
          color: "rgba(0,207,255,0.42)",
        }}
      >
        DASHBOARD
      </span>

      {/* Right */}
      {/* Right */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "clamp(8px, 2vw, 16px)",
          position: "relative",
        }}
      >
        <div
          className="shield-badge"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            padding: "6px 14px",
            background: "rgba(0,207,255,0.06)",
            border: "1px solid rgba(0,207,255,0.22)",
            borderRadius: "20px",
          }}
        >
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              flexShrink: 0,
              background: "#00cfff",
              boxShadow: "0 0 8px #00cfff",
              animation: "blink 1.5s ease-in-out infinite",
            }}
          />
          <span
            style={{
              fontSize: "10px",
              letterSpacing: "2px",
              color: "rgba(0,207,255,0.7)",
              fontFamily: "'Courier New',monospace",
            }}
          >
            SHIELD ACTIVE
          </span>
        </div>

        {/* Avatar + Dropdown */}
        <div style={{ position: "relative" }} ref={dropdownRef}>
          <div
            onClick={() => setDropdownOpen((o) => !o)}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              flexShrink: 0,
              border: `1.5px solid ${dropdownOpen ? "rgba(0,207,255,0.8)" : "rgba(0,207,255,0.45)"}`,
              background:
                "linear-gradient(135deg,rgba(0,80,180,0.4),rgba(0,207,255,0.2))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Orbitron',monospace",
              fontSize: "13px",
              color: "#00cfff",
              fontWeight: 700,
              boxShadow: dropdownOpen
                ? "0 0 18px rgba(0,207,255,0.45)"
                : "0 0 10px rgba(0,207,255,0.2)",
              cursor: "pointer",
              transition: "all .2s",
            }}
          >
            {name?.[0]?.toUpperCase() || "P"}
          </div>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 10px)",
                right: 0,
                minWidth: "180px",
                background: "rgba(6,13,26,0.97)",
                border: "1px solid rgba(0,180,255,0.22)",
                borderRadius: "10px",
                backdropFilter: "blur(24px)",
                boxShadow:
                  "0 8px 40px rgba(0,0,0,0.5), 0 0 30px rgba(0,100,200,0.12)",
                overflow: "hidden",
                animation: "fadeUp .18s ease both",
                zIndex: 2000,
              }}
            >
              {/* Top accent line */}
              <div
                style={{
                  height: "1px",
                  background:
                    "linear-gradient(90deg,transparent,rgba(0,207,255,0.5),transparent)",
                }}
              />

              {/* User info */}
              <div
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid rgba(0,180,255,0.1)",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Orbitron',monospace",
                    fontSize: "11px",
                    color: "#00cfff",
                    fontWeight: 700,
                    letterSpacing: "1px",
                  }}
                >
                  {name || "PILOT"}
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "rgba(0,180,255,0.4)",
                    fontFamily: "'Courier New',monospace",
                    marginTop: "3px",
                    letterSpacing: "1px",
                  }}
                >
                  ACTIVE PROFILE
                </div>
              </div>

              {/* Profile option */}
              <div
                onClick={() => {
                  setDropdownOpen(false);
                  navigate("/details");
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "11px 16px",
                  cursor: "pointer",
                  borderBottom: "1px solid rgba(0,180,255,0.07)",
                  transition: "background .15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(0,207,255,0.07)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgba(0,207,255,0.7)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span
                  style={{
                    fontFamily: "'Courier New',monospace",
                    fontSize: "11px",
                    letterSpacing: "2px",
                    color: "rgba(168,240,255,0.8)",
                  }}
                >
                  PROFILE
                </span>
              </div>

              {/* Logout option */}
              <div
                onClick={() => {
                  setDropdownOpen(false);
                  localStorage.removeItem("token");
                  navigate("/");
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "11px 16px",
                  cursor: "pointer",
                  transition: "background .15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,60,60,0.07)";
                  e.currentTarget.querySelector("span").style.color = "#ff6b6b";
                  e.currentTarget.querySelector("svg").style.stroke = "#ff6b6b";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.querySelector("span").style.color =
                    "rgba(168,240,255,0.8)";
                  e.currentTarget.querySelector("svg").style.stroke =
                    "rgba(0,207,255,0.7)";
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgba(0,207,255,0.7)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ transition: "stroke .15s" }}
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span
                  style={{
                    fontFamily: "'Courier New',monospace",
                    fontSize: "11px",
                    letterSpacing: "2px",
                    color: "rgba(168,240,255,0.8)",
                    transition: "color .15s",
                  }}
                >
                  LOGOUT
                </span>
              </div>

              {/* Bottom accent line */}
              <div
                style={{
                  height: "1px",
                  background:
                    "linear-gradient(90deg,transparent,rgba(0,207,255,0.2),transparent)",
                }}
              />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

/* ─── Stat Card ──────────────────────────────────────────────── */
function StatCard({ icon, label, value, sub, color = "#00cfff", delay = 0 }) {
  return (
    <div
      style={{
        background: "rgba(4,14,40,0.85)",
        border: "1px solid rgba(0,180,255,0.16)",
        borderRadius: "12px",
        padding: "clamp(12px, 2vw, 20px) clamp(12px, 2vw, 22px)",
        position: "relative",
        overflow: "hidden",
        animation: `fadeUp .5s ease ${delay}ms both`,
        boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
        transition: "border-color .25s, box-shadow .25s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `rgba(0,207,255,0.38)`;
        e.currentTarget.style.boxShadow = `0 0 30px rgba(0,207,255,0.08), 0 4px 24px rgba(0,0,0,0.25)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(0,180,255,0.16)";
        e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.25)";
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "20%",
          right: "20%",
          height: "1px",
          background: `linear-gradient(90deg,transparent,${color},transparent)`,
          opacity: 0.5,
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "12px",
        }}
      >
        <span style={{ fontSize: "clamp(16px, 3vw, 22px)" }}>{icon}</span>
        <div
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: color,
            boxShadow: `0 0 7px ${color}`,
            animation: "blink 2s ease-in-out infinite",
          }}
        />
      </div>
      <div
        style={{
          fontFamily: "'Orbitron',monospace",
          fontSize: "clamp(1rem, 2.5vw, 1.5rem)",
          fontWeight: 700,
          color,
          textShadow: `0 0 14px ${color}55`,
          marginBottom: "4px",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: "clamp(8px, 1.5vw, 10px)",
          letterSpacing: "2px",
          color: "rgba(0,207,255,0.55)",
          fontFamily: "'Courier New',monospace",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      {sub && (
        <div
          style={{
            fontSize: "11px",
            color: "rgba(168,240,255,0.35)",
            marginTop: "4px",
            letterSpacing: ".5px",
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

/* ─── Section Card ───────────────────────────────────────────── */
function SCard({ icon, title, children, delay = 0, accent = "#00cfff" }) {
  return (
    <div
      style={{
        background: "rgba(4,14,40,0.85)",
        border: "1px solid rgba(0,180,255,0.16)",
        borderRadius: "14px",
        overflow: "hidden",
        boxShadow: "0 4px 30px rgba(0,0,0,0.22)",
        animation: `fadeUp .55s ease ${delay}ms both`,
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "15%",
          right: "15%",
          height: "1px",
          background: `linear-gradient(90deg,transparent,${accent},transparent)`,
          opacity: 0.5,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          height: "1px",
          background: `linear-gradient(90deg,transparent,rgba(0,207,255,0.2),transparent)`,
          animation: "scanLine 6s linear infinite",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          padding: "14px 20px",
          borderBottom: "1px solid rgba(0,180,255,0.1)",
          background: "rgba(0,207,255,0.03)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <span style={{ fontSize: "16px" }}>{icon}</span>
        <span
          style={{
            fontFamily: "'Courier New',monospace",
            fontSize: "clamp(10px, 2vw, 13px)",
            letterSpacing: "2.5px",
            color: "rgba(0,208,255,0.81)",
            textTransform: "uppercase",
          }}
        >
          {title}
        </span>
      </div>
      <div
        style={{ padding: "clamp(14px, 2.5vw, 22px) clamp(12px, 2vw, 20px)" }}
      >
        {children}
      </div>
      {[
        {
          bottom: 10,
          left: 10,
          borderBottom: "1px solid",
          borderLeft: "1px solid",
        },
        {
          bottom: 10,
          right: 10,
          borderBottom: "1px solid",
          borderRight: "1px solid",
        },
      ].map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: "10px",
            height: "10px",
            borderColor: "rgba(0,207,255,0.18)",
            ...s,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Info Row ───────────────────────────────────────────────── */
function Row({ label, value, highlight }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        padding: "10px 0",
        borderBottom: "1px solid rgba(0,180,255,0.07)",
        gap: "16px",
      }}
    >
      <span
        style={{
          fontSize: "10px",
          letterSpacing: "2px",
          color: "rgba(0,208,255,0.72)",
          fontFamily: "'Courier New',monospace",
          textTransform: "uppercase",
          flexShrink: 0,
          paddingTop: "1px",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: "clamp(12px, 2vw, 14px)",
          color: highlight ? "#00cfff" : "rgba(168,240,255,0.72)",
          letterSpacing: ".5px",
          textAlign: "right",
          fontWeight: highlight ? 600 : 400,
        }}
      >
        {value || "—"}
      </span>
    </div>
  );
}

/* ─── GPS / Map Widget ───────────────────────────────────────── */
function MapWidget({ radius }) {
  const T = useRef(0);
  const ref = useRef(null);
  const raf = useRef(null);
  const lst = useRef(null);
  useEffect(() => {
    const c = ref.current,
      ctx = c.getContext("2d");
    const W = c.width,
      H = c.height,
      cx = W / 2,
      cy = H / 2;
    const render = (now) => {
      const dt = Math.min(now - (lst.current || now), 50) / 1000;
      lst.current = now;
      T.current += dt;
      const t = T.current;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "rgba(4,10,28,0.95)";
      ctx.beginPath();
      ctx.arc(cx, cy, cx, 0, Math.PI * 2);
      ctx.fill();
      ctx.save();
      ctx.globalAlpha = 0.06;
      ctx.strokeStyle = "#00cfff";
      ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += 18) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += 18) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      ctx.restore();
      const zR = cx * 0.58;
      ctx.save();
      ctx.strokeStyle = "#00cfff";
      ctx.lineWidth = 1.5;
      ctx.shadowColor = "#00cfff";
      ctx.shadowBlur = 12;
      ctx.globalAlpha = 0.5 + Math.sin(t * 1.2) * 0.15;
      ctx.beginPath();
      ctx.arc(cx, cy, zR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.fillStyle = "rgba(0,100,200,0.06)";
      ctx.beginPath();
      ctx.arc(cx, cy, zR, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.strokeStyle = "#00cfff";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(cx, 10);
      ctx.lineTo(cx, H - 10);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(10, cy);
      ctx.lineTo(W - 10, cy);
      ctx.stroke();
      ctx.restore();
      [cx * 0.72, cx * 0.86, cx * 0.96].forEach((r, i) => {
        ctx.save();
        ctx.globalAlpha = 0.12 - i * 0.03;
        ctx.strokeStyle = "#00cfff";
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });
      const sweep = (t * 0.8) % (Math.PI * 2);
      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.strokeStyle = "#00cfff";
      ctx.lineWidth = 2;
      ctx.shadowColor = "#00cfff";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, cx * 0.92, sweep - 0.6, sweep);
      ctx.closePath();
      ctx.fillStyle = "rgba(0,207,255,0.07)";
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      for (let i = 0; i < 2; i++) {
        const ph = (t * 0.5 + i / 2) % 1;
        ctx.save();
        ctx.globalAlpha = (1 - ph) * 0.35;
        ctx.strokeStyle = "#00cfff";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, ph * zR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      ctx.save();
      ctx.fillStyle = "#00cfff";
      ctx.shadowColor = "#00cfff";
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        const len = i % 6 === 0 ? 8 : 4;
        ctx.save();
        ctx.globalAlpha = i % 6 === 0 ? 0.5 : 0.25;
        ctx.strokeStyle = "#00cfff";
        ctx.lineWidth = i % 6 === 0 ? 1.2 : 0.7;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * zR, cy + Math.sin(a) * zR);
        ctx.lineTo(
          cx + Math.cos(a) * (zR + len),
          cy + Math.sin(a) * (zR + len),
        );
        ctx.stroke();
        ctx.restore();
      }
      ctx.save();
      ctx.globalCompositeOperation = "destination-in";
      ctx.beginPath();
      ctx.arc(cx, cy, cx, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      raf.current = requestAnimationFrame(render);
    };
    raf.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf.current);
  }, []);
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <canvas
        ref={ref}
        width={200}
        height={200}
        style={{ borderRadius: "50%", display: "block", maxWidth: "100%" }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-22px",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "9px",
          letterSpacing: "2px",
          color: "rgba(0,207,255,0.5)",
          fontFamily: "'Courier New',monospace",
          whiteSpace: "nowrap",
        }}
      >
        SAFE ZONE · {Number(radius).toLocaleString()} m
      </div>
    </div>
  );
}

/* ─── Contact Card ───────────────────────────────────────────── */
function ContactBadge({ c, i }) {
  const colors = [
    "#00cfff",
    "#7de8ff",
    "#5bc8ff",
    "rgba(0,207,255,0.6)",
    "rgba(125,232,255,0.7)",
  ];
  const col = colors[Math.min(i, colors.length - 1)];
  const priorityLabel = ["High", "Medium", "Low"][
    Math.min((c.priority || 1) - 1, 2)
  ];
  return (
    <div
      style={{
        background: "rgba(0,20,55,0.7)",
        border: `1px solid ${col}28`,
        borderRadius: "10px",
        padding: "clamp(10px, 2vw, 14px) clamp(10px, 2vw, 16px)",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        animation: `slideIn .35s ease ${i * 80}ms both`,
        transition: "border-color .25s, box-shadow .25s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = col;
        e.currentTarget.style.boxShadow = `0 0 18px ${col}22`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = `${col}28`;
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          border: `1.5px solid ${col}`,
          background: `${col}12`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Orbitron',monospace",
          fontSize: "14px",
          color: col,
          fontWeight: 700,
          flexShrink: 0,
          boxShadow: `0 0 10px ${col}30`,
        }}
      >
        {c.name?.[0]?.toUpperCase()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "'Rajdhani',sans-serif",
            fontSize: "15px",
            fontWeight: 600,
            color: "rgba(168,240,255,0.85)",
            letterSpacing: ".5px",
            marginBottom: "2px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {c.name}
        </div>
        <div
          style={{
            fontSize: "clamp(11px, 2vw, 13px)",
            color: "rgba(0,179,255,0.86)",
            letterSpacing: "1px",
          }}
        >
          {c.relation} · {c.phone}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "3px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontSize: "8px",
            letterSpacing: "1.5px",
            color: col,
            fontFamily: "'Courier New',monospace",
          }}
        >
          PRIORITY
        </div>
        <div
          style={{
            fontSize: "11px",
            color: col,
            fontFamily: "'Courier New',monospace",
            fontWeight: 700,
          }}
        >
          P{c.priority || 1} · {priorityLabel}
        </div>
      </div>
    </div>
  );
}

/* ─── Shield Status Widget ───────────────────────────────────── */
function ShieldStatus() {
  const T = useRef(0);
  const ref = useRef(null);
  const raf = useRef(null);
  const lst = useRef(null);
  useEffect(() => {
    const c = ref.current,
      ctx = c.getContext("2d");
    const W = c.width,
      H = c.height,
      cx = W / 2,
      cy = H / 2;
    const render = (now) => {
      const dt = Math.min(now - (lst.current || now), 50) / 1000;
      lst.current = now;
      T.current += dt;
      const t = T.current;
      ctx.clearRect(0, 0, W, H);
      [50, 65, 78].forEach((r, i) => {
        ctx.save();
        ctx.strokeStyle = i === 0 ? "#00cfff" : "rgba(0,207,255,0.3)";
        ctx.lineWidth = i === 0 ? 2 : 1;
        ctx.shadowColor = "#00cfff";
        ctx.shadowBlur = i === 0 ? 12 : 4;
        ctx.globalAlpha = 0.5 + Math.sin(t * 1.5 + i) * 0.2;
        if (i === 1) {
          ctx.setLineDash([4, 4]);
          ctx.lineDashOffset = -t * 20;
        }
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });
      const sc = 1.4;
      ctx.save();
      ctx.translate(cx, cy - 5);
      ctx.fillStyle = "rgba(0,100,200,0.18)";
      ctx.strokeStyle = "#00cfff";
      ctx.lineWidth = 2;
      ctx.shadowColor = "#00cfff";
      ctx.shadowBlur = 15 + Math.sin(t * 2) * 5;
      ctx.beginPath();
      ctx.moveTo(0, -28 * sc);
      ctx.bezierCurveTo(24 * sc, -14 * sc, 25 * sc, 4 * sc, 0, 30 * sc);
      ctx.bezierCurveTo(-25 * sc, 4 * sc, -24 * sc, -14 * sc, 0, -28 * sc);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#00cfff";
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(0, 2, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      for (let i = 0; i < 2; i++) {
        const ph = (t * 0.6 + i / 2) % 1;
        ctx.save();
        ctx.globalAlpha = (1 - ph) * 0.3;
        ctx.strokeStyle = "#00cfff";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, 50 + ph * 40, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      raf.current = requestAnimationFrame(render);
    };
    raf.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf.current);
  }, []);
  return (
    <canvas ref={ref} width={160} height={160} style={{ display: "block" }} />
  );
}

/* ─── Main Dashboard ─────────────────────────────────────────── */
export default function Dashboard() {
  const [customTriggers, setCustomTriggers] = useState([]);
  const [inputWord, setInputWord] = useState("");
  const [profile, setProfile] = useState(null);
  const [shieldActive, setShieldActive] = useState(true);
  const [uptime] = useState("04:27:13");

  const navigate = useNavigate();

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const res = await fetch(
        "https://shieldher-backend-1h8b.onrender.com/api/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("STATUS:", res.status);

      if (res.status === 200) {
        const data = await res.json();
        setProfile(data);
      } else if (res.status === 404) {
        navigate("/details");
      } else if (res.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        navigate("/details");
      }
    } catch (err) {
      console.error(err);
      navigate("/details");
    }
  };

  // oNLY ONE useEffect (correct place)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          "https://shieldher-backend-1h8b.onrender.com/api/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (!res.ok) {
          console.error("Failed to fetch profile");
          return;
        }
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  if (!profile)
    return <h2 style={{ color: "#fff", padding: "80px 24px" }}>Loading...</h2>;

  const personal = profile;
  const contacts = profile.emergencyContacts || [];
  const address = profile.address || {};
  const fullName = `${personal.firstName} ${personal.lastName}`.trim();

  const addTrigger = () => {
    const word = inputWord.trim().toLowerCase();
    if (!word || customTriggers.includes(word) || customTriggers.length >= 2)
      return;
    setCustomTriggers([...customTriggers, word]);
    setInputWord("");
  };
  const removeTrigger = (word) =>
    setCustomTriggers(customTriggers.filter((w) => w !== word));

  return (
    <>
      <style>{CSS}</style>
      <div
        style={{
          position: "relative",
          minHeight: "100vh",
          background: "#060d1a",
        }}
      >
        <BG />
        <Navbar name={personal.firstName} />

        <main
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "clamp(74px, 10vw, 84px) clamp(12px, 3vw, 24px) 60px",
            background: `linear-gradient(rgba(4,13,28,0.55), rgba(4,13,28,0.65)), url(${bg})`,
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "repeat",
          }}
        >
          {/* ── Welcome banner ── */}
          <div
            style={{ marginBottom: "32px", animation: "fadeUp .5s ease both" }}
          >
            <div
              style={{
                fontSize: "9px",
                letterSpacing: "5px",
                color: "rgba(0,208,255,0.81)",
                marginBottom: "8px",
                fontFamily: "'Courier New',monospace",
              }}
            >
              ◈ SECURE DASHBOARD
            </div>
            <div className="welcome-row">
              <div style={{ minWidth: 0, flex: 1 }}>
                <h1
                  style={{
                    fontFamily: "'Orbitron',monospace",
                    fontSize: "clamp(1.1rem, 3vw, 2.2rem)",
                    fontWeight: 700,
                    letterSpacing: "clamp(1px, 1vw, 3px)",
                    color: "#7de8ff",
                    textShadow: "0 0 28px rgba(0,207,255,0.35)",
                    animation: "glow 5s ease-in-out infinite",
                  }}
                >
                  WELCOME BACK, {personal.firstName?.toUpperCase() || "USER"}
                </h1>
                <p
                  style={{
                    fontSize: "clamp(10px, 2vw, 13px)",
                    color: "rgba(0,179,255,0.74)",
                    letterSpacing: "1px",
                    fontFamily: "'Courier New',monospace",
                    marginTop: "4px",
                  }}
                >
                  YOUR SHIELD IS ACTIVE · ALL SYSTEMS OPERATIONAL
                </p>
              </div>
              <button
                className="sos-btn"
                style={{
                  padding: "clamp(10px, 2vw, 14px) clamp(16px, 3vw, 32px)",
                  flexShrink: 0,
                  background: shieldActive
                    ? "linear-gradient(90deg,rgba(0,100,200,0.5),rgba(0,207,255,0.38))"
                    : "rgba(255,0,60,0.15)",
                  border: `1px solid ${shieldActive ? "rgba(0,208,255,0.28)" : "rgba(255,0,60,0.5)"}`,
                  borderRadius: "8px",
                  color: shieldActive ? "#7de8ff" : "#ff4488",
                  fontSize: "clamp(10px, 2vw, 12px)",
                  letterSpacing: "2.5px",
                  fontFamily: "'Orbitron',monospace",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: shieldActive
                    ? "0 0 30px rgba(0,207,255,0.2)"
                    : "0 0 30px rgba(255,0,60,0.2)",
                  animation: "pulseRing 2.5s ease-in-out infinite",
                  transition: "all .3s",
                }}
                onClick={() => setShieldActive((a) => !a)}
              >
                {shieldActive ? "🛡 SHIELD ON" : "⚠ SHIELD OFF"}
              </button>
            </div>
            <div
              style={{
                height: "1px",
                marginTop: "20px",
                background:
                  "linear-gradient(90deg,rgba(0,207,255,0.3),transparent)",
              }}
            />
          </div>

          {/* ── Stat cards ── */}
          <div className="stat-grid">
            <StatCard
              icon="👤"
              label="Profile Status"
              value="COMPLETE"
              sub="All fields filled"
              color="#00cfff"
              delay={0}
            />
            <StatCard
              icon="🛡"
              label="Shield Status"
              value={shieldActive ? "ACTIVE" : "OFFLINE"}
              sub="Real-time protection"
              color={shieldActive ? "#00cfff" : "#ff4488"}
              delay={80}
            />
            <StatCard
              icon="👥"
              label="SOS Contacts"
              value={`${contacts.length}/5`}
              sub="Emergency network"
              color="#7de8ff"
              delay={160}
            />
            <StatCard
              icon="⏱"
              label="Uptime"
              value={uptime}
              sub="Session active"
              color="#5bc8ff"
              delay={240}
            />
          </div>

          {/* ── Main 3-column grid ── */}
          <div className="main-grid">
            {/* Col 1: Personal Info */}
            <SCard icon="👤" title="Personal Information" delay={100}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  marginBottom: "18px",
                }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    border: "2px solid rgba(0,207,255,0.5)",
                    background:
                      "linear-gradient(135deg,rgba(0,80,180,0.4),rgba(0,207,255,0.2))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'Orbitron',monospace",
                    fontSize: "22px",
                    color: "#00cfff",
                    fontWeight: 700,
                    boxShadow: "0 0 18px rgba(0,207,255,0.25)",
                    flexShrink: 0,
                    animation: "shieldOn 4s ease-in-out infinite",
                  }}
                >
                  {personal.firstName?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "'Orbitron',monospace",
                      fontSize: "clamp(0.8rem, 2vw, 1rem)",
                      fontWeight: 700,
                      color: "#7de8ff",
                      letterSpacing: "1px",
                    }}
                  >
                    {fullName}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "rgba(0,179,255,0.93)",
                      letterSpacing: "1px",
                      marginTop: "2px",
                      fontFamily: "'Courier New',monospace",
                    }}
                  >
                    AGE {personal.age} · {personal.bloodGroup || "—"}
                  </div>
                </div>
              </div>
              <Row label="Phone" value={personal.phone} highlight />
              <Row
                label="Date of Birth"
                value={
                  personal.dob
                    ? new Date(personal.dob).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"
                }
              />
              <Row label="Blood Group" value={personal.bloodGroup} highlight />
              {personal.medicalNotes && (
                <div style={{ marginTop: "14px" }}>
                  <div
                    style={{
                      fontSize: "9px",
                      letterSpacing: "2px",
                      color: "rgba(0,207,255,0.4)",
                      fontFamily: "'Courier New',monospace",
                      marginBottom: "7px",
                    }}
                  >
                    MEDICAL NOTES
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "rgba(168,241,255,0.9)",
                      lineHeight: 1.6,
                      padding: "10px 12px",
                      background: "rgba(0,207,255,0.04)",
                      border: "1px solid rgba(0,180,255,0.1)",
                      borderRadius: "6px",
                    }}
                  >
                    {personal.medicalNotes}
                  </div>
                </div>
              )}
            </SCard>

            {/* Col 2: GPS */}
            <SCard
              icon="📍"
              title="Location & Safe Zone"
              delay={160}
              accent="#7de8ff"
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "38px",
                }}
              >
                <MapWidget radius={address.radius} />
              </div>
              <Row label="Address" value={address.line1} />
              {address.line2 && <Row label="Landmark" value={address.line2} />}
              <Row
                label="City"
                value={`${address.city}, ${address.state}`}
                highlight
              />
              <Row label="PIN Code" value={address.pincode} />
              <Row label="Country" value={address.country} />
              <Row
                label="Safe Zone"
                value={`${Number(address.radius).toLocaleString()} metres`}
                highlight
              />
              <div style={{ marginTop: "12px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "5px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "9px",
                      letterSpacing: "1.5px",
                      color: "rgba(0,207,255,0.4)",
                      fontFamily: "'Courier New',monospace",
                    }}
                  >
                    ZONE SIZE
                  </span>
                  <span
                    style={{
                      fontSize: "9px",
                      color: "#00cfff",
                      fontFamily: "'Courier New',monospace",
                    }}
                  >
                    {Math.round(((address.radius - 100) / 4900) * 100)}%
                  </span>
                </div>
                <div
                  style={{
                    height: "3px",
                    background: "rgba(0,180,255,0.12)",
                    borderRadius: "2px",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.round(((address.radius - 100) / 4900) * 100)}%`,
                      background: "linear-gradient(90deg,#0060c0,#00cfff)",
                      borderRadius: "2px",
                      boxShadow: "0 0 8px rgba(0,207,255,0.4)",
                      transition: "width .6s ease",
                    }}
                  />
                </div>
              </div>
            </SCard>

            {/* Col 3: Shield Status */}
            <SCard icon="🛡" title="Shield Status" delay={220} accent="#5bc8ff">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "20px",
                }}
              >
                <ShieldStatus />
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontFamily: "'Orbitron',monospace",
                      fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
                      fontWeight: 700,
                      color: shieldActive ? "#00cfff" : "#ff4488",
                      textShadow: shieldActive
                        ? "0 0 20px rgba(0,207,255,0.5)"
                        : "none",
                      marginBottom: "6px",
                    }}
                  >
                    {shieldActive ? "SHIELD ACTIVE" : "SHIELD OFFLINE"}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "rgba(0,180,255,0.45)",
                      letterSpacing: "1.5px",
                      fontFamily: "'Courier New',monospace",
                    }}
                  >
                    {shieldActive
                      ? "MONITORING · GPS LIVE · AI ON"
                      : "TAP TO ACTIVATE"}
                  </div>
                </div>
              </div>
              <div
                style={{
                  marginTop: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                {[
                  ["GPS Signal", "STRONG", "#00cfff"],
                  ["AI Engine", "ONLINE", "#00cfff"],
                  ["GSM Module", "READY", "#7de8ff"],
                  ["Cloud Sync", "ACTIVE", "#5bc8ff"],
                  ["Contacts", "NOTIFIED", "#00cfff"],
                ].map(([l, v, c]) => (
                  <div
                    key={l}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      background: "rgba(0,20,55,0.5)",
                      border: "1px solid rgba(0,180,255,0.1)",
                      borderRadius: "5px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "10px",
                        letterSpacing: "1.5px",
                        color: "rgba(0,179,255,0.77)",
                        fontFamily: "'Courier New',monospace",
                      }}
                    >
                      {l}
                    </span>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <div
                        style={{
                          width: "5px",
                          height: "5px",
                          borderRadius: "50%",
                          background: c,
                          boxShadow: `0 0 6px ${c}`,
                          animation: "blink 1.8s ease-in-out infinite",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "10px",
                          color: c,
                          fontFamily: "'Courier New',monospace",
                          letterSpacing: "1px",
                        }}
                      >
                        {v}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </SCard>
          </div>

          {/* ── Emergency Contacts ── */}
          <div style={{ marginTop: "20px" }}>
            <SCard icon="🚨" title="Emergency Contacts" delay={280}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill,minmax(min(280px,100%),1fr))",
                  gap: "12px",
                }}
              >
                {contacts.map((c, i) => (
                  <ContactBadge key={i} c={c} i={i} />
                ))}
              </div>
              <div
                style={{
                  marginTop: "14px",
                  padding: "10px 14px",
                  background: "rgba(0,207,255,0.04)",
                  border: "1px solid rgba(0,180,255,0.1)",
                  borderRadius: "7px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    background: "#00cfff",
                    boxShadow: "0 0 6px #00cfff",
                    flexShrink: 0,
                  }}
                />
                <p
                  style={{
                    fontSize: "clamp(10px, 2vw, 12px)",
                    color: "rgba(0,180,255,0.42)",
                    fontFamily: "'Courier New',monospace",
                    letterSpacing: ".8px",
                  }}
                >
                  ALL {contacts.length} CONTACTS WILL RECEIVE INSTANT CALL + SMS
                  WITH LIVE GPS WHEN SHIELDHER ACTIVATES
                </p>
              </div>
            </SCard>
          </div>

          {/* ── Trigger Words ── */}
          <div style={{ marginTop: "20px" }}>
            <SCard icon="🎤" title="Trigger Words" delay={320}>
              <div style={{ marginBottom: "16px" }}>
                <div
                  style={{
                    fontSize: "10px",
                    letterSpacing: "2px",
                    color: "rgba(0,207,255,0.5)",
                    fontFamily: "'Courier New',monospace",
                    marginBottom: "8px",
                  }}
                >
                  SYSTEM TRIGGERS (FIXED)
                </div>
                {["HELP", "DANGER", "EMERGENCY"].map((word, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "10px 14px",
                      background: "rgba(0,207,255,0.05)",
                      border: "1px solid rgba(0,180,255,0.2)",
                      borderRadius: "6px",
                      marginBottom: "6px",
                      color: "#00cfff",
                      fontFamily: "'Orbitron',monospace",
                      letterSpacing: "2px",
                      fontSize: "clamp(10px, 2vw, 13px)",
                    }}
                  >
                    {word}
                  </div>
                ))}
              </div>
              <div>
                <div
                  style={{
                    fontSize: "10px",
                    letterSpacing: "2px",
                    color: "rgba(0,207,255,0.5)",
                    fontFamily: "'Courier New',monospace",
                    marginBottom: "8px",
                  }}
                >
                  CUSTOM TRIGGERS (MAX 2)
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginBottom: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <input
                    value={inputWord}
                    onChange={(e) => setInputWord(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTrigger()}
                    placeholder="Enter trigger word"
                    style={{
                      flex: "1 1 160px",
                      minWidth: 0,
                      padding: "10px",
                      background: "rgba(0,20,55,0.7)",
                      border: "1px solid rgba(0,180,255,0.2)",
                      borderRadius: "6px",
                      color: "#a8f0ff",
                      outline: "none",
                      fontFamily: "'Courier New',monospace",
                    }}
                  />
                  <button
                    onClick={addTrigger}
                    style={{
                      padding: "10px 16px",
                      background: "rgba(0,207,255,0.15)",
                      border: "1px solid rgba(0,207,255,0.4)",
                      borderRadius: "6px",
                      color: "#00cfff",
                      fontFamily: "'Orbitron',monospace",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    ADD
                  </button>
                </div>
                <div>
                  {customTriggers.length === 0 && (
                    <p
                      style={{
                        fontSize: "12px",
                        color: "rgba(168,240,255,0.4)",
                      }}
                    >
                      No custom triggers added
                    </p>
                  )}
                  {customTriggers.map((word, i) => (
                    <span
                      key={i}
                      onClick={() => removeTrigger(word)}
                      style={{
                        display: "inline-block",
                        padding: "8px 14px",
                        marginRight: "8px",
                        marginBottom: "6px",
                        background: "rgba(0,207,255,0.1)",
                        border: "1px solid rgba(0,207,255,0.4)",
                        borderRadius: "20px",
                        color: "#7de8ff",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      {word} ✕
                    </span>
                  ))}
                </div>
              </div>
            </SCard>
          </div>
        </main>
      </div>
    </>
  );
}

// import { useState, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";

// /* ─── CSS ────────────────────────────────────────────────────── */
// const CSS = `
//   @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Rajdhani:wght@400;500;600;700&display=swap');
//   *,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
//   body{background:#060d1a;color:#a8f0ff;font-family:'Rajdhani',sans-serif;min-height:100vh;overflow-x:hidden;}
//   ::-webkit-scrollbar{width:3px;}
//   ::-webkit-scrollbar-track{background:#060d1a;}
//   ::-webkit-scrollbar-thumb{background:#00cfff;border-radius:2px;}

//   @keyframes fadeUp    {from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);}}
//   @keyframes fadeIn    {from{opacity:0;}to{opacity:1;}}
//   @keyframes blink     {0%,100%{opacity:1;}50%{opacity:0.2;}}
//   @keyframes glow      {0%,100%{text-shadow:0 0 18px rgba(0,207,255,0.4);}50%{text-shadow:0 0 40px rgba(0,207,255,0.8);}}
//   @keyframes spin      {from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
//   @keyframes spinR     {from{transform:rotate(0deg);}to{transform:rotate(-360deg);}}
//   @keyframes float     {0%,100%{transform:translateY(0);}50%{transform:translateY(-8px);}}
//   @keyframes scanLine  {0%{top:0%;opacity:.6;}100%{top:100%;opacity:0;}}
//   @keyframes pulseRing {0%,100%{box-shadow:0 0 0 0 rgba(0,207,255,0.45);}50%{box-shadow:0 0 0 14px rgba(0,207,255,0);}}
//   @keyframes shieldOn  {0%,100%{box-shadow:0 0 20px rgba(0,207,255,0.3),0 0 60px rgba(0,100,200,0.15);}50%{box-shadow:0 0 40px rgba(0,207,255,0.55),0 0 100px rgba(0,100,200,0.3);}}
//   @keyframes statusPing{0%{transform:scale(1);opacity:.7;}100%{transform:scale(2.2);opacity:0;}}
//   @keyframes slideIn   {from{opacity:0;transform:translateX(-16px);}to{opacity:1;transform:translateX(0);}}
//   @keyframes mapPing   {0%{transform:scale(1);opacity:.8;}100%{transform:scale(3);opacity:0;}}
//   @keyframes radarSpin {from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
//   @keyframes countUp   {from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
//   @keyframes borderGlow{0%,100%{border-color:rgba(0,180,255,0.18);}50%{border-color:rgba(0,207,255,0.42);}}

//   /* ── Responsive Layout ── */

//   /* Stat grid: 4 cols → 2 cols → 2 cols (xs) */
//   .stat-grid {
//     display: grid;
//     grid-template-columns: repeat(4, 1fr);
//     gap: 16px;
//     margin-bottom: 28px;
//   }

//   /* Main 3-col grid → 1 col on mobile */
//   .main-grid {
//     display: grid;
//     grid-template-columns: 1fr 1fr 1fr;
//     gap: 20px;
//     align-items: start;
//   }

//   /* Contacts auto-fill grid */
//   .contacts-grid {
//     display: grid;
//     grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
//     gap: 12px;
//   }

//   /* Navbar */
//   .nav-inner {
//     padding: 0 32px;
//   }
//   .nav-title {
//     font-family: 'Courier New', monospace;
//     font-size: 20px;
//     letter-spacing: 3px;
//     color: rgba(0,207,255,0.42);
//   }
//   .nav-shield-label {
//     font-size: 10px;
//     letter-spacing: 2px;
//   }
//   .nav-shield-pill {
//     display: flex;
//     align-items: center;
//     gap: 7px;
//     padding: 6px 14px;
//     background: rgba(0,207,255,0.06);
//     border: 1px solid rgba(0,207,255,0.22);
//     border-radius: 20px;
//   }

//   /* Trigger words grid */
//   .trigger-grid {
//     display: grid;
//     grid-template-columns: 1fr 1fr;
//     gap: 20px;
//   }

//   /* SCard inner padding */
//   .scard-body {
//     padding: 22px 20px;
//   }

//   /* StatCard value font size */
//   .stat-value {
//     font-family: 'Orbitron', monospace;
//     font-size: 1.5rem;
//     font-weight: 700;
//   }

//   /* Welcome heading */
//   .welcome-h1 {
//     font-family: 'Orbitron', monospace;
//     font-size: clamp(1.2rem, 3vw, 2.2rem);
//     font-weight: 700;
//     letter-spacing: 3px;
//     color: #7de8ff;
//     text-shadow: 0 0 28px rgba(0,207,255,0.35);
//     animation: glow 5s ease-in-out infinite;
//   }

//   .sos-btn {
//     padding: 14px 32px;
//     font-size: 12px;
//     letter-spacing: 2.5px;
//   }

//   /* Main padding */
//   .main-pad {
//     padding: 84px 24px 60px;
//   }

//   /* ── Tablet ── */
//   @media (max-width: 900px) {
//     .stat-grid {
//       grid-template-columns: repeat(2, 1fr);
//       gap: 12px;
//     }
//     .main-grid {
//       grid-template-columns: 1fr;
//     }
//     .trigger-grid {
//       grid-template-columns: 1fr;
//       gap: 12px;
//     }
//     .nav-title {
//       font-size: 14px;
//       letter-spacing: 2px;
//     }
//   }

//   /* ── Mobile ── */
//   @media (max-width: 600px) {
//     .stat-grid {
//       grid-template-columns: repeat(2, 1fr);
//       gap: 10px;
//       margin-bottom: 18px;
//     }
//     .stat-value {
//       font-size: 1.1rem !important;
//     }
//     .main-grid {
//       grid-template-columns: 1fr;
//       gap: 14px;
//     }
//     .contacts-grid {
//       grid-template-columns: 1fr;
//     }
//     .trigger-grid {
//       grid-template-columns: 1fr;
//       gap: 12px;
//     }
//     .nav-inner {
//       padding: 0 12px;
//     }
//     .nav-title {
//       font-size: 11px !important;
//       letter-spacing: 1px !important;
//     }
//     .nav-shield-pill {
//       padding: 5px 8px;
//     }
//     .nav-shield-label {
//       display: none;
//     }
//     .scard-body {
//       padding: 14px 12px;
//     }
//     .main-pad {
//       padding: 72px 12px 48px;
//     }
//     .sos-btn {
//       padding: 10px 18px;
//       font-size: 10px;
//       letter-spacing: 1.5px;
//       white-space: nowrap;
//     }
//     .welcome-h1 {
//       font-size: clamp(1rem, 5vw, 1.5rem) !important;
//       letter-spacing: 2px !important;
//     }
//     .stat-card-pad {
//       padding: 14px 12px !important;
//     }
//     .stat-icon {
//       font-size: 18px !important;
//     }
//     .contact-badge-pad {
//       padding: 10px 10px !important;
//       gap: 10px !important;
//     }
//     .contact-avatar {
//       width: 34px !important;
//       height: 34px !important;
//       font-size: 12px !important;
//     }
//     .contact-name {
//       font-size: 13px !important;
//     }
//     .contact-sub {
//       font-size: 11px !important;
//     }
//   }
// `;

// /* ─── BG Canvas ──────────────────────────────────────────────── */
// function BG() {
//   const ref = useRef(null);
//   const raf = useRef(null);
//   const T = useRef(0);
//   const lst = useRef(null);
//   const pts = useRef([]);
//   useEffect(() => {
//     const c = ref.current,
//       ctx = c.getContext("2d");
//     const resize = () => {
//       c.width = window.innerWidth;
//       c.height = window.innerHeight;
//       pts.current = Array.from({ length: 55 }, () => ({
//         x: Math.random() * c.width,
//         y: Math.random() * c.height,
//         r: 0.4 + Math.random() * 1.6,
//         vx: (Math.random() - 0.5) * 0.25,
//         vy: -0.05 - Math.random() * 0.2,
//         alpha: 0.08 + Math.random() * 0.38,
//         pulse: Math.random() * Math.PI * 2,
//         hue: 185 + Math.random() * 35,
//       }));
//     };
//     resize();
//     window.addEventListener("resize", resize);
//     const render = (now) => {
//       const W = c.width,
//         H = c.height,
//         dt = Math.min(now - (lst.current || now), 50) / 1000;
//       lst.current = now;
//       T.current += dt;
//       const t = T.current;
//       ctx.clearRect(0, 0, W, H);
//       const bg = ctx.createRadialGradient(
//         W * 0.5,
//         H * 0.35,
//         0,
//         W * 0.5,
//         H * 0.5,
//         Math.max(W, H) * 0.8,
//       );
//       bg.addColorStop(0, "#060f22");
//       bg.addColorStop(0.5, "#040c1a");
//       bg.addColorStop(1, "#020810");
//       ctx.fillStyle = bg;
//       ctx.fillRect(0, 0, W, H);
//       [
//         [0.15, 0.2, 0.25],
//         [0.85, 0.75, 0.18],
//         [0.5, 0.95, 0.14],
//       ].forEach(([rx, ry, s]) => {
//         const g = ctx.createRadialGradient(
//           W * rx,
//           H * ry,
//           0,
//           W * rx,
//           H * ry,
//           Math.min(W, H) * s,
//         );
//         g.addColorStop(
//           0,
//           `rgba(0,80,160,${0.06 + Math.sin(t * 0.35 + rx * 8) * 0.02})`,
//         );
//         g.addColorStop(1, "rgba(0,0,0,0)");
//         ctx.fillStyle = g;
//         ctx.fillRect(0, 0, W, H);
//       });
//       ctx.save();
//       ctx.globalAlpha = 0.02;
//       ctx.strokeStyle = "#00cfff";
//       ctx.lineWidth = 0.5;
//       for (let x = 0; x < W; x += 80) {
//         ctx.beginPath();
//         ctx.moveTo(x, 0);
//         ctx.lineTo(x, H);
//         ctx.stroke();
//       }
//       for (let y = 0; y < H; y += 80) {
//         ctx.beginPath();
//         ctx.moveTo(0, y);
//         ctx.lineTo(W, y);
//         ctx.stroke();
//       }
//       ctx.restore();
//       pts.current.forEach((p) => {
//         p.x += p.vx;
//         p.y += p.vy;
//         p.pulse += dt * 1.2;
//         if (p.y < -10) {
//           p.y = H + 10;
//           p.x = Math.random() * W;
//         }
//         const a = p.alpha * (0.4 + Math.sin(p.pulse) * 0.4);
//         ctx.save();
//         ctx.globalAlpha = a * 0.7;
//         ctx.fillStyle = `hsl(${p.hue},100%,65%)`;
//         ctx.shadowColor = `hsl(${p.hue},100%,65%)`;
//         ctx.shadowBlur = 6;
//         ctx.beginPath();
//         ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
//         ctx.fill();
//         ctx.restore();
//       });
//       raf.current = requestAnimationFrame(render);
//     };
//     raf.current = requestAnimationFrame(render);
//     return () => {
//       cancelAnimationFrame(raf.current);
//       window.removeEventListener("resize", resize);
//     };
//   }, []);
//   return (
//     <canvas
//       ref={ref}
//       style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
//     />
//   );
// }

// /* ─── Navbar ─────────────────────────────────────────────────── */
// function Navbar({ name, shieldActive }) {
//     const navigate = useNavigate();
//   return (
//     <nav
//       style={{
//         position: "fixed",
//         top: 0,
//         left: 0,
//         right: 0,
//         zIndex: 1000,
//         height: "64px",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "space-between",
//         background: "rgba(6,13,26,0.94)",
//         backdropFilter: "blur(24px)",
//         borderBottom: "1px solid rgba(0,180,255,0.14)",
//       }}
//       className="nav-inner"
//     >
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           gap: "8px",
//           flexShrink: 0,
//         }}
//       >
//         <div
//           style={{
//             width: "32px",
//             height: "32px",
//             border: "1.5px solid rgba(0,207,255,0.6)",
//             borderRadius: "7px",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             background: "rgba(0,207,255,0.07)",
//             boxShadow: "0 0 12px rgba(0,207,255,0.2)",
//             flexShrink: 0,
//           }}
//         >
//           <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
//             <path
//               d="M10 2L17 5L17 10C17 14.5 13.5 17.5 10 19C6.5 17.5 3 14.5 3 10L3 5Z"
//               fill="rgba(0,207,255,0.2)"
//               stroke="#00cfff"
//               strokeWidth="1.5"
//             />
//             <circle cx="10" cy="9" r="2.2" fill="#00cfff" />
//           </svg>
//         </div>
//         <span
//           style={{
//             fontFamily: "'Orbitron',monospace",
//             fontSize: "13px",
//             fontWeight: 700,
//             color: "#00cfff",
//             letterSpacing: "2px",
//             textShadow: "0 0 14px rgba(0,207,255,0.35)",
//           }}
//         >
//           SHIELDHER
//         </span>
//       </div>

//       <span className="nav-title">DASHBOARD</span>

//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           gap: "10px",
//           flexShrink: 0,
//         }}
//       >
//         <div className="nav-shield-pill">
//           <div
//             style={{
//               width: "6px",
//               height: "6px",
//               borderRadius: "50%",
//               background: "#00cfff",
//               boxShadow: "0 0 8px #00cfff",
//               animation: "blink 1.5s ease-in-out infinite",
//               flexShrink: 0,
//             }}
//           />
//          <button
//   onClick={() => navigate("/home")}
//   style={{
//     padding: "6px 12px",
//     background: "rgba(0,207,255,0.1)",
//     border: "1px solid rgba(0,207,255,0.4)",
//     borderRadius: "6px",
//     color: "#00cfff",
//     fontSize: "11px",
//     letterSpacing: "1px",
//     cursor: "pointer",
//     marginLeft: "10px"
//   }}
// >
//   HOME
// </button>
//         </div>
//         <div
//           style={{
//             width: "34px",
//             height: "34px",
//             borderRadius: "50%",
//             border: "1.5px solid rgba(0,207,255,0.45)",
//             background:
//               "linear-gradient(135deg,rgba(0,80,180,0.4),rgba(0,207,255,0.2))",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             fontFamily: "'Orbitron',monospace",
//             fontSize: "13px",
//             color: "#00cfff",
//             fontWeight: 700,
//             boxShadow: "0 0 10px rgba(0,207,255,0.2)",
//             cursor: "pointer",
//             flexShrink: 0,
//           }}
//         >
//           {name?.[0]?.toUpperCase() || "P"}
//         </div>
//       </div>
//     </nav>
//   );
// }

// /* ─── Stat Card ──────────────────────────────────────────────── */
// function StatCard({ icon, label, value, sub, color = "#00cfff", delay = 0 }) {
//   return (
//     <div
//       className="stat-card-pad"
//       style={{
//         background: "rgba(4,14,40,0.85)",
//         border: "1px solid rgba(0,180,255,0.16)",
//         borderRadius: "12px",
//         padding: "20px 22px",
//         position: "relative",
//         overflow: "hidden",
//         animation: `fadeUp .5s ease ${delay}ms both`,
//         boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
//         transition: "border-color .25s, box-shadow .25s",
//       }}
//       onMouseEnter={(e) => {
//         e.currentTarget.style.borderColor = `rgba(0,207,255,0.38)`;
//         e.currentTarget.style.boxShadow = `0 0 30px rgba(0,207,255,0.08), 0 4px 24px rgba(0,0,0,0.25)`;
//       }}
//       onMouseLeave={(e) => {
//         e.currentTarget.style.borderColor = "rgba(0,180,255,0.16)";
//         e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.25)";
//       }}
//     >
//       <div
//         style={{
//           position: "absolute",
//           top: 0,
//           left: "20%",
//           right: "20%",
//           height: "1px",
//           background: `linear-gradient(90deg,transparent,${color},transparent)`,
//           opacity: 0.5,
//         }}
//       />
//       <div
//         style={{
//           display: "flex",
//           alignItems: "flex-start",
//           justifyContent: "space-between",
//           marginBottom: "10px",
//         }}
//       >
//         <span className="stat-icon" style={{ fontSize: "22px" }}>
//           {icon}
//         </span>
//         <div
//           style={{
//             width: "6px",
//             height: "6px",
//             borderRadius: "50%",
//             background: color,
//             boxShadow: `0 0 7px ${color}`,
//             animation: "blink 2s ease-in-out infinite",
//           }}
//         />
//       </div>
//       <div
//         className="stat-value"
//         style={{
//           color,
//           textShadow: `0 0 14px ${color}55`,
//           marginBottom: "4px",
//         }}
//       >
//         {value}
//       </div>
//       <div
//         style={{
//           fontSize: "9px",
//           letterSpacing: "1.5px",
//           color: "rgba(0,207,255,0.55)",
//           fontFamily: "'Courier New',monospace",
//           textTransform: "uppercase",
//         }}
//       >
//         {label}
//       </div>
//       {sub && (
//         <div
//           style={{
//             fontSize: "10px",
//             color: "rgba(168,240,255,0.35)",
//             marginTop: "3px",
//             letterSpacing: ".5px",
//           }}
//         >
//           {sub}
//         </div>
//       )}
//     </div>
//   );
// }

// /* ─── Section Card ───────────────────────────────────────────── */
// function SCard({ icon, title, children, delay = 0, accent = "#00cfff" }) {
//   return (
//     <div
//       style={{
//         background: "rgba(4,14,40,0.85)",
//         border: "1px solid rgba(0,180,255,0.16)",
//         borderRadius: "14px",
//         overflow: "hidden",
//         boxShadow: "0 4px 30px rgba(0,0,0,0.22)",
//         animation: `fadeUp .55s ease ${delay}ms both`,
//         position: "relative",
//       }}
//     >
//       <div
//         style={{
//           position: "absolute",
//           top: 0,
//           left: "15%",
//           right: "15%",
//           height: "1px",
//           background: `linear-gradient(90deg,transparent,${accent},transparent)`,
//           opacity: 0.5,
//         }}
//       />
//       <div
//         style={{
//           position: "absolute",
//           left: 0,
//           right: 0,
//           height: "1px",
//           background: `linear-gradient(90deg,transparent,rgba(0,207,255,0.2),transparent)`,
//           animation: "scanLine 6s linear infinite",
//           pointerEvents: "none",
//         }}
//       />
//       <div
//         style={{
//           padding: "12px 16px",
//           borderBottom: "1px solid rgba(0,180,255,0.1)",
//           background: "rgba(0,207,255,0.03)",
//           display: "flex",
//           alignItems: "center",
//           gap: "10px",
//         }}
//       >
//         <span style={{ fontSize: "15px" }}>{icon}</span>
//         <span
//           style={{
//             fontFamily: "'Courier New',monospace",
//             fontSize: "11px",
//             letterSpacing: "2px",
//             color: "rgba(0, 208, 255, 0.81)",
//             textTransform: "uppercase",
//           }}
//         >
//           {title}
//         </span>
//       </div>
//       <div className="scard-body">{children}</div>
//       {[
//         {
//           bottom: 10,
//           left: 10,
//           borderBottom: "1px solid",
//           borderLeft: "1px solid",
//         },
//         {
//           bottom: 10,
//           right: 10,
//           borderBottom: "1px solid",
//           borderRight: "1px solid",
//         },
//       ].map((s, i) => (
//         <div
//           key={i}
//           style={{
//             position: "absolute",
//             width: "10px",
//             height: "10px",
//             borderColor: "rgba(0,207,255,0.18)",
//             ...s,
//           }}
//         />
//       ))}
//     </div>
//   );
// }

// /* ─── Info Row ───────────────────────────────────────────────── */
// function Row({ label, value, highlight }) {
//   return (
//     <div
//       style={{
//         display: "flex",
//         alignItems: "flex-start",
//         justifyContent: "space-between",
//         padding: "9px 0",
//         borderBottom: "1px solid rgba(0,180,255,0.07)",
//         gap: "12px",
//       }}
//     >
//       <span
//         style={{
//           fontSize: "9px",
//           letterSpacing: "1.5px",
//           color: "rgba(0, 208, 255, 0.72)",
//           fontFamily: "'Courier New',monospace",
//           textTransform: "uppercase",
//           flexShrink: 0,
//           paddingTop: "1px",
//         }}
//       >
//         {label}
//       </span>
//       <span
//         style={{
//           fontSize: "13px",
//           color: highlight ? "#00cfff" : "rgba(168,240,255,0.72)",
//           letterSpacing: ".5px",
//           textAlign: "right",
//           fontWeight: highlight ? 600 : 400,
//         }}
//       >
//         {value || "—"}
//       </span>
//     </div>
//   );
// }

// /* ─── GPS / Map Widget ───────────────────────────────────────── */
// function MapWidget({ radius }) {
//   const T = useRef(0);
//   const ref = useRef(null);
//   const raf = useRef(null);
//   const lst = useRef(null);
//   useEffect(() => {
//     const c = ref.current,
//       ctx = c.getContext("2d");
//     const W = c.width,
//       H = c.height,
//       cx = W / 2,
//       cy = H / 2;
//     const render = (now) => {
//       const dt = Math.min(now - (lst.current || now), 50) / 1000;
//       lst.current = now;
//       T.current += dt;
//       const t = T.current;
//       ctx.clearRect(0, 0, W, H);
//       ctx.fillStyle = "rgba(4,10,28,0.95)";
//       ctx.beginPath();
//       ctx.arc(cx, cy, cx, 0, Math.PI * 2);
//       ctx.fill();
//       ctx.save();
//       ctx.globalAlpha = 0.06;
//       ctx.strokeStyle = "#00cfff";
//       ctx.lineWidth = 0.5;
//       for (let x = 0; x < W; x += 18) {
//         ctx.beginPath();
//         ctx.moveTo(x, 0);
//         ctx.lineTo(x, H);
//         ctx.stroke();
//       }
//       for (let y = 0; y < H; y += 18) {
//         ctx.beginPath();
//         ctx.moveTo(0, y);
//         ctx.lineTo(W, y);
//         ctx.stroke();
//       }
//       ctx.restore();
//       const zR = cx * 0.58;
//       ctx.save();
//       ctx.strokeStyle = "#00cfff";
//       ctx.lineWidth = 1.5;
//       ctx.shadowColor = "#00cfff";
//       ctx.shadowBlur = 12;
//       ctx.globalAlpha = 0.5 + Math.sin(t * 1.2) * 0.15;
//       ctx.beginPath();
//       ctx.arc(cx, cy, zR, 0, Math.PI * 2);
//       ctx.stroke();
//       ctx.restore();
//       ctx.save();
//       ctx.fillStyle = "rgba(0,100,200,0.06)";
//       ctx.beginPath();
//       ctx.arc(cx, cy, zR, 0, Math.PI * 2);
//       ctx.fill();
//       ctx.restore();
//       ctx.save();
//       ctx.globalAlpha = 0.18;
//       ctx.strokeStyle = "#00cfff";
//       ctx.lineWidth = 0.8;
//       ctx.beginPath();
//       ctx.moveTo(cx, 10);
//       ctx.lineTo(cx, H - 10);
//       ctx.stroke();
//       ctx.beginPath();
//       ctx.moveTo(10, cy);
//       ctx.lineTo(W - 10, cy);
//       ctx.stroke();
//       ctx.restore();
//       [cx * 0.72, cx * 0.86, cx * 0.96].forEach((r, i) => {
//         ctx.save();
//         ctx.globalAlpha = 0.12 - i * 0.03;
//         ctx.strokeStyle = "#00cfff";
//         ctx.lineWidth = 0.6;
//         ctx.beginPath();
//         ctx.arc(cx, cy, r, 0, Math.PI * 2);
//         ctx.stroke();
//         ctx.restore();
//       });
//       const sweep = (t * 0.8) % (Math.PI * 2);
//       ctx.save();
//       ctx.globalAlpha = 0.18;
//       ctx.strokeStyle = "#00cfff";
//       ctx.lineWidth = 2;
//       ctx.shadowColor = "#00cfff";
//       ctx.shadowBlur = 8;
//       ctx.beginPath();
//       ctx.moveTo(cx, cy);
//       ctx.arc(cx, cy, cx * 0.92, sweep - 0.6, sweep);
//       ctx.closePath();
//       ctx.fillStyle = "rgba(0,207,255,0.07)";
//       ctx.fill();
//       ctx.stroke();
//       ctx.restore();
//       for (let i = 0; i < 2; i++) {
//         const ph = (t * 0.5 + i / 2) % 1;
//         ctx.save();
//         ctx.globalAlpha = (1 - ph) * 0.35;
//         ctx.strokeStyle = "#00cfff";
//         ctx.lineWidth = 1.5;
//         ctx.beginPath();
//         ctx.arc(cx, cy, ph * zR, 0, Math.PI * 2);
//         ctx.stroke();
//         ctx.restore();
//       }
//       ctx.save();
//       ctx.fillStyle = "#00cfff";
//       ctx.shadowColor = "#00cfff";
//       ctx.shadowBlur = 16;
//       ctx.beginPath();
//       ctx.arc(cx, cy, 5, 0, Math.PI * 2);
//       ctx.fill();
//       ctx.fillStyle = "#fff";
//       ctx.shadowBlur = 0;
//       ctx.beginPath();
//       ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
//       ctx.fill();
//       ctx.restore();
//       for (let i = 0; i < 24; i++) {
//         const a = (i / 24) * Math.PI * 2;
//         const len = i % 6 === 0 ? 8 : 4;
//         ctx.save();
//         ctx.globalAlpha = i % 6 === 0 ? 0.5 : 0.25;
//         ctx.strokeStyle = "#00cfff";
//         ctx.lineWidth = i % 6 === 0 ? 1.2 : 0.7;
//         ctx.beginPath();
//         ctx.moveTo(cx + Math.cos(a) * zR, cy + Math.sin(a) * zR);
//         ctx.lineTo(
//           cx + Math.cos(a) * (zR + len),
//           cy + Math.sin(a) * (zR + len),
//         );
//         ctx.stroke();
//         ctx.restore();
//       }
//       ctx.save();
//       ctx.globalCompositeOperation = "destination-in";
//       ctx.beginPath();
//       ctx.arc(cx, cy, cx, 0, Math.PI * 2);
//       ctx.fill();
//       ctx.restore();
//       raf.current = requestAnimationFrame(render);
//     };
//     raf.current = requestAnimationFrame(render);
//     return () => cancelAnimationFrame(raf.current);
//   }, []);
//   return (
//     <div
//       style={{
//         position: "relative",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//       }}
//     >
//       <canvas
//         ref={ref}
//         width={180}
//         height={180}
//         style={{ borderRadius: "50%", display: "block" }}
//       />
//       <div
//         style={{
//           position: "absolute",
//           bottom: "-22px",
//           left: "50%",
//           transform: "translateX(-50%)",
//           fontSize: "9px",
//           letterSpacing: "2px",
//           color: "rgba(0,207,255,0.5)",
//           fontFamily: "'Courier New',monospace",
//           whiteSpace: "nowrap",
//         }}
//       >
//         SAFE ZONE · {Number(radius).toLocaleString()} m
//       </div>
//     </div>
//   );
// }

// /* ─── Contact Badge ──────────────────────────────────────────── */
// function ContactBadge({ c, i }) {
//   const colors = [
//     "#00cfff",
//     "#7de8ff",
//     "#5bc8ff",
//     "rgba(0,207,255,0.6)",
//     "rgba(125,232,255,0.7)",
//   ];
//   const col = colors[Math.min(i, colors.length - 1)];
//   const priorityLabel = ["High", "Medium", "Low"][
//     Math.min((c.priority || 1) - 1, 2)
//   ];
//   return (
//     <div
//       className="contact-badge-pad"
//       style={{
//         background: "rgba(0,20,55,0.7)",
//         border: `1px solid ${col}28`,
//         borderRadius: "10px",
//         padding: "14px 16px",
//         display: "flex",
//         alignItems: "center",
//         gap: "14px",
//         animation: `slideIn .35s ease ${i * 80}ms both`,
//         transition: "border-color .25s, box-shadow .25s",
//       }}
//       onMouseEnter={(e) => {
//         e.currentTarget.style.borderColor = col;
//         e.currentTarget.style.boxShadow = `0 0 18px ${col}22`;
//       }}
//       onMouseLeave={(e) => {
//         e.currentTarget.style.borderColor = `${col}28`;
//         e.currentTarget.style.boxShadow = "none";
//       }}
//     >
//       <div
//         className="contact-avatar"
//         style={{
//           width: "40px",
//           height: "40px",
//           borderRadius: "50%",
//           border: `1.5px solid ${col}`,
//           background: `${col}12`,
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           fontFamily: "'Orbitron',monospace",
//           fontSize: "14px",
//           color: col,
//           fontWeight: 700,
//           flexShrink: 0,
//           boxShadow: `0 0 10px ${col}30`,
//         }}
//       >
//         {c.name?.[0]?.toUpperCase()}
//       </div>
//       <div style={{ flex: 1, minWidth: 0 }}>
//         <div
//           className="contact-name"
//           style={{
//             fontFamily: "'Rajdhani',sans-serif",
//             fontSize: "15px",
//             fontWeight: 600,
//             color: "rgba(168,240,255,0.85)",
//             letterSpacing: ".5px",
//             marginBottom: "2px",
//             overflow: "hidden",
//             textOverflow: "ellipsis",
//             whiteSpace: "nowrap",
//           }}
//         >
//           {c.name}
//         </div>
//         <div
//           className="contact-sub"
//           style={{
//             fontSize: "13px",
//             color: "rgba(0, 179, 255, 0.86)",
//             letterSpacing: "1px",
//           }}
//         >
//           {c.relation} · {c.phone}
//         </div>
//       </div>
//       <div
//         style={{
//           display: "flex",
//           flexDirection: "column",
//           alignItems: "flex-end",
//           gap: "3px",
//           flexShrink: 0,
//         }}
//       >
//         <div
//           style={{
//             fontSize: "8px",
//             letterSpacing: "1.5px",
//             color: col,
//             fontFamily: "'Courier New',monospace",
//           }}
//         >
//           PRIORITY
//         </div>
//         <div
//           style={{
//             fontSize: "11px",
//             color: col,
//             fontFamily: "'Courier New',monospace",
//             fontWeight: 700,
//           }}
//         >
//           P{c.priority || 1} · {priorityLabel}
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ─── Shield Status Widget ───────────────────────────────────── */
// function ShieldStatus() {
//   const T = useRef(0);
//   const ref = useRef(null);
//   const raf = useRef(null);
//   const lst = useRef(null);
//   useEffect(() => {
//     const c = ref.current,
//       ctx = c.getContext("2d"),
//       W = c.width,
//       H = c.height,
//       cx = W / 2,
//       cy = H / 2;
//     const render = (now) => {
//       const dt = Math.min(now - (lst.current || now), 50) / 1000;
//       lst.current = now;
//       T.current += dt;
//       const t = T.current;
//       ctx.clearRect(0, 0, W, H);
//       [50, 65, 78].forEach((r, i) => {
//         ctx.save();
//         ctx.strokeStyle = i === 0 ? "#00cfff" : "rgba(0,207,255,0.3)";
//         ctx.lineWidth = i === 0 ? 2 : 1;
//         ctx.shadowColor = "#00cfff";
//         ctx.shadowBlur = i === 0 ? 12 : 4;
//         ctx.globalAlpha = 0.5 + Math.sin(t * 1.5 + i) * 0.2;
//         if (i === 1) {
//           ctx.setLineDash([4, 4]);
//           ctx.lineDashOffset = -t * 20;
//         }
//         ctx.beginPath();
//         ctx.arc(cx, cy, r, 0, Math.PI * 2);
//         ctx.stroke();
//         ctx.restore();
//       });
//       const sc = 1.4;
//       ctx.save();
//       ctx.translate(cx, cy - 5);
//       ctx.fillStyle = "rgba(0,100,200,0.18)";
//       ctx.strokeStyle = "#00cfff";
//       ctx.lineWidth = 2;
//       ctx.shadowColor = "#00cfff";
//       ctx.shadowBlur = 15 + Math.sin(t * 2) * 5;
//       ctx.beginPath();
//       ctx.moveTo(0, -28 * sc);
//       ctx.bezierCurveTo(24 * sc, -14 * sc, 25 * sc, 4 * sc, 0, 30 * sc);
//       ctx.bezierCurveTo(-25 * sc, 4 * sc, -24 * sc, -14 * sc, 0, -28 * sc);
//       ctx.closePath();
//       ctx.fill();
//       ctx.stroke();
//       ctx.fillStyle = "#00cfff";
//       ctx.shadowBlur = 20;
//       ctx.beginPath();
//       ctx.arc(0, 2, 5, 0, Math.PI * 2);
//       ctx.fill();
//       ctx.restore();
//       for (let i = 0; i < 2; i++) {
//         const ph = (t * 0.6 + i / 2) % 1;
//         ctx.save();
//         ctx.globalAlpha = (1 - ph) * 0.3;
//         ctx.strokeStyle = "#00cfff";
//         ctx.lineWidth = 1.5;
//         ctx.beginPath();
//         ctx.arc(cx, cy, 50 + ph * 40, 0, Math.PI * 2);
//         ctx.stroke();
//         ctx.restore();
//       }
//       raf.current = requestAnimationFrame(render);
//     };
//     raf.current = requestAnimationFrame(render);
//     return () => cancelAnimationFrame(raf.current);
//   }, []);
//   return (
//     <canvas ref={ref} width={160} height={160} style={{ display: "block" }} />
//   );
// }

// /* ─── Main Dashboard ─────────────────────────────────────────── */
// export default function Dashboard() {
//   const [customTriggers, setCustomTriggers] = useState([]);
//   const [inputWord, setInputWord] = useState("");
//   const [profile, setProfile] = useState(null);
//   const [shieldActive, setShieldActive] = useState(true);
//   const [uptime] = useState("04:27:13");

//   const handleClick = async (e, l) => {
//   e.preventDefault();

//   if (l === "Profile") {
//     try {
//       const token = localStorage.getItem("token");

//       if (!token) {
//         navigate("/details");
//         return;
//       }

//       const res = await fetch(
//         "https://shieldher-backend-1h8b.onrender.com/api/profile",
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       console.log("STATUS:", res.status); // 👈 DEBUG

//       if (res.status === 200) {
//         navigate("/dashboard");
//       } else if (res.status === 404) {
//         navigate("/details");
//       } else if (res.status === 401) {
//         localStorage.removeItem("token");
//         navigate("/login");
//       } else {
//         navigate("/details");
//       }
//     } catch (err) {
//       console.error("Error:", err);
//       navigate("/details");
//     }
//   }
// };
//   useEffect(() => {
//     fetchProfile();
//   }, []);

//   if (!profile)
//     return (
//       <h2
//         style={{
//           color: "#fff",
//           textAlign: "center",
//           marginTop: "40vh",
//           fontFamily: "'Orbitron',monospace",
//         }}
//       >
//         Loading...
//       </h2>
//     );

//   const personal = profile;
//   const contacts = profile.emergencyContacts || [];
//   const address = profile.address || {};
//   const fullName = `${personal.firstName} ${personal.lastName}`.trim();

//   const addTrigger = () => {
//     const word = inputWord.trim().toLowerCase();
//     if (!word || customTriggers.includes(word) || customTriggers.length >= 2)
//       return;
//     setCustomTriggers([...customTriggers, word]);
//     setInputWord("");
//   };
//   const removeTrigger = (word) =>
//     setCustomTriggers(customTriggers.filter((w) => w !== word));

//   return (
//     <>
//       <style>{CSS}</style>
//       <div
//         style={{
//           position: "relative",
//           minHeight: "100vh",
//           background: "#060d1a",
//         }}
//       >
//         <BG />
//         <Navbar name={personal.firstName} shieldActive={shieldActive} />

//         <main
//           className="main-pad"
//           style={{
//             position: "relative",
//             zIndex: 1,
//             maxWidth: "1200px",
//             margin: "0 auto",
//             background: `linear-gradient(rgba(4,13,28,0.55), rgba(4,13,28,0.65)), url("https://i.pinimg.com/736x/b3/15/52/b315527f272a1a00df44206a286308b7.jpg")`,
//             backgroundSize: "contain",
//             backgroundPosition: "center",
//             backgroundRepeat: "repeat",
//           }}
//         >
//           {/* ── Welcome banner ── */}
//           <div
//             style={{ marginBottom: "28px", animation: "fadeUp .5s ease both" }}
//           >
//             <div
//               style={{
//                 fontSize: "9px",
//                 letterSpacing: "4px",
//                 color: "rgba(0, 208, 255, 0.81)",
//                 marginBottom: "8px",
//                 fontFamily: "'Courier New',monospace",
//               }}
//             >
//               ◈ SECURE DASHBOARD
//             </div>
//             <div
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "space-between",
//                 flexWrap: "wrap",
//                 gap: "10px",
//               }}
//             >
//               <div>
//                 <h1 className="welcome-h1">
//                   WELCOME BACK, {personal.firstName?.toUpperCase() || "USER"}
//                 </h1>
//                 <p
//                   style={{
//                     fontSize: "11px",
//                     color: "rgba(0, 179, 255, 0.74)",
//                     letterSpacing: "1px",
//                     fontFamily: "'Courier New',monospace",
//                     marginTop: "4px",
//                   }}
//                 >
//                   YOUR SHIELD IS ACTIVE · ALL SYSTEMS OPERATIONAL
//                 </p>
//               </div>
//               <button
//                 className="sos-btn"
//                 style={{
//                   background: shieldActive
//                     ? "linear-gradient(90deg,rgba(0,100,200,0.5),rgba(0,207,255,0.38))"
//                     : "rgba(255,0,60,0.15)",
//                   border: `1px solid ${shieldActive ? "rgba(0, 208, 255, 0.28)" : "rgba(255,0,60,0.5)"}`,
//                   borderRadius: "8px",
//                   color: shieldActive ? "#7de8ff" : "#ff4488",
//                   fontFamily: "'Orbitron',monospace",
//                   fontWeight: 700,
//                   cursor: "pointer",
//                   boxShadow: shieldActive
//                     ? "0 0 30px rgba(0,207,255,0.2)"
//                     : "0 0 30px rgba(255,0,60,0.2)",
//                   animation: "pulseRing 2.5s ease-in-out infinite",
//                   transition: "all .3s",
//                 }}
//                 onClick={() => setShieldActive((a) => !a)}
//               >
//                 {shieldActive ? "🛡 SHIELD ON" : "⚠ SHIELD OFF"}
//               </button>
//             </div>
//             <div
//               style={{
//                 height: "1px",
//                 marginTop: "16px",
//                 background:
//                   "linear-gradient(90deg,rgba(0,207,255,0.3),transparent)",
//               }}
//             />
//           </div>

//           {/* ── Stat cards ── */}
//           <div className="stat-grid">
//             <StatCard
//               icon="👤"
//               label="Profile Status"
//               value="COMPLETE"
//               sub="All fields filled"
//               color="#00cfff"
//               delay={0}
//             />
//             <StatCard
//               icon="🛡"
//               label="Shield Status"
//               value={shieldActive ? "ACTIVE" : "OFFLINE"}
//               sub="Real-time protection"
//               color={shieldActive ? "#00cfff" : "#ff4488"}
//               delay={80}
//             />
//             <StatCard
//               icon="👥"
//               label="SOS Contacts"
//               value={`${contacts.length}/5`}
//               sub="Emergency network"
//               color="#7de8ff"
//               delay={160}
//             />
//             <StatCard
//               icon="⏱"
//               label="Uptime"
//               value={uptime}
//               sub="Session active"
//               color="#5bc8ff"
//               delay={240}
//             />
//           </div>

//           {/* ── Main 3-column grid ── */}
//           <div className="main-grid">
//             {/* Col 1: Personal Info */}
//             <SCard icon="👤" title="Personal Information" delay={100}>
//               <div
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   gap: "12px",
//                   marginBottom: "16px",
//                 }}
//               >
//                 <div
//                   style={{
//                     width: "52px",
//                     height: "52px",
//                     borderRadius: "50%",
//                     border: "2px solid rgba(0,207,255,0.5)",
//                     background:
//                       "linear-gradient(135deg,rgba(0,80,180,0.4),rgba(0,207,255,0.2))",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     fontFamily: "'Orbitron',monospace",
//                     fontSize: "20px",
//                     color: "#00cfff",
//                     fontWeight: 700,
//                     boxShadow: "0 0 18px rgba(0,207,255,0.25)",
//                     flexShrink: 0,
//                     animation: "shieldOn 4s ease-in-out infinite",
//                   }}
//                 >
//                   {personal.firstName?.[0]?.toUpperCase()}
//                 </div>
//                 <div>
//                   <div
//                     style={{
//                       fontFamily: "'Orbitron',monospace",
//                       fontSize: "0.95rem",
//                       fontWeight: 700,
//                       color: "#7de8ff",
//                       letterSpacing: "1px",
//                     }}
//                   >
//                     {fullName}
//                   </div>
//                   <div
//                     style={{
//                       fontSize: "11px",
//                       color: "rgba(0, 179, 255, 0.93)",
//                       letterSpacing: "1px",
//                       marginTop: "2px",
//                       fontFamily: "'Courier New',monospace",
//                     }}
//                   >
//                     AGE {personal.age} · {personal.bloodGroup || "—"}
//                   </div>
//                 </div>
//               </div>
//               <Row label="Phone" value={personal.phone} highlight />
//               <Row
//                 label="Date of Birth"
//                 value={
//                   personal.dob
//                     ? new Date(personal.dob).toLocaleDateString("en-IN", {
//                         day: "2-digit",
//                         month: "short",
//                         year: "numeric",
//                       })
//                     : "—"
//                 }
//               />
//               <Row label="Blood Group" value={personal.bloodGroup} highlight />
//               {personal.medicalNotes && (
//                 <div style={{ marginTop: "12px" }}>
//                   <div
//                     style={{
//                       fontSize: "9px",
//                       letterSpacing: "2px",
//                       color: "rgba(0,207,255,0.4)",
//                       fontFamily: "'Courier New',monospace",
//                       marginBottom: "6px",
//                     }}
//                   >
//                     MEDICAL NOTES
//                   </div>
//                   <div
//                     style={{
//                       fontSize: "13px",
//                       color: "rgba(168, 241, 255, 0.9)",
//                       lineHeight: 1.6,
//                       padding: "10px 12px",
//                       background: "rgba(0,207,255,0.04)",
//                       border: "1px solid rgba(0,180,255,0.1)",
//                       borderRadius: "6px",
//                     }}
//                   >
//                     {personal.medicalNotes}
//                   </div>
//                 </div>
//               )}
//             </SCard>

//             {/* Col 2: GPS / Safe Zone */}
//             <SCard
//               icon="📍"
//               title="Location & Safe Zone"
//               delay={160}
//               accent="#7de8ff"
//             >
//               <div
//                 style={{
//                   display: "flex",
//                   justifyContent: "center",
//                   marginBottom: "38px",
//                 }}
//               >
//                 <MapWidget radius={address.radius} />
//               </div>
//               <Row label="Address" value={address.line1} />
//               {address.line2 && <Row label="Landmark" value={address.line2} />}
//               <Row
//                 label="City"
//                 value={`${address.city}, ${address.state}`}
//                 highlight
//               />
//               <Row label="PIN Code" value={address.pincode} />
//               <Row label="Country" value={address.country} />
//               <Row
//                 label="Safe Zone"
//                 value={`${Number(address.radius).toLocaleString()} metres`}
//                 highlight
//               />
//               <div style={{ marginTop: "12px" }}>
//                 <div
//                   style={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     marginBottom: "5px",
//                   }}
//                 >
//                   <span
//                     style={{
//                       fontSize: "9px",
//                       letterSpacing: "1.5px",
//                       color: "rgba(0,207,255,0.4)",
//                       fontFamily: "'Courier New',monospace",
//                     }}
//                   >
//                     ZONE SIZE
//                   </span>
//                   <span
//                     style={{
//                       fontSize: "9px",
//                       color: "#00cfff",
//                       fontFamily: "'Courier New',monospace",
//                     }}
//                   >
//                     {Math.round(((address.radius - 100) / 4900) * 100)}%
//                   </span>
//                 </div>
//                 <div
//                   style={{
//                     height: "3px",
//                     background: "rgba(0,180,255,0.12)",
//                     borderRadius: "2px",
//                   }}
//                 >
//                   <div
//                     style={{
//                       height: "100%",
//                       width: `${Math.round(((address.radius - 100) / 4900) * 100)}%`,
//                       background: "linear-gradient(90deg,#0060c0,#00cfff)",
//                       borderRadius: "2px",
//                       boxShadow: "0 0 8px rgba(0,207,255,0.4)",
//                       transition: "width .6s ease",
//                     }}
//                   />
//                 </div>
//               </div>
//             </SCard>

//             {/* Col 3: Shield Status */}
//             <SCard icon="🛡" title="Shield Status" delay={220} accent="#5bc8ff">
//               <div
//                 style={{
//                   display: "flex",
//                   flexDirection: "column",
//                   alignItems: "center",
//                   gap: "16px",
//                 }}
//               >
//                 <ShieldStatus />
//                 <div style={{ textAlign: "center" }}>
//                   <div
//                     style={{
//                       fontFamily: "'Orbitron',monospace",
//                       fontSize: "1rem",
//                       fontWeight: 700,
//                       color: shieldActive ? "#00cfff" : "#ff4488",
//                       textShadow: shieldActive
//                         ? "0 0 20px rgba(0,207,255,0.5)"
//                         : "none",
//                       marginBottom: "4px",
//                     }}
//                   >
//                     {shieldActive ? "SHIELD ACTIVE" : "SHIELD OFFLINE"}
//                   </div>
//                   <div
//                     style={{
//                       fontSize: "10px",
//                       color: "rgba(0,180,255,0.45)",
//                       letterSpacing: "1.5px",
//                       fontFamily: "'Courier New',monospace",
//                     }}
//                   >
//                     {shieldActive
//                       ? "MONITORING · GPS LIVE · AI ON"
//                       : "TAP TO ACTIVATE"}
//                   </div>
//                 </div>
//               </div>
//               <div
//                 style={{
//                   marginTop: "16px",
//                   display: "flex",
//                   flexDirection: "column",
//                   gap: "7px",
//                 }}
//               >
//                 {[
//                   ["GPS Signal", "STRONG", "#00cfff"],
//                   ["AI Engine", "ONLINE", "#00cfff"],
//                   ["GSM Module", "READY", "#7de8ff"],
//                   ["Cloud Sync", "ACTIVE", "#5bc8ff"],
//                   ["Contacts", "NOTIFIED", "#00cfff"],
//                 ].map(([l, v, c]) => (
//                   <div
//                     key={l}
//                     style={{
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "space-between",
//                       padding: "7px 10px",
//                       background: "rgba(0,20,55,0.5)",
//                       border: "1px solid rgba(0,180,255,0.1)",
//                       borderRadius: "5px",
//                     }}
//                   >
//                     <span
//                       style={{
//                         fontSize: "9px",
//                         letterSpacing: "1.5px",
//                         color: "rgba(0, 179, 255, 0.77)",
//                         fontFamily: "'Courier New',monospace",
//                       }}
//                     >
//                       {l}
//                     </span>
//                     <div
//                       style={{
//                         display: "flex",
//                         alignItems: "center",
//                         gap: "6px",
//                       }}
//                     >
//                       <div
//                         style={{
//                           width: "5px",
//                           height: "5px",
//                           borderRadius: "50%",
//                           background: c,
//                           boxShadow: `0 0 6px ${c}`,
//                           animation: "blink 1.8s ease-in-out infinite",
//                         }}
//                       />
//                       <span
//                         style={{
//                           fontSize: "9px",
//                           color: c,
//                           fontFamily: "'Courier New',monospace",
//                           letterSpacing: "1px",
//                         }}
//                       >
//                         {v}
//                       </span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </SCard>
//           </div>

//           {/* ── Emergency Contacts ── */}
//           <div style={{ marginTop: "20px" }}>
//             <SCard icon="🚨" title="Emergency Contacts" delay={280}>
//               <div className="contacts-grid">
//                 {contacts.map((c, i) => (
//                   <ContactBadge key={i} c={c} i={i} />
//                 ))}
//               </div>
//               <div
//                 style={{
//                   marginTop: "12px",
//                   padding: "10px 14px",
//                   background: "rgba(0,207,255,0.04)",
//                   border: "1px solid rgba(0,180,255,0.1)",
//                   borderRadius: "7px",
//                   display: "flex",
//                   alignItems: "center",
//                   gap: "10px",
//                 }}
//               >
//                 <div
//                   style={{
//                     width: "5px",
//                     height: "5px",
//                     borderRadius: "50%",
//                     background: "#00cfff",
//                     boxShadow: "0 0 6px #00cfff",
//                     flexShrink: 0,
//                   }}
//                 />
//                 <p
//                   style={{
//                     fontSize: "11px",
//                     color: "rgba(0,180,255,0.42)",
//                     fontFamily: "'Courier New',monospace",
//                     letterSpacing: ".8px",
//                   }}
//                 >
//                   ALL {contacts.length} CONTACTS WILL RECEIVE INSTANT CALL + SMS
//                   WITH LIVE GPS WHEN SHIELDHER ACTIVATES
//                 </p>
//               </div>
//             </SCard>
//           </div>

//           {/* ── Trigger Words ── */}
//           <div style={{ marginTop: "20px" }}>
//             <SCard icon="🎤" title="Trigger Words" delay={320}>
//               <div className="trigger-grid">
//                 {/* Fixed triggers */}
//                 <div>
//                   <div
//                     style={{
//                       fontSize: "9px",
//                       letterSpacing: "2px",
//                       color: "rgba(0,207,255,0.5)",
//                       fontFamily: "'Courier New',monospace",
//                       marginBottom: "8px",
//                     }}
//                   >
//                     SYSTEM TRIGGERS (FIXED)
//                   </div>
//                   {["HELP", "DANGER", "EMERGENCY"].map((word, i) => (
//                     <div
//                       key={i}
//                       style={{
//                         padding: "9px 14px",
//                         background: "rgba(0,207,255,0.05)",
//                         border: "1px solid rgba(0,180,255,0.2)",
//                         borderRadius: "6px",
//                         marginBottom: "6px",
//                         color: "#00cfff",
//                         fontFamily: "'Orbitron',monospace",
//                         letterSpacing: "2px",
//                         fontSize: "12px",
//                       }}
//                     >
//                       {word}
//                     </div>
//                   ))}
//                 </div>

//                 {/* Custom triggers */}
//                 <div>
//                   <div
//                     style={{
//                       fontSize: "9px",
//                       letterSpacing: "2px",
//                       color: "rgba(0,207,255,0.5)",
//                       fontFamily: "'Courier New',monospace",
//                       marginBottom: "8px",
//                     }}
//                   >
//                     CUSTOM TRIGGERS (MAX 2)
//                   </div>
//                   <div
//                     style={{
//                       display: "flex",
//                       gap: "8px",
//                       marginBottom: "10px",
//                     }}
//                   >
//                     <input
//                       value={inputWord}
//                       onChange={(e) => setInputWord(e.target.value)}
//                       onKeyDown={(e) => e.key === "Enter" && addTrigger()}
//                       placeholder="Enter trigger word"
//                       style={{
//                         flex: 1,
//                         padding: "9px 10px",
//                         background: "rgba(0,20,55,0.7)",
//                         border: "1px solid rgba(0,180,255,0.2)",
//                         borderRadius: "6px",
//                         color: "#a8f0ff",
//                         outline: "none",
//                         fontFamily: "'Rajdhani',sans-serif",
//                         fontSize: "14px",
//                       }}
//                     />
//                     <button
//                       onClick={addTrigger}
//                       style={{
//                         padding: "9px 14px",
//                         background: "rgba(0,207,255,0.15)",
//                         border: "1px solid rgba(0,207,255,0.4)",
//                         borderRadius: "6px",
//                         color: "#00cfff",
//                         fontFamily: "'Orbitron',monospace",
//                         cursor: "pointer",
//                         fontSize: "11px",
//                         flexShrink: 0,
//                       }}
//                     >
//                       ADD
//                     </button>
//                   </div>
//                   {customTriggers.length === 0 ? (
//                     <p
//                       style={{
//                         fontSize: "12px",
//                         color: "rgba(168,240,255,0.4)",
//                         fontFamily: "'Courier New',monospace",
//                       }}
//                     >
//                       No custom triggers added
//                     </p>
//                   ) : (
//                     customTriggers.map((word, i) => (
//                       <span
//                         key={i}
//                         onClick={() => removeTrigger(word)}
//                         style={{
//                           display: "inline-block",
//                           padding: "7px 12px",
//                           marginRight: "8px",
//                           marginBottom: "6px",
//                           background: "rgba(0,207,255,0.1)",
//                           border: "1px solid rgba(0,207,255,0.4)",
//                           borderRadius: "20px",
//                           color: "#7de8ff",
//                           cursor: "pointer",
//                           fontSize: "12px",
//                           fontFamily: "'Rajdhani',sans-serif",
//                         }}
//                       >
//                         {word} ✕
//                       </span>
//                     ))
//                   )}
//                 </div>
//               </div>
//             </SCard>
//           </div>
//         </main>
//       </div>
//     </>
//   );
// }
