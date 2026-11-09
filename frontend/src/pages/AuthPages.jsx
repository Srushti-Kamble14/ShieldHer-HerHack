// import { useState, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// // ── Mock API (replace with your real imports) ─────────────────
// import { loginUser } from "../api/serverApi";
// import { registerUser } from "../api/serverApi";
// import sign from "../assets/sign.png";
// import log from "../assets/log.webp";
// import { BASE_URL } from "../api/config";

// // ── Animated Background Canvas ────────────────────────────────
// function AnimatedBackground({ mode }) {
//   const canvasRef = useRef(null);
//   const rafRef = useRef(null);
//   const tRef = useRef(0);
//   const lastRef = useRef(null);
//   const particlesRef = useRef([]);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");

//     function resize() {
//       canvas.width = window.innerWidth;
//       canvas.height = window.innerHeight;
//       initParticles();
//     }

//     function initParticles() {
//       particlesRef.current = Array.from({ length: 60 }, () => ({
//         x: Math.random() * canvas.width,
//         y: Math.random() * canvas.height,
//         r: 1 + Math.random() * 2.5,
//         vx: (Math.random() - 0.5) * 0.4,
//         vy: -0.3 - Math.random() * 0.5,
//         alpha: 0.2 + Math.random() * 0.6,
//         pulse: Math.random() * Math.PI * 2,
//       }));
//     }

//     resize();
//     window.addEventListener("resize", resize);

//     function drawOrbit(ctx, cx, cy, r, t, alpha) {
//       ctx.save();
//       ctx.globalAlpha = alpha;
//       ctx.strokeStyle = "#00cfff";
//       ctx.shadowColor = "#00cfff";
//       ctx.shadowBlur = 8;
//       ctx.lineWidth = 0.6;
//       ctx.beginPath();
//       ctx.arc(cx, cy, r, 0, Math.PI * 2);
//       ctx.stroke();
//       const ox = cx + Math.cos(t) * r;
//       const oy = cy + Math.sin(t) * r;
//       ctx.beginPath();
//       ctx.arc(ox, oy, 2.5, 0, Math.PI * 2);
//       ctx.fillStyle = "#7de8ff";
//       ctx.shadowBlur = 14;
//       ctx.fill();
//       ctx.restore();
//     }

//     const shields = [
//       { x: 0.1, y: 0.2, size: 22, speed: 0.4 },
//       { x: 0.85, y: 0.15, size: 16, speed: 0.6 },
//       { x: 0.92, y: 0.7, size: 20, speed: 0.35 },
//       { x: 0.05, y: 0.75, size: 14, speed: 0.5 },
//       { x: 0.5, y: 0.05, size: 12, speed: 0.7 },
//       { x: 0.15, y: 0.5, size: 10, speed: 0.55 },
//       { x: 0.8, y: 0.45, size: 18, speed: 0.45 },
//     ];

//     function render(now) {
//       const W = canvas.width,
//         H = canvas.height;
//       const dt = Math.min(now - (lastRef.current || now), 50) / 1000;
//       lastRef.current = now;
//       tRef.current += dt;
//       const t = tRef.current;

//       const grd = ctx.createRadialGradient(
//         W * 0.5,
//         H * 0.4,
//         0,
//         W * 0.5,
//         H * 0.5,
//         Math.max(W, H) * 0.8,
//       );
//       grd.addColorStop(0, "#060f22");
//       grd.addColorStop(0.5, "#040c1a");
//       grd.addColorStop(1, "#020810");
//       ctx.fillStyle = grd;
//       ctx.fillRect(0, 0, W, H);

//       const ag = ctx.createRadialGradient(
//         W * 0.5,
//         H * 0.5,
//         0,
//         W * 0.5,
//         H * 0.5,
//         W * 0.4,
//       );
//       ag.addColorStop(0, `rgba(0,80,160,${0.08 + Math.sin(t * 0.8) * 0.03})`);
//       ag.addColorStop(1, "rgba(0,0,0,0)");
//       ctx.fillStyle = ag;
//       ctx.fillRect(0, 0, W, H);

//       drawOrbit(ctx, W * 0.5, H * 0.5, Math.min(W, H) * 0.38, t * 0.2, 0.06);
//       drawOrbit(ctx, W * 0.5, H * 0.5, Math.min(W, H) * 0.45, -t * 0.15, 0.04);
//       drawOrbit(ctx, W * 0.5, H * 0.5, Math.min(W, H) * 0.28, t * 0.3, 0.05);

//       const pts = particlesRef.current;
//       pts.forEach((p) => {
//         p.x += p.vx;
//         p.y += p.vy;
//         p.pulse += dt * 1.5;
//         if (p.y < -10) {
//           p.y = H + 10;
//           p.x = Math.random() * W;
//         }
//         if (p.x < -10) p.x = W + 10;
//         if (p.x > W + 10) p.x = -10;
//         const pa = p.alpha * (0.5 + Math.sin(p.pulse) * 0.5);
//         ctx.save();
//         ctx.globalAlpha = pa * 0.7;
//         ctx.fillStyle = "#00cfff";
//         ctx.shadowColor = "#00cfff";
//         ctx.shadowBlur = 6;
//         ctx.beginPath();
//         ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
//         ctx.fill();
//         ctx.restore();
//       });

//       ctx.save();
//       ctx.globalAlpha = 0.025;
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

//       for (let i = 0; i < 3; i++) {
//         const phase = (t * 0.4 + i / 3) % 1;
//         const pr = phase * Math.min(W, H) * 0.5;
//         ctx.save();
//         ctx.globalAlpha = (1 - phase) * 0.04;
//         ctx.strokeStyle = "#00cfff";
//         ctx.lineWidth = 1.5;
//         ctx.beginPath();
//         ctx.arc(W * 0.5, H * 0.5, pr, 0, Math.PI * 2);
//         ctx.stroke();
//         ctx.restore();
//       }

//       rafRef.current = requestAnimationFrame(render);
//     }

//     rafRef.current = requestAnimationFrame(render);
//     return () => {
//       cancelAnimationFrame(rafRef.current);
//       window.removeEventListener("resize", resize);
//     };
//   }, [mode]);

//   return (
//     <canvas
//       ref={canvasRef}
//       style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
//     />
//   );
// }

