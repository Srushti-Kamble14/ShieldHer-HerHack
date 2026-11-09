import React from 'react'
import { useState, useEffect, useRef } from "react";

/* ─── CSS ────────────────────────────────────────────────────── */
const G = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Rajdhani:wght@400;500;600;700&display=swap');
  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
  body { background:#060d1a; color:#a8f0ff; font-family:'Rajdhani',sans-serif; min-height:100vh; overflow-x:hidden; }
 ::-webkit-scrollbar { width:6px; }

::-webkit-scrollbar-track {
  background: #0a0a0a;   /* dark track */
}

::-webkit-scrollbar-thumb {
  background: #000;      /* black thumb */
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #222;      /* slight hover effect */
}

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

      // Deep dark background
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

      // Blue ambient glow blobs
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

      // Subtle grid
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

      // Particles
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

      // Pulse rings
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
export const Home = () => {
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
        
        {/* Animation ONLY here */}
        <BlueBG />

        {/* Your Home Content */}
        <h1 style={{ color: "white", textAlign: "center", paddingTop: "100px" }}>
          Home Page
        </h1>
      </div>
    </>
  );
};