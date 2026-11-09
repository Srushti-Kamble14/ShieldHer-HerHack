import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

/* ─── CSS ────────────────────────────────────────────────────── */
const G = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Rajdhani:wght@400;500;600;700&display=swap');
  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
  body { background:#060d1a; color:#a8f0ff; font-family:'Rajdhani',sans-serif; min-height:100vh; overflow-x:hidden; }

  ::-webkit-scrollbar { width:6px; }
  ::-webkit-scrollbar-track { background: #0a0a0a; }
  ::-webkit-scrollbar-thumb { background: #000; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: #222; }

  input, select, textarea {
    background: rgba(0,25,60,0.6);
    border: 1px solid rgba(0,180,255,0.22);
    border-radius: 6px;
    color: #a8f0ff;
    font-family: 'Rajdhani', sans-serif;
    font-size: 15px;
    font-weight: 500;
    padding: 11px 14px;
    width: 100%;
    outline: none;
    letter-spacing: 0.4px;
    transition: border-color .22s, box-shadow .22s, background .22s;
  }
  input::placeholder, textarea::placeholder { color: rgba(0,180,255,0.25); }
  input:focus, select:focus, textarea:focus {
    border-color: rgba(0,207,255,0.65);
    background: rgba(0,35,80,0.75);
    box-shadow: 0 0 0 3px rgba(0,207,255,0.1), 0 0 18px rgba(0,207,255,0.08);
  }
  input[type=range] {
    padding:0; height:4px; cursor:pointer;
    accent-color:#00cfff; border:none; background:transparent;
  }
  input:-webkit-autofill {
    -webkit-box-shadow: 0 0 0 100px rgba(0,20,50,0.95) inset !important;
    -webkit-text-fill-color: #a8f0ff !important;
  }
  select option { background:#060d1a; color:#a8f0ff; }

  @keyframes fadeUp   { from{opacity:0;transform:translateY(24px);} to{opacity:1;transform:translateY(0);} }
  @keyframes fadeIn   { from{opacity:0;} to{opacity:1;} }
  @keyframes blink    { 0%,100%{opacity:1;} 50%{opacity:0.25;} }
  @keyframes scan     { 0%{top:0%;} 100%{top:100%;} }
  @keyframes glow     { 0%,100%{text-shadow:0 0 18px rgba(0,207,255,0.4);} 50%{text-shadow:0 0 36px rgba(0,207,255,0.75);} }
  @keyframes pulseRing{ 0%,100%{box-shadow:0 0 0 0 rgba(0,207,255,0.4);} 50%{box-shadow:0 0 0 12px rgba(0,207,255,0);} }
  @keyframes slideIn  { from{opacity:0;transform:translateX(-16px);} to{opacity:1;transform:translateX(0);} }
  @keyframes spin     { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }

  /* ── Responsive Utilities ── */
  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }
  .grid-2-contact {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .grid-addr {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  /* Steps connector line */
  .step-line {
    width: 80px;
    height: 1px;
    margin-top: 14px;
    transition: all .3s;
    flex-shrink: 0;
  }
  .step-label {
    font-size: 9px;
    letter-spacing: 1px;
    text-transform: uppercase;
    font-family: 'Courier New', monospace;
    white-space: nowrap;
    transition: color .3s;
  }

  /* Navbar title */
  .nav-title {
    font-family: 'Courier New', monospace;
    font-size: 18px;
    letter-spacing: 3px;
    color: rgba(33, 175, 207, 0.92);
  }

  /* ── Mobile ── */
  @media (max-width: 600px) {
    .grid-2, .grid-2-contact, .grid-addr {
      grid-template-columns: 1fr !important;
    }

    /* Steps */
    .step-line { width: 28px !important; }
    .step-label { font-size: 6.5px !important; letter-spacing: 0.3px !important; }
    .step-circle { width: 24px !important; height: 24px !important; }
    .step-num { font-size: 8px !important; }

    /* Navbar */
    .nav-title { font-size: 11px !important; letter-spacing: 1px !important; }
    .nav-logo-text { font-size: 11px !important; letter-spacing: 1.5px !important; }
    .nav-session-text { display: none !important; }

    /* Layout */
    .main-content { padding: 72px 10px 48px !important; }

    /* Cards */
    .card-body { padding: 12px 10px !important; gap: 12px !important; }
    .contact-body { padding: 12px 10px !important; }

    /* Card header */
    .card-header { padding: 10px 12px !important; }
    .card-icon { font-size: 14px !important; }
    .card-title-text { font-size: 9px !important; letter-spacing: 1.5px !important; }

    /* Inputs & selects */
    input, select, textarea {
      font-size: 13px !important;
      padding: 9px 10px !important;
    }

    /* Field labels */
    .field-label { font-size: 10px !important; letter-spacing: 1.5px !important; }
    .field-hint { font-size: 10px !important; }

    /* Page heading */
    .page-heading { font-size: 1.1rem !important; letter-spacing: 2px !important; }

    /* Contact card header */
    .contact-header { padding: 10px 12px !important; }
    .contact-avatar-circle { width: 26px !important; height: 26px !important; font-size: 10px !important; }
    .contact-label { font-size: 8px !important; letter-spacing: 1px !important; }
    .contact-sub-name { font-size: 11px !important; }

    /* Priority buttons */
    .priority-row { flex-wrap: wrap; gap: 6px !important; }

    /* NavBtn */
    .nav-btn-back { padding: 10px 14px !important; font-size: 10px !important; }
    .nav-btn-next { padding: 12px 10px !important; font-size: 10px !important; letter-spacing: 1.5px !important; }

    /* Range labels */
    .range-labels span { font-size: 8px !important; }

    /* Info banner */
    .info-banner { padding: 10px 12px !important; font-size: 11px !important; }

    /* Add contact button */
    .add-contact-btn { padding: 10px !important; font-size: 9px !important; letter-spacing: 1px !important; }

    /* Contacts counter */
    .contacts-counter { font-size: 8px !important; }

    /* Save section note */
    .save-note { font-size: 8px !important; }

    /* Save button */
    .save-btn { font-size: 10px !important; letter-spacing: 1.5px !important; padding: 12px 10px !important; }
  }

  /* ── Tablet ── */
  @media (min-width: 601px) and (max-width: 860px) {
    .step-line { width: 50px !important; }
    .step-label { font-size: 8px !important; }
    .nav-title { font-size: 14px !important; letter-spacing: 2px !important; }
    .main-content { padding: 88px 20px 60px !important; }
  }
`;

/* ─── Animated Background ────────────────────────────────────── */
function BlueBG() {
  const ref = useRef(null);
  const rafRef = useRef(null);
  const tRef = useRef(0);
  const lastRef = useRef(null);
  const ptsRef = useRef([]);

  useEffect(() => {
    const c = ref.current;
    const ctx = c.getContext("2d");

    const resize = () => {
      c.width = window.innerWidth;
      c.height = window.innerHeight;
      const count = Math.floor((c.width * c.height) / 2500);
      ptsRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * c.width,
        y: Math.random() * c.height,
        r: 0.5 + Math.random() * 2,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.08 - Math.random() * 0.28,
        alpha: 0.12 + Math.random() * 0.45,
        pulse: Math.random() * Math.PI * 2,
        hue: 185 + Math.random() * 35,
      }));
    };
    resize();
    window.addEventListener("resize", resize);

    const render = (now) => {
      const W = c.width,
        H = c.height;
      const dt = Math.min(now - (lastRef.current || now), 50) / 1000;
      lastRef.current = now;
      tRef.current += dt;
      const t = tRef.current;

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
        [0.18, 0.22, 0.28],
        [0.82, 0.72, 0.22],
        [0.5, 0.9, 0.18],
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
          `rgba(0,80,160,${0.07 + Math.sin(t * 0.4 + rx * 8) * 0.025})`,
        );
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      });

      ctx.save();
      ctx.globalAlpha = 0.025;
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

      ptsRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += dt * 1.3;
        if (p.y < -10) {
          p.y = H + 10;
          p.x = Math.random() * W;
        }
        const a = p.alpha * (0.4 + Math.sin(p.pulse) * 0.4);
        ctx.save();
        ctx.globalAlpha = a * 0.8;
        ctx.fillStyle = `hsl(${p.hue},100%,65%)`;
        ctx.shadowColor = `hsl(${p.hue},100%,65%)`;
        ctx.shadowBlur = 7;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      for (let i = 0; i < 3; i++) {
        const ph = (t * 0.2 + i / 3) % 1;
        ctx.save();
        ctx.globalAlpha = (1 - ph) * 0.04;
        ctx.strokeStyle = "#00cfff";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(W * 0.5, H * 0.5, ph * Math.min(W, H) * 0.55, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(rafRef.current);
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

/* ─── Field ──────────────────────────────────────────────────── */
function Field({ label, required, hint, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "4px",
        }}
      >
        <label
          style={{
            fontSize: "13px",
            letterSpacing: "2.5px",
            textTransform: "uppercase",
            color: "rgba(0, 208, 255, 0.87)",
            fontFamily: "'Courier New', monospace",
          }}
        >
          {label}
          {required && (
            <span style={{ color: "#00cfff", marginLeft: 3 }}>*</span>
          )}
        </label>
        {hint && (
          <span
            style={{ fontSize: "11px", color: "rgba(240, 243, 245, 0.62)" }}
          >
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

/* ─── Card ───────────────────────────────────────────────────── */
function Card({ icon, title, children, bgImage }) {
  return (
    <div
      style={{
        background: "rgba(4,18,48,0.82)",
        border: "1px solid rgba(0,180,255,0.18)",
        borderRadius: "12px",
        overflow: "hidden",
        backdropFilter: "blur(20px)",
        boxShadow: "0 0 40px rgba(0,100,200,0.08)",
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
          background:
            "linear-gradient(90deg,transparent,rgba(0,207,255,0.5),transparent)",
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
        <span style={{ fontSize: "17px" }}>{icon}</span>
        <span
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: "11px",
            letterSpacing: "2.5px",
            color: "rgba(232, 235, 236, 0.92)",
            textTransform: "uppercase",
          }}
        >
          {title}
        </span>
      </div>
      <div
        className="card-body"
        style={{
          padding: "22px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          backgroundImage: bgImage || "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "white",
        }}
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
            borderColor: "rgba(0,207,255,0.2)",
            ...s,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Steps ──────────────────────────────────────────────────── */
function Steps({ current }) {
  const labels = ["Personal Info", "Emergency Contacts", "Address"];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        gap: 0,
        marginBottom: "36px",
        overflowX: "auto",
        paddingBottom: "4px",
      }}
    >
      {labels.map((l, i) => (
        <div
          key={i}
          style={{ display: "flex", alignItems: "flex-start", flexShrink: 0 }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <div
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                border: `1.5px solid ${i <= current ? "#00cfff" : "rgba(0, 179, 255, 0.74)"}`,
                background:
                  i < current
                    ? "#00cfff"
                    : i === current
                      ? "rgba(0,207,255,0.12)"
                      : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow:
                  i <= current ? "0 0 14px rgba(0,207,255,0.35)" : "none",
                transition: "all .3s",
                flexShrink: 0,
              }}
            >
              {i < current ? (
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <polyline
                    points="2,6.5 5,10 11,3"
                    stroke="#060d1a"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <span
                  style={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: "10px",
                    color: i === current ? "#00cfff" : "rgba(0, 179, 255, 0.6)",
                    fontWeight: 700,
                  }}
                >
                  {i + 1}
                </span>
              )}
            </div>
            <span
              className="step-label"
              style={{
                color:
                  i <= current
                    ? "rgba(0,207,255,0.7)"
                    : "rgba(0, 179, 255, 0.63)",
              }}
            >
              {l}
            </span>
          </div>
          {i < labels.length - 1 && (
            <div
              className="step-line"
              style={{
                background: i < current ? "#00cfff" : "rgba(0,180,255,0.15)",
                boxShadow: i < current ? "0 0 6px rgba(0,207,255,0.4)" : "none",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── NavBtn ─────────────────────────────────────────────────── */
function NavBtn({ onBack, onNext, nextLabel, nextDisabled }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        marginTop: "24px",
        flexWrap: "wrap",
      }}
    >
      {onBack && (
        <button
          onClick={onBack}
          style={{
            padding: "13px 20px",
            background: "transparent",
            border: "1px solid rgba(0,180,255,0.3)",
            borderRadius: "6px",
            color: "rgba(0,207,255,0.55)",
            fontSize: "12px",
            letterSpacing: "2px",
            fontFamily: "'Courier New', monospace",
            cursor: "pointer",
            transition: "all .2s",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(0,207,255,0.6)";
            e.currentTarget.style.color = "#7de8ff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(0,180,255,0.3)";
            e.currentTarget.style.color = "rgba(0,207,255,0.55)";
          }}
        >
          ← BACK
        </button>
      )}
      <button
        onClick={onNext}
        disabled={nextDisabled}
        style={{
          flex: 1,
          minWidth: "160px",
          padding: "14px",
          background: nextDisabled
            ? "rgba(0,180,255,0.06)"
            : "linear-gradient(90deg,rgba(0,100,200,0.5),rgba(0,207,255,0.4))",
          border: `1px solid ${nextDisabled ? "rgba(0,180,255,0.15)" : "rgba(0,207,255,0.55)"}`,
          borderRadius: "6px",
          color: nextDisabled ? "rgba(128, 184, 208, 0.59)" : "#7de8ff",
          fontSize: "12px",
          letterSpacing: "2.5px",
          fontFamily: "'Courier New', monospace",
          fontWeight: 700,
          cursor: nextDisabled ? "not-allowed" : "pointer",
          boxShadow: nextDisabled ? "none" : "0 0 24px rgba(0,207,255,0.18)",
          transition: "all .25s",
        }}
      >
        {nextLabel || "NEXT →"}
      </button>
    </div>
  );
}

/* ─── ContactCard ────────────────────────────────────────────── */
function ContactCard({ idx, contact, onChange, onRemove, canRemove }) {
  const [open, setOpen] = useState(true);
  const accent =
    idx === 0
      ? "#00cfff"
      : idx === 1
        ? "#7de8ff"
        : idx === 2
          ? "#5bc8ff"
          : "rgba(0,207,255,0.6)";

  return (
    <div
      style={{
        background: "rgba(4,18,48,0.82)",
        border: `1px solid ${open ? "rgba(0,180,255,0.3)" : "rgba(0,180,255,0.12)"}`,
        borderRadius: "10px",
        overflow: "hidden",
        backdropFilter: "blur(16px)",
        animation: "slideIn .3s ease both",
        transition: "border-color .25s",
      }}
    >
      {/* Header */}
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "13px 14px",
          cursor: "pointer",
          borderBottom: open ? "1px solid rgba(0,180,255,0.1)" : "none",
          background: open ? "rgba(0,207,255,0.03)" : "transparent",
          userSelect: "none",
          gap: "8px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              border: `1.5px solid ${accent}`,
              background: "rgba(0,207,255,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Courier New', monospace",
              fontSize: "12px",
              color: accent,
              fontWeight: 700,
              flexShrink: 0,
              boxShadow: `0 0 10px rgba(0,207,255,0.2)`,
            }}
          >
            {contact.name ? contact.name[0].toUpperCase() : idx + 1}
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: "'Courier New', monospace",
                fontSize: "10px",
                letterSpacing: "2px",
                color: accent,
                whiteSpace: "nowrap",
              }}
            >
              CONTACT {idx + 1}
              {idx < 3 && (
                <span
                  style={{
                    color: "rgba(0,207,255,0.35)",
                    marginLeft: 6,
                    fontSize: "9px",
                  }}
                >
                  REQUIRED
                </span>
              )}
            </div>
            {contact.name && (
              <div
                style={{
                  fontSize: "13px",
                  color: "rgba(168,240,255,0.65)",
                  marginTop: "2px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {contact.name}
                {contact.relation && ` · ${contact.relation}`}
              </div>
            )}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexShrink: 0,
          }}
        >
          {canRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              style={{
                background: "rgba(0,100,200,0.1)",
                border: "1px solid rgba(0,150,220,0.3)",
                borderRadius: "5px",
                color: "rgba(0,207,255,0.6)",
                fontSize: "11px",
                padding: "3px 8px",
                cursor: "pointer",
                fontFamily: "'Courier New', monospace",
                letterSpacing: "1px",
                transition: "all .2s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(0,100,200,0.2)";
                e.currentTarget.style.color = "#00cfff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(0,100,200,0.1)";
                e.currentTarget.style.color = "rgba(0,207,255,0.6)";
              }}
            >
              ✕
            </button>
          )}
          <span
            style={{
              color: "rgba(0,180,255,0.4)",
              fontSize: "14px",
              display: "inline-block",
              transition: "transform .2s",
              transform: open ? "rotate(180deg)" : "rotate(0)",
              flexShrink: 0,
            }}
          >
            ▾
          </span>
        </div>
      </div>

      {/* Body */}
      {open && (
        <div
          className="contact-body"
          style={{
            padding: "18px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            backgroundImage: `linear-gradient(rgba(45, 36, 36, 0.5), rgba(35, 35, 125, 0.5)), url("https://www.shutterstock.com/image-vector/contact-us-customer-support-hotline-600nw-2407847227.jpg")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="grid-2-contact">
            <Field label="Full Name" required>
              <input
                type="text"
                placeholder="Jane Doe"
                value={contact.name}
                onChange={(e) => onChange({ ...contact, name: e.target.value })}
              />
            </Field>
            <Field label="Relation">
              <select
                value={contact.relation}
                onChange={(e) =>
                  onChange({ ...contact, relation: e.target.value })
                }
              >
                <option value="">Select</option>
                {[
                  "Mother",
                  "Father",
                  "Sister",
                  "Brother",
                  "Husband",
                  "Partner",
                  "Friend",
                  "Colleague",
                  "Neighbour",
                  "Other",
                ].map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid-2-contact">
            <Field label="Phone Number" required>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={contact.phone}
                onChange={(e) =>
                  onChange({ ...contact, phone: e.target.value })
                }
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                placeholder="jane@email.com"
                value={contact.email}
                onChange={(e) =>
                  onChange({ ...contact, email: e.target.value })
                }
              />
            </Field>
          </div>
          {/* Priority */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: "9px",
                letterSpacing: "2px",
                color: "rgba(0,207,255,0.4)",
                fontFamily: "'Courier New', monospace",
                textTransform: "uppercase",
              }}
            >
              Alert Priority
            </span>
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                onClick={() => onChange({ ...contact, priority: p })}
                style={{
                  width: "28px",
                  height: "22px",
                  borderRadius: "4px",
                  border: `1px solid ${(contact.priority || 1) >= p ? "rgba(0,207,255,0.6)" : "rgba(0,180,255,0.18)"}`,
                  background:
                    (contact.priority || 1) >= p
                      ? "rgba(0,207,255,0.12)"
                      : "transparent",
                  color:
                    (contact.priority || 1) >= p
                      ? "#00cfff"
                      : "rgba(0,180,255,0.25)",
                  fontSize: "11px",
                  cursor: "pointer",
                  fontFamily: "'Courier New', monospace",
                  transition: "all .15s",
                }}
              >
                {p}
              </button>
            ))}
            <span style={{ fontSize: "11px", color: "rgba(0,180,255,0.4)" }}>
              {["High", "Medium", "Low"][(contact.priority || 1) - 1]}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function PersonalDetailsPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [isProfileExists, setIsProfileExists] = useState(false);
  const [saved, setSaved] = useState(false);

  const [personal, setPersonal] = useState({
    firstName: "",
    lastName: "",
    age: "",
    dob: "",
    phone: "",
    bloodGroup: "",
    medicalNotes: "",
  });

  const empty = () => ({
    name: "",
    phone: "",
    email: "",
    relation: "",
    priority: 1,
  });
  const [contacts, setContacts] = useState([empty(), empty(), empty()]);

  const [address, setAddress] = useState({
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    radius: "500",
  });

  const updateContact = (i, v) =>
    setContacts((c) => c.map((x, idx) => (idx === i ? v : x)));
  const addContact = () => {
    if (contacts.length < 5) setContacts((c) => [...c, empty()]);
  };
  const removeContact = (i) => {
    if (contacts.length > 3)
      setContacts((c) => c.filter((_, idx) => idx !== i));
  };

  const ok0 = personal.firstName && personal.age && personal.phone;
  const ok1 = contacts.slice(0, 3).every((c) => c.name && c.phone);
  const ok2 = address.line1 && address.city && address.pincode;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsProfileExists(false);
          return;
        }
        const res = await fetch(
          "https://shieldher-backend-1h8b.onrender.com/api/profile",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (res.ok) {
          const data = await res.json();
          setIsProfileExists(true);
          setPersonal({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            age: data.age || "",
            dob: data.dob ? data.dob.split("T")[0] : "",
            phone: data.phone || "",
            bloodGroup: data.bloodGroup || "",
            medicalNotes: data.medicalNote || "",
          });
          setContacts(
            data.emergencyContacts?.length >= 3
              ? data.emergencyContacts.map((c) => ({
                  name: c.name || "",
                  phone: c.phone || "",
                  email: c.email || "",
                  relation: c.relation || "",
                  priority: c.priority || 1,
                }))
              : [empty(), empty(), empty()],
          );
          setAddress({
            line1: data.address?.line1 || "",
            line2: data.address?.line2 || "",
            city: data.address?.city || "",
            state: data.address?.state || "",
            pincode: data.address?.pincode || "",
            country: "India",
            radius: String(data.safeZoneRadius || "500"),
          });
        } else {
          setIsProfileExists(false);
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setIsProfileExists(false);
      }
    };
    fetchProfile();
  }, []);

  const save = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("No token found. Please login again.");
      const emergencyContacts = (contacts || [])
        .map((c) => ({
          name: (c.name || "").trim(),
          relation: (c.relation || "").trim(),
          phone: String(c.phone || "")
            .replace(/\D/g, "")
            .slice(-10),
          email: (c.email || "").trim(),
          priority: c.priority || 1,
        }))
        .filter((c) => c.name && c.phone.length === 10);

      if (emergencyContacts.length < 3 || emergencyContacts.length > 5) {
        alert(
          `3 to 5 valid emergency contacts required (found ${emergencyContacts.length}). Make sure each contact has a name and 10-digit phone number.`,
        );
        return;
      }

      const profileData = { personal, contacts: emergencyContacts, address };
      const res = await fetch(
        "https://shieldher-backend-1h8b.onrender.com/api/profile",
        {
          method: isProfileExists ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(profileData),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        console.error("Backend Error:", data);
        alert(data.msg || "Failed to save profile");
        return;
      }
      setSaved(true);
      setIsProfileExists(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  const pct = Math.round(((address.radius - 100) / 4900) * 100);

  return (
    <>
      <style>{G}</style>
      <div
        style={{
          position: "relative",
          minHeight: "100vh",
          background: "#060d1a",
        }}
      >
        <BlueBG />

        {/* Navbar */}
        <nav
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            height: "64px",
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(6,13,26,0.9)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(0,180,255,0.15)",
            gap: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexShrink: 0,
            }}
          >
            <div
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
              className="nav-logo-text"
              style={{
                fontFamily: "'Courier New', monospace",
                fontSize: "15px",
                fontWeight: 700,
                color: "#00cfff",
                letterSpacing: "3px",
              }}
            >
              SHIELDHER
            </span>
          </div>

          <span className="nav-title">PROFILE SETUP</span>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div
                style={{
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  background: "#00cfff",
                  boxShadow: "0 0 7px #00cfff",
                  animation: "blink 2s ease-in-out infinite",
                  flexShrink: 0,
                }}
              />
              <span
                className="nav-session-text"
                style={{
                  fontSize: "10px",
                  letterSpacing: "2px",
                  color: "rgba(162, 219, 232, 0.92)",
                  fontFamily: "'Courier New', monospace",
                }}
              >
                SECURE SESSION
              </span>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/");
              }}
              title="Logout"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "6px 10px",
                background: "rgba(0,207,255,0.06)",
                border: "1px solid rgba(0,180,255,0.25)",
                borderRadius: "6px",
                color: "rgba(0,207,255,0.65)",
                fontSize: "10px",
                letterSpacing: "1.5px",
                fontFamily: "'Courier New', monospace",
                cursor: "pointer",
                transition: "all .2s",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(0,207,255,0.12)";
                e.currentTarget.style.borderColor = "rgba(0,207,255,0.55)";
                e.currentTarget.style.color = "#7de8ff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(0,207,255,0.06)";
                e.currentTarget.style.borderColor = "rgba(0,180,255,0.25)";
                e.currentTarget.style.color = "rgba(0,207,255,0.65)";
              }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span className="nav-session-text">LOGOUT</span>
            </button>
          </div>
        </nav>

        {/* Content */}
        <main
          className="main-content"
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: "720px",
            margin: "0 auto",
            padding: "96px 20px 60px",
          }}
        >
          <div
            style={{
              textAlign: "center",
              marginBottom: "32px",
              animation: "fadeUp .55s ease both",
            }}
          >
            <h1
              style={{
                fontFamily: "'Courier New', monospace",
                fontSize: "clamp(1.2rem,4vw,2.2rem)",
                fontWeight: 700,
                letterSpacing: "4px",
                color: "#7de8ff",
                textShadow: "0 0 30px rgba(0,207,255,0.4)",
                animation: "glow 4s ease-in-out infinite",
                marginBottom: "8px",
              }}
            >
              PERSONAL DETAILS
            </h1>
            <div
              style={{
                height: "1px",
                marginTop: "18px",
                background:
                  "linear-gradient(90deg,transparent,rgba(0,207,255,0.3),transparent)",
              }}
            />
          </div>

          <Steps current={step} />

          {/* STEP 0: Personal Info */}
          {step === 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "18px",
                animation: "fadeUp .4s ease both",
              }}
            >
              <Card
                icon="📍"
                title="Personal Information"
                bgImage={`linear-gradient(rgba(15, 41, 90, 0.5), rgba(255,255,255,0.2)), url("https://static.vecteezy.com/system/resources/thumbnails/030/337/740/original/loop-animation-of-glossy-shield-with-dark-background-3d-rendering-free-video.jpg")`}
              >
                <div className="grid-2">
                  <Field label="First Name" required>
                    <input
                      type="text"
                      placeholder="Priya"
                      value={personal.firstName}
                      onChange={(e) =>
                        setPersonal((p) => ({
                          ...p,
                          firstName: e.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field label="Last Name">
                    <input
                      type="text"
                      placeholder="Sharma"
                      value={personal.lastName}
                      onChange={(e) =>
                        setPersonal((p) => ({ ...p, lastName: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="Age" required hint="1 – 100">
                    <input
                      type="number"
                      placeholder="25"
                      min="1"
                      max="100"
                      value={personal.age}
                      onChange={(e) =>
                        setPersonal((p) => ({ ...p, age: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="Date of Birth">
                    <input
                      type="date"
                      value={personal.dob}
                      onChange={(e) =>
                        setPersonal((p) => ({ ...p, dob: e.target.value }))
                      }
                      style={{ colorScheme: "dark" }}
                    />
                  </Field>
                  <Field label="Your Phone" required>
                    <input
                      type="tel"
                      placeholder="+91 99999 00000"
                      value={personal.phone}
                      onChange={(e) =>
                        setPersonal((p) => ({ ...p, phone: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="Blood Group">
                    <select
                      value={personal.bloodGroup}
                      onChange={(e) =>
                        setPersonal((p) => ({
                          ...p,
                          bloodGroup: e.target.value,
                        }))
                      }
                    >
                      <option value="">Select</option>
                      {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(
                        (g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ),
                      )}
                    </select>
                  </Field>
                </div>
                <Field label="Medical Notes" hint="Optional">
                  <textarea
                    rows={3}
                    placeholder="Allergies, conditions, or important health info..."
                    value={personal.medicalNotes}
                    onChange={(e) =>
                      setPersonal((p) => ({
                        ...p,
                        medicalNotes: e.target.value,
                      }))
                    }
                    style={{ resize: "vertical", minHeight: "76px" }}
                  />
                </Field>
              </Card>
              <NavBtn
                onNext={() => setStep(1)}
                nextDisabled={!ok0}
                nextLabel="NEXT: CONTACTS →"
              />
            </div>
          )}

          {/* STEP 1: Emergency Contacts */}
          {step === 1 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                animation: "fadeUp .4s ease both",
              }}
            >
              <div
                style={{
                  background: "rgba(0,207,255,0.05)",
                  border: "1px solid rgba(0,180,255,0.2)",
                  borderRadius: "8px",
                  padding: "13px 14px",
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                }}
              >
                <span style={{ fontSize: "18px", flexShrink: 0 }}>🛡</span>
                <p
                  style={{
                    fontSize: "13px",
                    color: "rgba(168,240,255,0.55)",
                    lineHeight: 1.65,
                    fontFamily: "'Courier New', monospace",
                  }}
                >
                  Add <strong style={{ color: "#7de8ff" }}>minimum 3</strong>,
                  up to <strong style={{ color: "#7de8ff" }}>5 contacts</strong>
                  . They get an instant call + SMS with your live GPS when
                  ShieldHer activates.
                </p>
              </div>

              {contacts.map((c, i) => (
                <ContactCard
                  key={i}
                  idx={i}
                  contact={c}
                  onChange={(v) => updateContact(i, v)}
                  onRemove={() => removeContact(i)}
                  canRemove={contacts.length > 3 && i >= 3}
                />
              ))}

              {contacts.length < 5 && (
                <button
                  onClick={addContact}
                  style={{
                    width: "100%",
                    padding: "13px",
                    background: "transparent",
                    border: "1px dashed rgba(0,180,255,0.28)",
                    borderRadius: "10px",
                    cursor: "pointer",
                    color: "rgba(0,207,255,0.5)",
                    fontSize: "11px",
                    letterSpacing: "2px",
                    fontFamily: "'Courier New', monospace",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "all .22s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(0,207,255,0.55)";
                    e.currentTarget.style.background = "rgba(0,207,255,0.05)";
                    e.currentTarget.style.color = "#00cfff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(0,180,255,0.28)";
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "rgba(0,207,255,0.5)";
                  }}
                >
                  <span style={{ fontSize: "16px" }}>+</span> ADD CONTACT{" "}
                  {contacts.length + 1} OF 5
                </button>
              )}

              <div style={{ textAlign: "center" }}>
                <span
                  style={{
                    fontSize: "10px",
                    letterSpacing: "2px",
                    color:
                      contacts.length >= 3
                        ? "rgba(0,207,255,0.65)"
                        : "rgba(0,180,255,0.35)",
                    fontFamily: "'Courier New', monospace",
                  }}
                >
                  {contacts.length}/5 CONTACTS
                  {contacts.length >= 3
                    ? " · ✓ MINIMUM MET"
                    : ` · ${3 - contacts.length} MORE REQUIRED`}
                </span>
              </div>

              <NavBtn
                onBack={() => setStep(0)}
                onNext={() => setStep(2)}
                nextDisabled={!ok1}
                nextLabel="NEXT: ADDRESS →"
              />
            </div>
          )}

          {/* STEP 2: Address */}
          {step === 2 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "18px",
                animation: "fadeUp .4s ease both",
              }}
            >
              <Card
                icon="🏠"
                title="Home Address"
                bgImage={`linear-gradient(rgba(41, 43, 48, 0.7), rgba(0, 0, 0, 0.85)), url("https://i.pinimg.com/1200x/10/53/4f/10534f48c2e1e0169ef2218f51e73222.jpg")`}
              >
                <Field label="Address Line 1" required>
                  <input
                    type="text"
                    placeholder="Flat / House No, Building, Street"
                    value={address.line1}
                    onChange={(e) =>
                      setAddress((a) => ({ ...a, line1: e.target.value }))
                    }
                  />
                </Field>
                <Field label="Address Line 2">
                  <input
                    type="text"
                    placeholder="Landmark, Area"
                    value={address.line2}
                    onChange={(e) =>
                      setAddress((a) => ({ ...a, line2: e.target.value }))
                    }
                  />
                </Field>
                <div className="grid-addr">
                  <Field label="City" required>
                    <input
                      type="text"
                      placeholder="Mumbai"
                      value={address.city}
                      onChange={(e) =>
                        setAddress((a) => ({ ...a, city: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="State">
                    <input
                      type="text"
                      placeholder="Maharashtra"
                      value={address.state}
                      onChange={(e) =>
                        setAddress((a) => ({ ...a, state: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="PIN Code" required>
                    <input
                      type="text"
                      placeholder="400001"
                      maxLength={6}
                      value={address.pincode}
                      onChange={(e) =>
                        setAddress((a) => ({ ...a, pincode: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="Country">
                    <select
                      value={address.country}
                      onChange={(e) =>
                        setAddress((a) => ({ ...a, country: e.target.value }))
                      }
                    >
                      {[
                        "India",
                        "United States",
                        "United Kingdom",
                        "Australia",
                        "Canada",
                        "Other",
                      ].map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </Card>

              <Card
                icon="📍"
                title="Safe Zone Radius"
                bgImage={`linear-gradient(rgba(0, 20, 60, 0.61), rgba(0, 0, 0, 0.69)), url("https://static.vecteezy.com/system/resources/previews/046/860/156/non_2x/map-with-red-pin-marked-free-photo.jpeg")`}
              >
                <p
                  style={{
                    fontSize: "13px",
                    color: "rgba(191, 197, 200, 0.87)",
                    lineHeight: 1.65,
                    fontFamily: "'Courier New', monospace",
                  }}
                >
                  ShieldHer alerts when you leave this radius from home without
                  enabling Travel Mode.
                </p>
                <Field
                  label="Radius"
                  hint={`${Number(address.radius).toLocaleString()} m`}
                >
                  <input
                    type="range"
                    min="100"
                    max="5000"
                    step="100"
                    value={address.radius}
                    onChange={(e) =>
                      setAddress((a) => ({ ...a, radius: e.target.value }))
                    }
                    style={{
                      accentColor: "#00cfff",
                      background: `linear-gradient(90deg,#00cfff ${pct}%,rgba(0,180,255,0.15) ${pct}%)`,
                    }}
                  />
                </Field>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  {["100 m", "1 km", "2.5 km", "5 km"].map((l) => (
                    <span
                      key={l}
                      style={{
                        fontSize: "10px",
                        color: "rgba(0,180,255,0.3)",
                        fontFamily: "'Courier New', monospace",
                      }}
                    >
                      {l}
                    </span>
                  ))}
                </div>
              </Card>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                {saved && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      background: "rgba(0,200,100,0.08)",
                      border: "1px solid rgba(0,200,100,0.28)",
                      borderRadius: "8px",
                      padding: "12px 18px",
                      animation: "fadeUp .3s ease both",
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                      <polyline
                        points="2,7.5 5.5,11 13,3.5"
                        stroke="#00c864"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span
                      style={{
                        color: "#00c864",
                        fontFamily: "'Courier New', monospace",
                        fontSize: "10px",
                        letterSpacing: "2px",
                      }}
                    >
                      PROFILE SAVED SECURELY
                    </span>
                  </div>
                )}
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <button
                    onClick={() => setStep(1)}
                    style={{
                      padding: "13px 20px",
                      flexShrink: 0,
                      background: "transparent",
                      border: "1px solid rgba(0,180,255,0.3)",
                      borderRadius: "6px",
                      color: "rgba(0,207,255,0.55)",
                      fontSize: "11px",
                      letterSpacing: "2px",
                      fontFamily: "'Courier New', monospace",
                      cursor: "pointer",
                      transition: "all .2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "rgba(0,207,255,0.6)";
                      e.currentTarget.style.color = "#7de8ff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "rgba(0,180,255,0.3)";
                      e.currentTarget.style.color = "rgba(0,207,255,0.55)";
                    }}
                  >
                    ← BACK
                  </button>
                  <button
                    onClick={save}
                    disabled={!ok2}
                    style={{
                      flex: 1,
                      minWidth: "180px",
                      padding: "15px",
                      background: ok2
                        ? "linear-gradient(90deg,rgba(0,100,200,0.55),rgba(0,207,255,0.45))"
                        : "rgba(0,180,255,0.06)",
                      border: `1px solid ${ok2 ? "rgba(0,207,255,0.6)" : "rgba(0,180,255,0.15)"}`,
                      borderRadius: "6px",
                      color: ok2 ? "#7de8ff" : "rgba(0,180,255,0.3)",
                      fontSize: "12px",
                      letterSpacing: "2.5px",
                      fontFamily: "'Courier New', monospace",
                      fontWeight: 700,
                      cursor: ok2 ? "pointer" : "not-allowed",
                      boxShadow: ok2 ? "0 0 28px rgba(0,207,255,0.2)" : "none",
                      animation: ok2
                        ? "pulseRing 2.5s ease-in-out infinite"
                        : "none",
                      transition: "all .3s",
                    }}
                  >
                    🛡 SAVE & ACTIVATE SHIELD
                  </button>
                </div>
                <p
                  style={{
                    textAlign: "center",
                    fontSize: "10px",
                    color: "rgba(0,180,255,0.28)",
                    letterSpacing: "1px",
                    fontFamily: "'Courier New', monospace",
                  }}
                >
                  🔒 AES-256 ENCRYPTED · NEVER SHARED WITH THIRD PARTIES
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