// // ── Google Icon ───────────────────────────────────────────────
// function GoogleIcon() {
//   return (
//     <svg width="18" height="18" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
//       <path
//         fill="#4285F4"
//         d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
//       />
//       <path
//         fill="#34A853"
//         d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
//       />
//       <path
//         fill="#FBBC05"
//         d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
//       />
//       <path
//         fill="#EA4335"
//         d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"
//       />
//     </svg>
//   );
// }

// // ── Shared Field ──────────────────────────────────────────────
// function Field({ label, type = "text", placeholder, value, onChange }) {
//   const [focused, setFocused] = useState(false);
//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
//       <label
//         style={{
//           fontSize: "9px",
//           letterSpacing: "3px",
//           color: focused ? "rgba(0,207,255,0.8)" : "rgba(0, 208, 255, 0.85)",
//           textTransform: "uppercase",
//           transition: "color .2s",
//           fontFamily: "'Courier New', monospace",
//         }}
//       >
//         {label}
//       </label>
//       <input
//         type={type}
//         placeholder={placeholder}
//         value={value}
//         onChange={onChange}
//         onFocus={() => setFocused(true)}
//         onBlur={() => setFocused(false)}
//         style={{
//           padding: "clamp(10px,3vw,12px) clamp(12px,4vw,16px)",
//           background: focused ? "rgba(0,40,90,0.7)" : "rgba(0,25,65,0.55)",
//           border: `1px solid ${focused ? "rgba(0,207,255,0.65)" : "rgba(0,150,220,0.22)"}`,
//           borderRadius: "6px",
//           color: "#a8f0ff",
//           fontSize: "clamp(12px,3.5vw,13px)",
//           letterSpacing: "0.5px",
//           outline: "none",
//           fontFamily: "'Courier New', monospace",
//           boxShadow: focused
//             ? "0 0 16px rgba(0,207,255,0.12), inset 0 1px 0 rgba(0,207,255,0.08)"
//             : "none",
//           transition: "all .25s",
//           width: "100%",
//           boxSizing: "border-box",
//         }}
//       />
//     </div>
//   );
// }

// const cornerStyles = [
//   { top: 10, left: 10, borderTop: "1px solid", borderLeft: "1px solid" },
//   { top: 10, right: 10, borderTop: "1px solid", borderRight: "1px solid" },
//   { bottom: 10, left: 10, borderBottom: "1px solid", borderLeft: "1px solid" },
//   {
//     bottom: 10,
//     right: 10,
//     borderBottom: "1px solid",
//     borderRight: "1px solid",
//   },
// ];

// // ── Login Page ────────────────────────────────────────────────
// function LoginPage({ onSwitch }) {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [btnHover, setBtnHover] = useState(false);
//   const [gHover, setGHover] = useState(false);

//   // FIX: handleLogin defined inside component so it has access to state
//   const navigate = useNavigate();
//   const handleLogin = async () => {
//     const data = await loginUser({ email, password });
//     if (data.token) {
//       localStorage.setItem("token", data.token);
//       localStorage.setItem("userId", data.userId);
//       localStorage.setItem("userName", data.name);
//       console.log("✅ Login successful! User:", email);
//       navigate("/home");
//     } else {
//       alert(data.msg || "Login failed");
//       console.error("Login failed:", data.msg);
//     }
//   };

//   //Login with google
//   useEffect(() => {
//     if (window.googleInitialized) return;
//     window.googleInitialized = true;

//     google.accounts.id.initialize({
//       client_id:
//         "786722486772-j3aobfouj1fmu23cjd9i122s4di870pp.apps.googleusercontent.com",
//       callback: handleLoginCredentialResponse,
//     });

//     google.accounts.id.renderButton(
//       document.getElementById("googleSignInDiv"),
//       { theme: "outline", size: "large", width: 400 },
//     );
//   }, []);
//   const handleLoginCredentialResponse = async (response) => {
//     console.log("Google token:", response.credential);
//     const res = await fetch("https://shieldher-backend-1h8b.onrender.com/api/auth/google", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ token: response.credential }),
//     });

//     const data = await res.json();
//     console.log("Backend response:", data);

//     if (data.token) {
//       localStorage.setItem("token", data.token);
//       navigate("/home");
//     }
//   };

//   return (
//     <div
//       style={{
//         position: "relative",
//         zIndex: 10,
//         width: "100%",
//         padding: "clamp(20px, 5vw, 40px) clamp(16px, 5vw, 36px)",
//         margin: "0 auto",
//         animation: "slideUp 0.6s cubic-bezier(0.23,1,0.32,1) both",
//       }}
//     >
//       {/* FIX: Removed duplicate outer card wrapper — single card div only */}
//       <div
//         style={{
//           background: `
//       linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)),
//       url(${log})
//     `,
//           backgroundSize: "contain",
//           backgroundRepeat: "no-repeat",
//           backgroundPosition: "center",
//           border: "1px solid rgba(0,180,255,0.18)",
//           borderRadius: "16px",
//           padding: "40px 36px 36px",
//           // backdropFilter: "blur(24px)",
//           boxShadow:
//             "0 0 60px rgba(0,100,200,0.15), 0 2px 0 rgba(0,207,255,0.08) inset",
//           position: "relative",
//           overflow: "hidden",
//         }}
//       >
//         <div
//           style={{
//             position: "absolute",
//             inset: 0,
//             background:
//               "linear-gradient(rgba(13, 16, 48, 0.69), rgba(8, 14, 65, 0.48))",
//             zIndex: 0,
//             pointerEvents: "auto",
//           }}
//         />
//         <div style={{ position: "relative", zIndex: 1 }}>
//           <div
//             style={{
//               fontSize: "clamp(9px, 2.5vw, 10px)",
//               letterSpacing: "5px",
//               color: "rgba(0, 208, 255, 0.62)",
//               marginBottom: "10px",
//               fontFamily: "'Courier New', monospace",
//             }}
//           >
//             ◈ SECURE PORTAL
//           </div>
//           <h1
//             style={{
//               margin: 0,
//               fontSize: "clamp(1.4rem, 5vw, 2rem)",
//               letterSpacing: "clamp(2px, 1vw, 4px)",

