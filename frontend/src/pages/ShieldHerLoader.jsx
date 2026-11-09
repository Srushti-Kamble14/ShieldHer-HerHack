import { useEffect, useRef, useState } from "react";
import AuthPages from "./AuthPages";
// ─── Easing ───────────────────────────────────────────────────
const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);
const easeOutBack = (x) => {
  const c1 = 1.70158,
    c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const norm = (s, e, t) => clamp((t - s) / (e - s), 0, 1);

function glowStroke(ctx, color, blur, lw, sc, fn) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lw * sc;
  ctx.shadowColor = color;
  ctx.shadowBlur = blur * sc;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  fn();
  ctx.restore();
}
function glowFill(ctx, color, blur, sc, fn) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = blur * sc;
  fn();
  ctx.restore();
}

function drawShield(ctx, alpha, tx, ty, sc, pulse, cx, cy) {
  ctx.save();
  ctx.translate(cx + tx, cy + ty);
  ctx.scale(sc, sc);
  ctx.globalAlpha = alpha;
  const R = 155 * sc;
  const grd = ctx.createLinearGradient(0, -R, 0, R);
  grd.addColorStop(0, "rgba(0,200,255,0.20)");
  grd.addColorStop(1, "rgba(0,80,180,0.32)");
  function shieldPath() {
    ctx.beginPath();
    ctx.moveTo(0, -R);
    ctx.bezierCurveTo(R * 0.85, -R * 0.5, R, R * 0.1, 0, R);
    ctx.bezierCurveTo(-R, R * 0.1, -R * 0.85, -R * 0.5, 0, -R);
    ctx.closePath();
  }
  ctx.save();
  ctx.shadowColor = "#00c8ff";
  ctx.shadowBlur = (30 + pulse * 22) * sc;
  shieldPath();
  ctx.fillStyle = grd;
  ctx.fill();
  ctx.restore();
  glowStroke(ctx, "#7de8ff", 18, 2.5, sc, () => {
    shieldPath();
    ctx.stroke();
  });
  ctx.save();
  ctx.scale(0.84, 0.84);
  glowStroke(ctx, "rgba(100,220,255,0.5)", 10, 1.2, sc, () => {
    shieldPath();
    ctx.stroke();
  });
  ctx.restore();
  ctx.save();
  ctx.translate(0, R * 0.05);
  glowStroke(ctx, "#a8f0ff", 12, 1.8, sc, () => {
    ctx.beginPath();
    ctx.moveTo(-16 * sc, -80 * sc);
    ctx.lineTo(-12 * sc, -30 * sc);
    ctx.lineTo(-20 * sc, 30 * sc);
    ctx.moveTo(16 * sc, -80 * sc);
    ctx.lineTo(12 * sc, -30 * sc);
    ctx.lineTo(20 * sc, 30 * sc);
    ctx.moveTo(-20 * sc, 30 * sc);
    ctx.quadraticCurveTo(-30 * sc, 80 * sc, -10 * sc, 100 * sc);
    ctx.moveTo(20 * sc, 30 * sc);
    ctx.quadraticCurveTo(30 * sc, 80 * sc, 10 * sc, 100 * sc);
    ctx.stroke();
  });
  glowStroke(ctx, "#a8f0ff", 10, 1.8, sc, () => {
    ctx.beginPath();
    ctx.arc(0, -95 * sc, 14 * sc, 0, Math.PI * 2);
    ctx.stroke();
  });
  glowStroke(ctx, "rgba(100,200,255,0.7)", 8, 1.2, sc, () => {
    ctx.beginPath();
    ctx.moveTo(10 * sc, -100 * sc);
    ctx.bezierCurveTo(40 * sc, -80 * sc, 50 * sc, -20 * sc, 30 * sc, 40 * sc);
    ctx.stroke();
  });
  glowStroke(ctx, "#c0f0ff", 16, 2, sc, () => {
    ctx.beginPath();
    ctx.moveTo(-8 * sc, -130 * sc);
    ctx.lineTo(-8 * sc, 110 * sc);
    ctx.stroke();
  });
  glowFill(ctx, "#ffffff", 20, sc, () => {
    ctx.beginPath();
    ctx.moveTo(-8 * sc, -130 * sc);
    ctx.lineTo(-2 * sc, -115 * sc);
    ctx.lineTo(-14 * sc, -115 * sc);
    ctx.closePath();
    ctx.fill();
  });
  ctx.restore();
  ctx.restore();
}