//               color: "#7de8ff",
//               textShadow: "0 0 30px rgba(0,207,255,0.5)",
//               fontFamily: "'Courier New', monospace",
//               fontWeight: 700,
//             }}
//           >
//             SIGN IN
//           </h1>
//           <p
//             style={{
//               margin: "8px 0 0",
//               fontSize: "clamp(10px, 3vw, 12px)",
//               color: "rgba(100, 201, 255, 0.57)",
//               letterSpacing: "1.5px",
//               fontFamily: "'Courier New', monospace",
//             }}
//           >
//             SHIELDHER · POWERING RESILIENCE
//           </p>
//           <div
//             style={{
//               height: "1px",
//               marginTop: "16px",
//               background:
//                 "linear-gradient(90deg,transparent,rgba(0,207,255,0.3),transparent)",
//             }}
//           />
//         </div>

//         <div style={{ position: "relative", marginBottom: "20px" }}>
//           {/* CUSTOM BUTTON - VISIBLE, pointerEvents none */}
//           <button
//             onMouseEnter={() => setGHover(true)}
//             onMouseLeave={() => setGHover(false)}
//             style={{
//               width: "100%",
//               padding: "12px",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               gap: "10px",
//               background: gHover
//                 ? "rgba(255,255,255,0.1)"
//                 : "rgba(255,255,255,0.05)",
//               border: "1px solid rgba(255,255,255,0.15)",
//               borderRadius: "6px",
//               cursor: "pointer",
//               color: "rgba(200,230,255,0.85)",
//               fontSize: "13px",
//               letterSpacing: "1.5px",
//               fontFamily: "'Courier New', monospace",
//               transition: "all .2s",
//               boxShadow: gHover ? "0 0 20px rgba(255,255,255,0.06)" : "none",
//               pointerEvents: "none", // click events go to the invisible overlay div
//               position: "relative",
//               zIndex: 1, // niche
//             }}
//           >
//             <GoogleIcon /> CONTINUE WITH GOOGLE
//           </button>

//           {/* GOOGLE DIV - INVISIBLE OVERLAY, upar */}
//           <div
//             id="googleSignInDiv" // ab div pe hai, button pe nahi
//             onMouseEnter={() => setGHover(true)}
//             onMouseLeave={() => setGHover(false)}
//             style={{
//               position: "absolute",
//               top: 0,
//               left: "20%",
//               right: "20%",
//               height: "1px",
//               background:
//                 "linear-gradient(90deg,transparent,rgba(0,207,255,0.6),transparent)",
//             }}
//           />

//           <div style={{ textAlign: "center", marginBottom: "32px" }}>
//             <div
//               style={{
//                 fontSize: "clamp(9px, 2.5vw, 10px)",
//                 letterSpacing: "5px",
//                 color: "rgba(0, 208, 255, 0.62)",
//                 marginBottom: "10px",
//                 fontFamily: "'Courier New', monospace",
//               }}
//             >
//               ◈ SECURE PORTAL
//             </div>
//             <h1
//               style={{
//                 margin: 0,
//                 fontSize: "clamp(1.4rem, 5vw, 2rem)",
//                 letterSpacing: "clamp(2px, 1vw, 4px)",

//                 color: "#7de8ff",
//                 textShadow: "0 0 30px rgba(0,207,255,0.5)",
//                 fontFamily: "'Courier New', monospace",
//                 fontWeight: 700,
//               }}
//             >
//               SIGN IN
//             </h1>
//             <p
//               style={{
//                 margin: "8px 0 0",
//                 fontSize: "clamp(10px, 3vw, 12px)",
//                 color: "rgba(100, 201, 255, 0.57)",
//                 letterSpacing: "1.5px",
//                 fontFamily: "'Courier New', monospace",
//               }}
//             >
//               SHIELDHER · POWERING RESILIENCE
//             </p>
//             <div
//               style={{
//                 height: "1px",
//                 marginTop: "16px",
//                 background:
//                   "linear-gradient(90deg,transparent,rgba(0,207,255,0.3),transparent)",
//               }}
//             />
//           </div>

//           <div style={{ position: "relative", marginBottom: "20px" }}>
//             {/* CUSTOM BUTTON - VISIBLE, pointerEvents none */}
//             <button
//               onMouseEnter={() => setGHover(true)}
//               onMouseLeave={() => setGHover(false)}
//               style={{
//                 width: "100%",
//                 padding: "12px",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 gap: "10px",
//                 background: gHover
//                   ? "rgba(255,255,255,0.1)"
//                   : "rgba(255,255,255,0.05)",
//                 border: "1px solid rgba(255,255,255,0.15)",
//                 borderRadius: "6px",
//                 cursor: "pointer",
//                 color: "rgba(200,230,255,0.85)",
//                 fontSize: "13px",
//                 letterSpacing: "1.5px",
//                 fontFamily: "'Courier New', monospace",
//                 transition: "all .2s",
//                 boxShadow: gHover ? "0 0 20px rgba(255,255,255,0.06)" : "none",
//                 pointerEvents: "none", // click events go to the invisible overlay div
//                 position: "relative",
//                 zIndex: 1, // niche
//               }}
//             >
//               <GoogleIcon /> CONTINUE WITH GOOGLE
//             </button>

//             {/* GOOGLE DIV - INVISIBLE OVERLAY, upar */}
//             <div
//               id="googleSignInDiv" // ab div pe hai, button pe nahi
//               onMouseEnter={() => setGHover(true)}
//               onMouseLeave={() => setGHover(false)}
//               style={{
//                 position: "absolute",
//                 top: 0,
//                 left: 0,
//                 width: "100%",
//                 height: "100%",
//                 opacity: 0, // invisible
//                 zIndex: 2, // custom button ke upar
//                 overflow: "hidden",
//                 cursor: "pointer",
//               }}
//             />
//           </div>
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: "12px",
//               marginBottom: "20px",
//             }}
//           >
//             <div
//               style={{
//                 flex: 1,
//                 height: "1px",
//                 background: "rgba(0,150,220,0.2)",
//               }}
//             />
//             <span
//               style={{
//                 fontSize: "clamp(9px, 2.5vw, 10px)",
//                 letterSpacing: "2px",
//                 color: "rgba(0,150,220,0.4)",
//                 fontFamily: "'Courier New', monospace",
//               }}
//             >
//               OR
//             </span>
//             <div
//               style={{
//                 flex: 1,
//                 height: "1px",
//                 background: "rgba(0,150,220,0.2)",
//               }}
//             />
//           </div>

//           <div
//             style={{
//               display: "flex",
//               flexDirection: "column",
//               gap: "clamp(12px, 3vw, 16px)",
//               marginBottom: "24px",
//             }}
//           >
//             <Field
//               label="Email Address"
//               type="email"
//               placeholder="you@example.com"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//             />
//             <Field
//               label="Password"
//               type="password"
//               placeholder="••••••••••"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//             />
//           </div>

//           <div style={{ textAlign: "right", marginBottom: "24px" }}>
//             <span
//               style={{
//                 fontSize: "11px",
//                 letterSpacing: "1px",
//                 color: "rgba(0, 208, 255, 0.73)",
//                 cursor: "pointer",
//                 fontFamily: "'Courier New', monospace",
//                 textDecoration: "underline",
//               }}
//             >
//               FORGOT PASSWORD?
//             </span>
//           </div>

//           <button
//             onMouseEnter={() => setBtnHover(true)}
//             onMouseLeave={() => setBtnHover(false)}
//             onClick={handleLogin}
//             style={{
//               width: "100%",
//               padding: "clamp(12px,3.5vw,14px)",

//               background: btnHover
//                 ? "linear-gradient(90deg,rgba(0,130,230,0.6),rgba(0,207,255,0.5))"
//                 : "linear-gradient(90deg,rgba(0,100,200,0.4),rgba(0,180,255,0.3))",
//               border: "1px solid rgba(0,207,255,0.5)",
//               borderRadius: "6px",
//               cursor: "pointer",
//               color: "#7de8ff",
//               fontSize: "clamp(12px,3.5vw,13px)",
//               letterSpacing: "3px",
//               textTransform: "uppercase",
//               fontFamily: "'Courier New', monospace",
//               boxShadow: btnHover
//                 ? "0 0 30px rgba(0,207,255,0.3), 0 0 60px rgba(0,100,200,0.2)"
//                 : "0 0 16px rgba(0,207,255,0.12)",
//               transition: "all .25s",
//               position: "relative",
//               overflow: "hidden",
//             }}
//           >
//             AUTHENTICATE
//           </button>

//           <p
//             style={{
//               textAlign: "center",
//               marginTop: "24px",
//               marginBottom: 0,
//               fontSize: "clamp(10px, 3vw, 12px)",
//               color: "rgba(100,180,220,0.5)",
//               fontFamily: "'Courier New', monospace",
//               letterSpacing: "1px",
//             }}
//           >
//             NEW TO SHIELDHER?{" "}
//             <span
//               onClick={onSwitch}
//               style={{
//                 color: "#00cfff",
//                 cursor: "pointer",
//                 textDecoration: "underline",
//                 letterSpacing: "1.5px",
//               }}
//             >
//               CREATE ACCOUNT
//             </span>
//           </p>

//           {cornerStyles.map((s, i) => (
//             <div
//               key={i}
//               style={{
//                 position: "absolute",
//                 width: "14px",
//                 height: "14px",
//                 borderColor: "rgba(0,207,255,0.25)",
//                 ...s,
//               }}
//             />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── Signup Page ───────────────────────────────────────────────
// // FIX: Removed nested SignupPage definition inside itself
// function SignupPage({ onSwitch }) {
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirm, setConfirm] = useState("");
//   const [btnHover, setBtnHover] = useState(false);
//   const [gHover, setGHover] = useState(false);

//   // FIX: handleRegister defined inside component so it has access to state
//   const handleRegister = async () => {
//     if (password !== confirm) {
//       alert("Passwords do not match");
//       return;
//     }
//     const data = await registerUser({ name, email, password });
//     if (data.msg) {
//       console.log("✅ Registered! User:", email);
//       onSwitch(); // login page pe le jao
//     } else {
//       alert(data.error || "Registration failed");
//     }
//   };

//   return (
//     <div
//       style={{
//         position: "relative",
//         zIndex: 10,
//         width: "100%",
//         padding: "clamp(20px, 5vw, 40px) clamp(16px, 5vw, 36px)",
//         margin: "0 auto",
//         animation: "slideUp 0.6s cubic-bezier(0.23,1,0.32,1) both",
//       }}
//     >
//       <div
//         style={{
//           border: "1px solid rgba(0,180,255,0.18)",
//           borderRadius: "16px",
//           padding: "36px",
//           background: `
//           linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)),
//           url(${sign})
//         `,
//           backgroundSize: "contain",
//           backgroundRepeat: "no-repeat",
//           backgroundPosition: "center",
//           boxShadow:
//             "0 0 60px rgba(0,100,200,0.15), 0 2px 0 rgba(0,207,255,0.08) inset",
//           position: "relative",
//           overflow: "hidden",
//         }}
//       >
//         {/* overlay */}
//         <div
//           style={{
//             position: "absolute",
//             inset: 0,
//             background:
//               "linear-gradient(rgba(29, 56, 124, 0.36), rgba(0, 0, 0, 0.48))",
//             pointerEvents: "none",
//           }}
//         />

//         <div style={{ position: "relative", zIndex: 1 }}>
//           <div style={{ textAlign: "center", marginBottom: "28px" }}>
//             <div
//               style={{ letterSpacing: "5px", color: "rgba(0,207,255,0.45)" }}
//             >
//               ◈ JOIN THE SHIELD
//             </div>

//             <h1 style={{ color: "#7de8ff", margin: 0 }}>CREATE ACCOUNT</h1>

//             <p style={{ color: "rgba(100,200,255,0.45)" }}>
//               SHIELDHER · POWERING RESILIENCE
//             </p>
//           </div>

//           {/* fields */}
//           <div
//             style={{ display: "flex", flexDirection: "column", gap: "14px" }}
//           >
//             <Field
//               label="Full Name"
//               type="text"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//             />
//             <Field
//               label="Email Address"
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//             />
//             <Field
//               label="Password"
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//             />
//             <Field
//               label="Confirm Password"
//               type="password"
//               value={confirm}
//               onChange={(e) => setConfirm(e.target.value)}
//             />
//           </div>

//           {/* button */}
//           <button onClick={handleRegister}>JOIN SHIELDHER</button>

//           {/* login switch */}
//           <p style={{ textAlign: "center" }}>
//             ALREADY PROTECTED?{" "}
//             <span
//               onClick={onSwitch}
//               style={{ color: "#00cfff", cursor: "pointer" }}
//             >
//               SIGN IN
//             </span>
//           </p>