function drawFrame(ctx, alpha, tx, ty, sc, cx, cy) {
  ctx.save();
  ctx.translate(cx + tx, cy + ty);
  ctx.scale(sc, sc);
  ctx.globalAlpha = alpha;
  const S = 290 * sc,
    r = 36 * sc;
  function rRect(s) {
    ctx.beginPath();
    ctx.moveTo(-s + r, -s);
    ctx.lineTo(s - r, -s);
    ctx.arcTo(s, -s, s, -s + r, r);
    ctx.lineTo(s, s - r);
    ctx.arcTo(s, s, s - r, s, r);
    ctx.lineTo(-s + r, s);
    ctx.arcTo(-s, s, -s, s - r, r);
    ctx.lineTo(-s, -s + r);
    ctx.arcTo(-s, -s, -s + r, -s, r);
    ctx.closePath();
  }
  glowStroke(ctx, "#00cfff", 22, 3, sc, () => {
    rRect(S);
    ctx.stroke();
  });
  glowStroke(ctx, "rgba(0,200,255,0.4)", 10, 1.2, sc, () => {
    rRect(S * 0.92);
    ctx.stroke();
  });
  glowStroke(ctx, "rgba(100,230,255,0.6)", 8, 1, sc, () => {
    ctx.beginPath();
    ctx.moveTo(-S * 0.45, -S);
    ctx.lineTo(S * 0.45, -S);
    ctx.moveTo(-S * 0.45, S);
    ctx.lineTo(S * 0.45, S);
    ctx.stroke();
  });
  [
    [-S, -S],
    [S, -S],
    [S, S],
    [-S, S],
  ].forEach(([cx2, cy2]) => {
    const sign = [cx2 > 0 ? 1 : -1, cy2 > 0 ? 1 : -1];
    glowStroke(ctx, "#7de8ff", 12, 1.5, sc, () => {
      for (let i = 1; i <= 3; i++) {
        const off = i * 8 * sc;
        ctx.beginPath();
        ctx.moveTo(cx2 + sign[0] * off * 0.6, cy2 + sign[1] * (r + off));
        ctx.lineTo(cx2 + sign[0] * (r + off), cy2 + sign[1] * off * 0.6);
        ctx.stroke();
      }
    });
  });
  glowStroke(ctx, "rgba(0,200,255,0.5)", 6, 1, sc, () => {
    [-S * 0.3, -S * 0.6, S * 0.3, S * 0.6].forEach((x) => {
      ctx.beginPath();
      ctx.moveTo(x, -S - 10 * sc);
      ctx.lineTo(x, -S + 10 * sc);
      ctx.moveTo(x, S - 10 * sc);
      ctx.lineTo(x, S + 10 * sc);
      ctx.stroke();
    });
    [-S * 0.3, -S * 0.6, S * 0.3, S * 0.6].forEach((y) => {
      ctx.beginPath();
      ctx.moveTo(-S - 10 * sc, y);
      ctx.lineTo(-S + 10 * sc, y);
      ctx.moveTo(S - 10 * sc, y);
      ctx.lineTo(S + 10 * sc, y);
      ctx.stroke();
    });
  });
  ctx.restore();
}

function drawCompass(ctx, alpha, tx, ty, sc, rot, cx, cy) {
  ctx.save();
  ctx.translate(cx + tx, cy + ty);
  ctx.scale(sc, sc);
  ctx.rotate(rot);
  ctx.globalAlpha = alpha;
  const R1 = 295 * sc,
    R2 = 228 * sc;
  glowStroke(ctx, "#00cfff", 28, 4, sc, () => {
    ctx.beginPath();
    ctx.arc(0, 0, R1, 0, Math.PI * 2);
    ctx.stroke();
  });
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, R1, 0, Math.PI * 2);
  ctx.arc(0, 0, R2, 0, Math.PI * 2, true);
  ctx.fillStyle = "rgba(0,50,100,0.35)";
  ctx.fill();
  ctx.restore();
  glowStroke(ctx, "rgba(0,180,255,0.5)", 10, 1.5, sc, () => {
    ctx.beginPath();
    ctx.arc(0, 0, R2, 0, Math.PI * 2);
    ctx.stroke();
  });
  glowStroke(ctx, "rgba(0,180,255,0.3)", 6, 1, sc, () => {
    ctx.beginPath();
    ctx.arc(0, 0, (R1 + R2) / 2, 0, Math.PI * 2);
    ctx.stroke();
  });
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2;
    const isMaj = i % 9 === 0,
      isMed = i % 3 === 0;
    const inner = isMaj ? R2 + 8 * sc : isMed ? R2 + 5 * sc : R2 + 2 * sc;
    const outer = isMaj ? R1 - 8 * sc : isMed ? R1 - 12 * sc : R1 - 18 * sc;
    glowStroke(
      ctx,
      isMaj ? "rgba(100,230,255,0.9)" : "rgba(0,180,255,0.5)",
      isMaj ? 8 : 4,
      isMaj ? 2 : 0.8,
      sc,
      () => {
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * inner, Math.sin(a) * inner);
        ctx.lineTo(Math.cos(a) * outer, Math.sin(a) * outer);
        ctx.stroke();
      },
    );
  }
  [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].forEach((a) => {
    glowStroke(ctx, "#7de8ff", 14, 2, sc, () => {
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * R2, Math.sin(a) * R2);
      ctx.lineTo(Math.cos(a) * (R1 + 20 * sc), Math.sin(a) * (R1 + 20 * sc));
      ctx.stroke();
    });
  });
  ctx.restore();
}