//           {/* corners FIXED */}
//           <div>
//             {cornerStyles.map((s, i) => (
//               <div
//                 key={i}
//                 style={{
//                   position: "absolute",
//                   width: "14px",
//                   height: "14px",
//                   border: "1px solid rgba(0,207,255,0.25)",
//                   ...s,
//                 }}
//               />
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── Main Export ───────────────────────────────────────────────
// export default function AuthPages() {
//   const [page, setPage] = useState("login");

//   return (
//     <div
//       style={{
//         minHeight: "100vh",
//         width: "100%",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         padding: "24px 16px",
//         boxSizing: "border-box",
//         fontFamily: "'Courier New', monospace",
//         position: "relative",
//         overflow: "hidden",
//       }}
//     >
//       <AnimatedBackground mode={page} />

//       {[
//         {
//           top: 16,
//           left: 16,
//           borderTop: "1px solid",
//           borderLeft: "1px solid",
//         },
//         {
//           top: 16,
//           right: 16,
//           borderTop: "1px solid",
//           borderRight: "1px solid",
//         },
//         {
//           bottom: 16,
//           left: 16,
//           borderBottom: "1px solid",
//           borderLeft: "1px solid",
//         },
//         {
//           bottom: 16,
//           right: 16,
//           borderBottom: "1px solid",
//           borderRight: "1px solid",
//         },
//       ].map((s, i) => (
//         <div
//           key={i}
//           style={{
//             position: "fixed",
//             width: "24px",
//             height: "24px",
//             borderColor: "rgba(0,180,255,0.22)",
//             ...s,
//             zIndex: 20,
//             pointerEvents: "none",
//           }}
//         />
//       ))}

//       <div
//         style={{
//           position: "fixed",
//           top: "20px",
//           left: "50%",
//           transform: "translateX(-50%)",
//           zIndex: 20,
//           pointerEvents: "none",
//           display: "flex",
//           alignItems: "center",
//           gap: "8px",
//         }}
//       >
//         <span
//           style={{
//             display: "inline-block",
//             width: "6px",
//             height: "6px",
//             borderRadius: "50%",
//             background: "#00cfff",
//             boxShadow: "0 0 8px #00cfff",
//             animation: "pulseDot 1.4s ease-in-out infinite",
//           }}
//         />
//       </div>

//       <div
//         style={{
//           position: "relative",
//           zIndex: 10,
//           width: "100%",
//           maxWidth: "420px",
//         }}
//       >
//         {page === "login" ? (
//           <LoginPage onSwitch={() => setPage("signup")} />
//         ) : (
//           <SignupPage onSwitch={() => setPage("login")} />
//         )}
//       </div>

//       <style>{`
//         @keyframes pulseDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.3;transform:scale(0.5)} }
//         @keyframes slideUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
//         *{box-sizing:border-box}
//         body{margin:0;background:#060d1a}
//         input::placeholder{color:rgba(0,150,200,0.3)}
//         input:-webkit-autofill{-webkit-box-shadow:0 0 0 100px rgba(0,25,65,0.9) inset !important;-webkit-text-fill-color:#a8f0ff !important}
//       `}</style>
//     </div>
//   );
// }
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
// ── Mock API (replace with your real imports) ─────────────────
import { loginUser } from "../api/serverApi";
import { registerUser } from "../api/serverApi";
import sign from "../assets/sign.png";
import log from "../assets/log.webp";

// ── Animated Background Canvas ────────────────────────────────
function AnimatedBackground({ mode }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const tRef = useRef(0);
  const lastRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    }

    function initParticles() {
      particlesRef.current = Array.from({ length: 60 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: 1 + Math.random() * 2.5,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.3 - Math.random() * 0.5,
        alpha: 0.2 + Math.random() * 0.6,
        pulse: Math.random() * Math.PI * 2,
      }));
    }

    resize();
    window.addEventListener("resize", resize);

    function drawOrbit(ctx, cx, cy, r, t, alpha) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = "#00cfff";
      ctx.shadowColor = "#00cfff";
      ctx.shadowBlur = 8;
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      const ox = cx + Math.cos(t) * r;
      const oy = cy + Math.sin(t) * r;
      ctx.beginPath();
      ctx.arc(ox, oy, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = "#7de8ff";
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.restore();
    }

    const shields = [
      { x: 0.1, y: 0.2, size: 22, speed: 0.4 },
      { x: 0.85, y: 0.15, size: 16, speed: 0.6 },
      { x: 0.92, y: 0.7, size: 20, speed: 0.35 },
      { x: 0.05, y: 0.75, size: 14, speed: 0.5 },
      { x: 0.5, y: 0.05, size: 12, speed: 0.7 },
      { x: 0.15, y: 0.5, size: 10, speed: 0.55 },
      { x: 0.8, y: 0.45, size: 18, speed: 0.45 },
    ];

    function render(now) {
      const W = canvas.width,
        H = canvas.height;
      const dt = Math.min(now - (lastRef.current || now), 50) / 1000;
      lastRef.current = now;
      tRef.current += dt;
      const t = tRef.current;

      const grd = ctx.createRadialGradient(
        W * 0.5,
        H * 0.4,
        0,
        W * 0.5,
        H * 0.5,
        Math.max(W, H) * 0.8,
      );
      grd.addColorStop(0, "#060f22");
      grd.addColorStop(0.5, "#040c1a");
      grd.addColorStop(1, "#020810");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      const ag = ctx.createRadialGradient(
        W * 0.5,
        H * 0.5,
        0,
        W * 0.5,
        H * 0.5,
        W * 0.4,
      );
      ag.addColorStop(0, `rgba(0,80,160,${0.08 + Math.sin(t * 0.8) * 0.03})`);
      ag.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = ag;
      ctx.fillRect(0, 0, W, H);

      drawOrbit(ctx, W * 0.5, H * 0.5, Math.min(W, H) * 0.38, t * 0.2, 0.06);
      drawOrbit(ctx, W * 0.5, H * 0.5, Math.min(W, H) * 0.45, -t * 0.15, 0.04);
      drawOrbit(ctx, W * 0.5, H * 0.5, Math.min(W, H) * 0.28, t * 0.3, 0.05);

      const pts = particlesRef.current;
      pts.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += dt * 1.5;
        if (p.y < -10) {
          p.y = H + 10;
          p.x = Math.random() * W;
        }
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        const pa = p.alpha * (0.5 + Math.sin(p.pulse) * 0.5);
        ctx.save();
        ctx.globalAlpha = pa * 0.7;
        ctx.fillStyle = "#00cfff";
        ctx.shadowColor = "#00cfff";
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
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

      for (let i = 0; i < 3; i++) {
        const phase = (t * 0.4 + i / 3) % 1;
        const pr = phase * Math.min(W, H) * 0.5;
        ctx.save();
        ctx.globalAlpha = (1 - phase) * 0.04;
        ctx.strokeStyle = "#00cfff";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(W * 0.5, H * 0.5, pr, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(render);
    }

    rafRef.current = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [mode]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
    />
  );
}

// ── Google Icon ───────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}

// ── Shared Field ──────────────────────────────────────────────
function Field({ label, type = "text", placeholder, value, onChange }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label
        style={{
          fontSize: "9px",
          letterSpacing: "3px",
          color: focused ? "rgba(0,207,255,0.8)" : "rgba(0, 208, 255, 0.85)",
          textTransform: "uppercase",
          transition: "color .2s",
          fontFamily: "'Courier New', monospace",
        }}
      >
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          padding: "clamp(10px,3vw,12px) clamp(12px,4vw,16px)",
          background: focused ? "rgba(0,40,90,0.7)" : "rgba(0,25,65,0.55)",
          border: `1px solid ${focused ? "rgba(0,207,255,0.65)" : "rgba(0,150,220,0.22)"}`,
          borderRadius: "6px",
          color: "#a8f0ff",
          fontSize: "clamp(12px,3.5vw,13px)",
          letterSpacing: "0.5px",
          outline: "none",
          fontFamily: "'Courier New', monospace",
          boxShadow: focused
            ? "0 0 16px rgba(0,207,255,0.12), inset 0 1px 0 rgba(0,207,255,0.08)"
            : "none",
          transition: "all .25s",
          width: "100%",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

const cornerStyles = [
  { top: 10, left: 10, borderTop: "1px solid", borderLeft: "1px solid" },
  { top: 10, right: 10, borderTop: "1px solid", borderRight: "1px solid" },
  { bottom: 10, left: 10, borderBottom: "1px solid", borderLeft: "1px solid" },
  {
    bottom: 10,
    right: 10,
    borderBottom: "1px solid",
    borderRight: "1px solid",
  },
];

// ── Login Page ────────────────────────────────────────────────
function LoginPage({ onSwitch }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [btnHover, setBtnHover] = useState(false);
  const [gHover, setGHover] = useState(false);
  const [dummyemail, setdummyemail] = useState("");
  const [dummypassword, setdummypassword] = useState("");

  // FIX: handleLogin defined inside component so it has access to state
  const navigate = useNavigate();
  const fillDummy = () => {
    const dummyEmail = "dummy@gmail.com";
    const dummyPassword = "dummy@123";

    setEmail(dummyEmail);
    setPassword(dummyPassword);
  };

  const handleLogin = async () => {
    const data = await loginUser({ email, password });
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("userName", data.name);
      console.log("✅ Login successful! User:", email);
      navigate("/home");
    } else {
      alert(data.msg || "Login failed");
      console.error("Login failed:", data.msg);
    }
  };

  const handleLoginCredentialResponse = async (response) => {
      console.log("GOOGLE RESPONSE:", response);
    try {
  const res = await fetch(
    "https://shieldher-backend-1h8b.onrender.com/api/auth/google",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: response.credential,
      }),
    }
  );

  const data = await res.json();

  console.log(data);

  if (data.token) {
    localStorage.setItem("token", data.token);
    navigate("/home");
  } else {
    alert("Google login failed");
  }
} catch (err) {
  console.error(err);
}
  };

  //Login with google