function drawCircuit(ctx, alpha, tx, ty, sc, rot, cx, cy) {
  ctx.save();
  ctx.translate(cx + tx, cy + ty);
  ctx.scale(sc, sc);
  ctx.rotate(rot);
  ctx.globalAlpha = alpha;
  const R = 300 * sc;
  glowStroke(ctx, "rgba(0,180,255,0.6)", 14, 2, sc, () => {
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, Math.PI * 2);
    ctx.stroke();
  });
  for (let c = 0; c < 10; c++) {
    const base = (c / 10) * Math.PI * 2,
      span = ((Math.PI * 2) / 10) * 0.72;
    ctx.save();
    ctx.rotate(base);
    const arcR = R * 0.82;
    glowStroke(ctx, "rgba(0,200,255,0.7)", 10, 1.8, sc, () => {
      ctx.beginPath();
      ctx.arc(0, 0, arcR, -span / 2, span / 2);
      ctx.stroke();
    });
    glowStroke(ctx, "rgba(0,160,220,0.5)", 6, 1.2, sc, () => {
      ctx.beginPath();
      ctx.arc(0, 0, arcR * 0.88, -span * 0.5, span * 0.5);
      ctx.stroke();
    });
    for (let i = 0; i < 6; i++) {
      const frac = (i / 5) * span - span / 2;
      const x1 = Math.cos(frac) * arcR,
        y1 = Math.sin(frac) * arcR;
      const x2 = Math.cos(frac) * (arcR * 0.55),
        y2 = Math.sin(frac) * (arcR * 0.55);
      glowStroke(ctx, "rgba(0,200,255,0.55)", 5, 1, sc, () => {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(lerp(x1, x2, 0.5), y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });
      glowFill(ctx, "rgba(100,230,255,0.9)", 8, sc, () => {
        ctx.beginPath();
        ctx.arc(x2, y2, 3.5 * sc, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    ctx.restore();
  }
  ctx.restore();
}
function drawBranding(ctx, alpha, sc, cx, cy, t) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(cx, cy);
  ctx.textAlign = "center";
  ctx.font = `bold ${Math.round(42 * sc)}px 'Courier New', monospace`;

  const text = "SHIELDHER";

  const speed = 0.12; // typing speed

  const lettersToShow = Math.max(
    0,
    Math.floor((t - 5.2) / speed)
  );

  const visibleText = text.substring(0, lettersToShow);

  ctx.fillStyle = "rgba(200,240,255,0.95)";
  ctx.shadowColor = "#00cfff";
  ctx.shadowBlur = 28 * sc;

  ctx.fillText(visibleText, 0, 290 * sc);

  ctx.restore();
}
function drawBackground(ctx, W, H, cx, cy, sc, pulse) {
  const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.7);
  grd.addColorStop(0, "rgba(4,18,45,1)");
  grd.addColorStop(0.5, "rgba(3,13,35,1)");
  grd.addColorStop(1, "rgba(2,8,22,1)");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);

  const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 340 * sc);
  cg.addColorStop(0, `rgba(0,80,160,${0.12 + pulse * 0.06})`);
  cg.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = cg;
  ctx.fillRect(0, 0, W, H);
}

const TOTAL = 8.5;
const STATUSES = [
  [0, "INITIALIZING SYSTEMS"],
  [1.0, "LOADING CIRCUIT MATRIX"],
  [1.9, "CALIBRATING COMPASS"],
  [2.8, "DEPLOYING FRAME PROTOCOL"],
  [3.7, "ACTIVATING SHIELD CORE"],
  [4.5, "SYNCHRONIZING COMPONENTS"],
  [5.5, "SYSTEM ONLINE"],
];

// ── Main Export ───────────────────────────────────────────────
export default function ShieldHerLoader() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const tRef = useRef(0);
  const lastRef = useRef(null);
  const burstRef = useRef(false);
  const particlesRef = useRef([]);

  const [loadPct, setLoadPct] = useState(0);
  const [statusText, setStatusText] = useState("INITIALIZING SYSTEMS");
  const [fadeOut, setFadeOut] = useState(false); // loader fades out
  const [showLogin, setShowLogin] = useState(false); // login fades in
  const [hideLoader, setHideLoader] = useState(false); // fully remove loader

  function spawnBurst(sc) {
    for (let i = 0; i < 90; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = (60 + Math.random() * 220) * sc;
      particlesRef.current.push({
        x: 0,
        y: 0,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life: 1,
        size: (1.5 + Math.random() * 3) * sc,
        hue: 180 + Math.random() * 40,
      });
    }
  }

  useEffect(() => {

    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function render(now) {
    const W = canvas.width;
const H = canvas.height;
      const cx = W / 2,
        cy = H / 2;
     const baseScale = Math.min(W, H) / 900;
const sc = Math.max(baseScale, 0.6); 
      const dt = Math.min(now - (lastRef.current || now), 50) / 1000;
      lastRef.current = now;
      tRef.current += dt;
      const t = tRef.current;
      const pulse = (Math.sin(t * 3) + 1) / 2;

      setLoadPct(Math.round(clamp(t / TOTAL, 0, 1) * 100));
      for (let i = STATUSES.length - 1; i >= 0; i--) {
        if (t >= STATUSES[i][0]) {
          setStatusText(STATUSES[i][1]);
          break;
        }
      }

      drawBackground(ctx, W, H, cx, cy, sc, pulse);

      {
        const p0 = norm(0.2, 1.8, t),
          ep = easeOutBack(p0);
        drawCircuit(
          ctx,
          clamp(p0 * 2, 0, 1),
          lerp(700 * sc, 0, ep),
          lerp(700 * sc, 0, ep),
          sc,
          lerp(0.8, 0, easeOutCubic(p0)),
          cx,
          cy,
        );
      }
      {
        const p0 = norm(1.0, 2.6, t),
          ep = easeOutBack(p0);
        drawCompass(
          ctx,
          clamp(p0 * 2, 0, 1),
          lerp(-700 * sc, 0, ep),
          lerp(700 * sc, 0, ep),
          sc,
          lerp(-0.8, 0, easeOutCubic(p0)),
          cx,
          cy,
        );
      }
      {
        const p0 = norm(1.9, 3.5, t),
          ep = easeOutBack(p0);
        drawFrame(
          ctx,
          clamp(p0 * 2, 0, 1),
          lerp(700 * sc, 0, ep),
          lerp(-700 * sc, 0, ep),
          sc,
          cx,
          cy,
        );
      }
      {
        const p0 = norm(2.8, 4.4, t),
          ep = easeOutBack(p0);
        drawShield(
          ctx,
          clamp(p0 * 2, 0, 1),
          lerp(-700 * sc, 0, ep),
          lerp(-700 * sc, 0, ep),
          sc,
          pulse,
          cx,
          cy,
        );
      }

      if (t >= 4.5 && !burstRef.current) {
        burstRef.current = true;
        spawnBurst(sc);
      }
      if (t >= 4.5) {
        const lp = easeOutCubic(norm(4.5, 5.2, t));
        drawCircuit(ctx, lp, 0, 0, sc, 0, cx, cy);
        drawCompass(ctx, lp, 0, 0, sc, 0, cx, cy);
        drawFrame(ctx, lp, 0, 0, sc, cx, cy);
        drawShield(ctx, lp, 0, 0, sc, pulse, cx, cy);
      }
      if (t > 5.5) drawCompass(ctx, 0.1, 0, 0, sc, (t - 5.5) * 0.06, cx, cy);

      const pArr = particlesRef.current;
      pArr.forEach((p) => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.life -= dt * 1.2;
      });
      particlesRef.current = pArr.filter((p) => p.life > 0);
      ctx.save();
      ctx.translate(cx, cy);
      pArr.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.life * 0.85;
        ctx.fillStyle = `hsl(${p.hue},100%,70%)`;
        ctx.shadowColor = `hsl(${p.hue},100%,80%)`;
        ctx.shadowBlur = 8 * sc;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      ctx.restore();

    drawBranding(ctx, easeOutCubic(norm(5.2,6.2,t)), sc, cx, cy, t);

      if (t >= TOTAL) {
        setFadeOut(true); // start loader fade-out
        setTimeout(() => {
          setShowLogin(true);
        }, 400); // login starts fading in at 400ms
        setTimeout(() => {
          setHideLoader(true);
        }, 1200); // fully unmount loader at 1.2s
        return;
      }
      rafRef.current = requestAnimationFrame(render);
    }

    rafRef.current = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      {/* Login always mounted underneath, fades in when showLogin=true
      <LoginPage visible={showLogin} /> */}
      {showLogin && <AuthPages />}

      {/* Loader sits on top, fades out, then unmounts */}
      {!hideLoader && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#060d1a",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Courier New', monospace",
            overflow: "hidden",
            opacity: fadeOut ? 0 : 1,
            transition: "opacity 0.9s ease",
            zIndex: 9999,
          }}
        >
          <canvas ref={canvasRef} style={{ position: "absolute", inset: 0 }} />

          {/* Top label */}
          <div
            style={{
              position: "absolute",
             top: "4vh",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 10,
              pointerEvents: "none",
              opacity: loadPct > 5 ? 1 : 0,
              transition: "opacity 1s",
            fontSize: "clamp(9px, 2.5vw, 11px)",
letterSpacing: "clamp(2px, 1vw, 4px)",
              color: "rgba(125,232,255,0.55)",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            SHIELDHER · SYSTEM INITIALIZING
          </div>

          {/* Bottom HUD */}
          <div
            style={{
              position: "absolute",
             bottom: "6vh",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 10,
              pointerEvents: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
              width: "90vw",
maxWidth: "340px",
padding: "0 12px",
            }}
          >
            <div style={{ width: "100%", position: "relative" }}>
              <div
                style={{
                  height: "2px",
                  background: "rgba(0,180,255,0.15)",
                  borderRadius: "2px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${loadPct}%`,
                    background:
                      "linear-gradient(90deg,#0060c0,#00cfff,#7de8ff)",
                    boxShadow: "0 0 12px #00cfff, 0 0 28px rgba(0,207,255,0.4)",
                    borderRadius: "2px",
                    transition: "width 0.15s linear",
                  }}
                />
              </div>
              {[
                [-1, -1],
                [1, -1],
                [1, 1],
                [-1, 1],
              ].map(([sx, sy], i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    width: "6px",
                    height: "6px",
                    borderTop:
                      sy < 0 ? "1px solid rgba(0,207,255,0.6)" : "none",
                    borderBottom:
                      sy > 0 ? "1px solid rgba(0,207,255,0.6)" : "none",
                    borderLeft:
                      sx < 0 ? "1px solid rgba(0,207,255,0.6)" : "none",
                    borderRight:
                      sx > 0 ? "1px solid rgba(0,207,255,0.6)" : "none",
                    top: sy < 0 ? "-4px" : "calc(100% - 2px)",
                    left: sx < 0 ? "-4px" : "calc(100% - 2px)",
                  }}
                />
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span
                style={{
                  display: "inline-block",
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#00cfff",
                  boxShadow: "0 0 8px #00cfff",
                  animation: "pulse-dot 1.2s ease-in-out infinite",
                }}
              />
              <span
                style={{
                 fontSize: "clamp(10px, 2.8vw, 12px)",
                  letterSpacing: "2.5px",
                  color: "rgba(100,220,255,0.75)",
                  textTransform: "uppercase",
                }}
              >
                {statusText}
              </span>
              <span
                style={{
                  fontSize: "clamp(10px, 2.8vw, 12px)",
                  letterSpacing: "1px",
                  color: "rgba(0,207,255,0.45)",
                }}
              >
                {loadPct}%
              </span>
            </div>
          </div>

          {/* Corner HUD marks */}
          {[
            {
              top: 16,
              left: 16,
              borderTop: "1px solid",
              borderLeft: "1px solid",
            },
            {
              top: 16,
              right: 16,
              borderTop: "1px solid",
              borderRight: "1px solid",
            },
            {
              bottom: 16,
              left: 16,
              borderBottom: "1px solid",
              borderLeft: "1px solid",
            },
            {
              bottom: 16,
              right: 16,
              borderBottom: "1px solid",
              borderRight: "1px solid",
            },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: "22px",
                height: "22px",
                borderColor: "rgba(0,180,255,0.3)",
                ...s,
                zIndex: 10,
                pointerEvents: "none",
              }}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes pulse-dot {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.3; transform:scale(0.6); }
        }
        * { box-sizing:border-box; }
        body { margin:0; }
      `}</style>
    </>
  );
}