useEffect(() => {
  const initializeGoogle = () => {
    if (!window.google) {
      console.log("Google SDK not loaded");
      return;
    }

    window.google.accounts.id.initialize({
      client_id:
        "381053692152-pu57dbhfvjkei14plpdhun9b9vt8f6c4.apps.googleusercontent.com",
      callback: handleLoginCredentialResponse,
    });

   window.google.accounts.id.renderButton(
  document.getElementById("googleSignInDiv"),
  {
    theme: "outline",
    size: "large",
     width:
  window.innerWidth < 380
    ? 180
    : window.innerWidth < 480
    ? 220
    : 320,
    text: "continue_with",
    width: "250",
  }
);
  };

  initializeGoogle();
}, []);

  

  return (
    <div
      style={{
        position: "relative",
        zIndex: 10,
        width: "100%",
        width: "100%",
        padding: "clamp(20px, 5vw, 40px) clamp(16px, 5vw, 36px)",
        margin: "0 auto",
        animation: "slideUp 0.6s cubic-bezier(0.23,1,0.32,1) both",
      }}
    >
      {/* FIX: Removed duplicate outer card wrapper — single card div only */}
      <div
        style={{
          background: `
      linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)),
      url(${log})
    `,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          border: "1px solid rgba(0,180,255,0.18)",
          borderRadius: "16px",
          padding: "40px 36px 36px",
          // backdropFilter: "blur(24px)",
          boxShadow:
            "0 0 60px rgba(0,100,200,0.15), 0 2px 0 rgba(0,207,255,0.08) inset",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(rgba(13, 16, 48, 0.69), rgba(8, 14, 65, 0.48))",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "20%",
              right: "20%",
              height: "1px",
              background:
                "linear-gradient(90deg,transparent,rgba(0,207,255,0.6),transparent)",
            }}
          />

          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div
              style={{
                fontSize: "clamp(9px, 2.5vw, 10px)",
                letterSpacing: "5px",
                color: "rgba(0, 208, 255, 0.62)",
                marginBottom: "10px",
                fontFamily: "'Courier New', monospace",
              }}
            >
              ◈ SECURE PORTAL
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: "clamp(1.4rem, 5vw, 2rem)",
                letterSpacing: "clamp(2px, 1vw, 4px)",
                letterSpacing: "4px",
                color: "#7de8ff",
                textShadow: "0 0 30px rgba(0,207,255,0.5)",
                fontFamily: "'Courier New', monospace",
                fontWeight: 700,
              }}
            >
              SIGN IN
            </h1>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "clamp(10px, 3vw, 12px)",
                color: "rgba(100, 201, 255, 0.57)",
                letterSpacing: "1.5px",
                fontFamily: "'Courier New', monospace",
              }}
            >
              SHIELDHER · POWERING RESILIENCE
            </p>
            <div
              style={{
                height: "1px",
                marginTop: "16px",
                background:
                  "linear-gradient(90deg,transparent,rgba(0,207,255,0.3),transparent)",
              }}
            />
          </div>

          {/* <div style={{ position: "relative", marginBottom: "20px" }}>
       
            <button
              onMouseEnter={() => setGHover(true)}
              onMouseLeave={() => setGHover(false)}
              style={{
                width: "100%",
                padding: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                background: gHover
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "6px",
                cursor: "pointer",
                color: "rgba(200,230,255,0.85)",
                fontSize: "13px",
                letterSpacing: "1.5px",
                fontFamily: "'Courier New', monospace",
                transition: "all .2s",
                boxShadow: gHover ? "0 0 20px rgba(255,255,255,0.06)" : "none",
                pointerEvents: "none", // click events go to the invisible overlay div
                position: "relative",
                zIndex: 1, // niche
              }}
            >
              <GoogleIcon /> CONTINUE WITH GOOGLE
            </button>

             <div
    id="googleSignInDiv"
    style={{
      display: "flex",
      justifyContent: "center",
    }}
  />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                flex: 1,
                height: "1px",
                background: "rgba(0,150,220,0.2)",
              }}
            />
            <span
              style={{
                fontSize: "clamp(9px, 2.5vw, 10px)",
                letterSpacing: "2px",
                color: "rgba(0,150,220,0.4)",
                fontFamily: "'Courier New', monospace",
              }}
            >
              OR
            </span>
            <div
              style={{
                flex: 1,
                height: "1px",
                background: "rgba(0,150,220,0.2)",
              }}
            />
          </div> */}
         <div style={{ position: "relative", marginBottom: "20px" }}>
  <div
    onMouseEnter={() => setGHover(true)}
    onMouseLeave={() => setGHover(false)}
    style={{
      width: "100%",
      padding: "12px",
      background: gHover
        ? "rgba(255,255,255,0.1)"
        : "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.15)",
      borderRadius: "6px",
      transition: "all .2s",
      boxShadow: gHover
        ? "0 0 20px rgba(255,255,255,0.06)"
        : "none",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backdropFilter: "blur(6px)",
    }}
  >
    <div
      id="googleSignInDiv"
      style={{
        transform: "scale(1.02)",
      }}
    />
  </div>
</div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "clamp(12px, 3vw, 16px)",
              marginBottom: "24px",
            }}
          >
            <Field
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Field
              label="Password"
              type="password"
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div style={{ textAlign: "right", marginBottom: "24px" }}>
            <span
              style={{
                fontSize: "11px",
                letterSpacing: "1px",
                color: "rgba(0, 208, 255, 0.73)",
                cursor: "pointer",
                fontFamily: "'Courier New', monospace",
                textDecoration: "underline",
              }}
            >
              FORGOT PASSWORD?
            </span>
          </div>

          <button
            onMouseEnter={() => setBtnHover(true)}
            onMouseLeave={() => setBtnHover(false)}
            onClick={handleLogin}
            style={{
              width: "100%",
              padding: "clamp(12px,3.5vw,14px)",

              background: btnHover
                ? "linear-gradient(90deg,rgba(0,130,230,0.6),rgba(0,207,255,0.5))"
                : "linear-gradient(90deg,rgba(0,100,200,0.4),rgba(0,180,255,0.3))",
              border: "1px solid rgba(0,207,255,0.5)",
              borderRadius: "6px",
              cursor: "pointer",
              color: "#7de8ff",
              fontSize: "clamp(12px,3.5vw,13px)",
              letterSpacing: "3px",
              textTransform: "uppercase",
              fontFamily: "'Courier New', monospace",
              boxShadow: btnHover
                ? "0 0 30px rgba(0,207,255,0.3), 0 0 60px rgba(0,100,200,0.2)"
                : "0 0 16px rgba(0,207,255,0.12)",
              transition: "all .25s",
              position: "relative",
              overflow: "hidden",
            }}
          >
            AUTHENTICATE
          </button>
          <button
            onClick={fillDummy}
            style={{
              marginTop: "10px",
              width: "100%",
              padding: "10px",
              background: "transparent",
              border: "1px dashed rgba(0,207,255,0.5)",
              color: "#00cfff",
              cursor: "pointer",
              fontSize: "12px",
              letterSpacing: "2px",
            }}
          >
            USE DUMMY CREDENTIALS
          </button>
          <p
            style={{
              textAlign: "center",
              marginTop: "24px",
              marginBottom: 0,
              fontSize: "clamp(10px, 3vw, 12px)",
              color: "rgba(100,180,220,0.5)",
              fontFamily: "'Courier New', monospace",
              letterSpacing: "1px",
            }}
          >
            NEW TO SHIELDHER?{" "}
            <span
              onClick={onSwitch}
              style={{
                color: "#00cfff",
                cursor: "pointer",
                textDecoration: "underline",
                letterSpacing: "1.5px",
              }}
            >
              CREATE ACCOUNT
            </span>
          </p>

          {cornerStyles.map((s, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: "14px",
                height: "14px",
                borderColor: "rgba(0,207,255,0.25)",
                ...s,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Signup Page ───────────────────────────────────────────────
// FIX: Removed nested SignupPage definition inside itself
function SignupPage({ onSwitch }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [btnHover, setBtnHover] = useState(false);
  const [gHover, setGHover] = useState(false);

  // FIX: handleRegister defined inside component so it has access to state
  const handleRegister = async () => {
    if (password !== confirm) {
      alert("Passwords do not match");
      return;
    }
    const data = await registerUser({ name, email, password });
    if (data.msg) {
      console.log("✅ Registered! User:", email);
      onSwitch(); // login page pe le jao
    } else {
      alert(data.error || "Registration failed");
    }
  };

  return (
    <div
      style={{
        position: "relative",
        zIndex: 10,
        width: "100%",
        width: "100%",
        padding: "clamp(20px, 5vw, 40px) clamp(16px, 5vw, 36px)",
        margin: "0 auto",
        animation: "slideUp 0.6s cubic-bezier(0.23,1,0.32,1) both",
      }}
    >
      <div
        style={{
          background: "rgba(4, 18, 48, 0.67)",
          border: "1px solid rgba(0,180,255,0.18)",
          borderRadius: "16px",
          padding: "36px 36px 32px",
          background: `
      linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)),
      url(${sign})
    `,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          // backdropFilter: "blur(24px)",
          boxShadow:
            "0 0 60px rgba(0,100,200,0.15), 0 2px 0 rgba(0,207,255,0.08) inset",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(rgba(29, 56, 124, 0.36), rgba(0, 0, 0, 0.48))",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "20%",
              right: "20%",
              height: "1px",
              background:
                "linear-gradient(90deg,transparent,rgba(0,207,255,0.6),transparent)",
            }}
          />

          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div
              style={{
                fontSize: "clamp(9px, 2.5vw, 10px)",
                letterSpacing: "5px",
                color: "rgba(0,207,255,0.45)",
                marginBottom: "10px",
                fontFamily: "'Courier New', monospace",
              }}
            >
              ◈ JOIN THE SHIELD
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: "clamp(1.4rem, 5vw, 2rem)",
                letterSpacing: "clamp(2px, 1vw, 4px)",
                letterSpacing: "4px",
                color: "#7de8ff",
                textShadow: "0 0 30px rgba(0,207,255,0.5)",
                fontFamily: "'Courier New', monospace",
                fontWeight: 700,
              }}
            >
              CREATE ACCOUNT
            </h1>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "clamp(10px, 3vw, 12px)",
                color: "rgba(100,200,255,0.45)",
                letterSpacing: "1.5px",
                fontFamily: "'Courier New', monospace",
              }}
            >
              SHIELDHER · POWERING RESILIENCE
            </p>
            <div
              style={{
                height: "1px",
                marginTop: "14px",
                background:
                  "linear-gradient(90deg,transparent,rgba(0,207,255,0.3),transparent)",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "18px",
            }}
          >
            <div
              style={{
                flex: 1,
                height: "1px",
                background: "rgba(0,150,220,0.2)",
              }}
            />
            <div
              style={{
                flex: 1,
                height: "1px",
                background: "rgba(0,150,220,0.2)",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              marginBottom: "22px",
            }}
          >
            <Field
              label="Full Name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Field
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Field
              label="Password"
              type="password"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Field
              label="Confirm Password"
              type="password"
              placeholder="Repeat password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          <p
            style={{
              fontSize: "clamp(9px, 2.5vw, 10px)",
              letterSpacing: "0.8px",
              color: "rgba(0,150,200,0.4)",
              textAlign: "center",
              marginBottom: "18px",
              fontFamily: "'Courier New', monospace",
            }}
          >
            BY JOINING YOU AGREE TO OUR{" "}
            <span
              style={{
                color: "rgba(0,207,255,0.6)",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              TERMS
            </span>{" "}
            &{" "}
            <span
              style={{
                color: "rgba(0,207,255,0.6)",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              PRIVACY POLICY
            </span>
          </p>

          <button
            onMouseEnter={() => setBtnHover(true)}
            onMouseLeave={() => setBtnHover(false)}
            onClick={handleRegister}
            style={{
              width: "100%",
              padding: "clamp(12px,3.5vw,14px)",
              background: btnHover
                ? "linear-gradient(90deg,rgba(0,130,230,0.6),rgba(0,207,255,0.5))"
                : "linear-gradient(90deg,rgba(0,100,200,0.4),rgba(0,180,255,0.3))",
              border: "1px solid rgba(0,207,255,0.5)",
              borderRadius: "6px",
              cursor: "pointer",
              color: "#7de8ff",
              fontSize: "clamp(12px,3.5vw,13px)",
              letterSpacing: "3px",
              textTransform: "uppercase",
              fontFamily: "'Courier New', monospace",
              boxShadow: btnHover
                ? "0 0 30px rgba(0,207,255,0.3), 0 0 60px rgba(0,100,200,0.2)"
                : "0 0 16px rgba(0,207,255,0.12)",
              transition: "all .25s",
            }}
          >
            JOIN SHIELDHER
          </button>

          <p
            style={{
              textAlign: "center",
              marginTop: "20px",
              marginBottom: 0,
              fontSize: "clamp(10px, 3vw, 12px)",
              color: "rgba(100,180,220,0.5)",
              fontFamily: "'Courier New', monospace",
              letterSpacing: "1px",
            }}
          >
            ALREADY PROTECTED?{" "}
            <span
              onClick={onSwitch}
              style={{
                color: "#00cfff",
                cursor: "pointer",
                textDecoration: "underline",
                letterSpacing: "1.5px",
              }}
            >
              SIGN IN
            </span>
          </p>

          {cornerStyles.map((s, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: "14px",
                height: "14px",
                borderColor: "rgba(0,207,255,0.25)",
                ...s,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────
export default function AuthPages() {
  const [page, setPage] = useState("login");

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        boxSizing: "border-box",
        fontFamily: "'Courier New', monospace",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <AnimatedBackground mode={page} />

      {[
        { top: 16, left: 16, borderTop: "1px solid", borderLeft: "1px solid" },
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
            position: "fixed",
            width: "24px",
            height: "24px",
            borderColor: "rgba(0,180,255,0.22)",
            ...s,
            zIndex: 20,
            pointerEvents: "none",
          }}
        />
      ))}

      <div
        style={{
          position: "fixed",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 20,
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "#00cfff",
            boxShadow: "0 0 8px #00cfff",
            animation: "pulseDot 1.4s ease-in-out infinite",
          }}
        />
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: "420px",
        }}
      >
        {page === "login" ? (
          <LoginPage onSwitch={() => setPage("signup")} />
        ) : (
          <SignupPage onSwitch={() => setPage("login")} />
        )}
      </div>

      <style>{`
        @keyframes pulseDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.3;transform:scale(0.5)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        *{box-sizing:border-box}
        body{margin:0;background:#060d1a}
        input::placeholder{color:rgba(0,150,200,0.3)}
        input:-webkit-autofill{-webkit-box-shadow:0 0 0 100px rgba(0,25,65,0.9) inset !important;-webkit-text-fill-color:#a8f0ff !important}
      `}</style>
    </div>
  );
}
