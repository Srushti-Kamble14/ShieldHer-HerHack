import { useState, useEffect, useRef } from "react";
import ShieldHerFlipbook from "./ShieldHerFlipbook";
import PersonalDetailsPage from "./PersonalDetailsPage";
import { useNavigate } from "react-router-dom";
import Gpstracker from "./Gpstracker";
import home from "../assets/home.jpg";
import method1 from "../assets/method1.jpg";
import method2 from "../assets/method2.jpg";
import method3 from "../assets/method3.jpg";
import { BASE_URL } from "../api/config";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Rajdhani:wght@400;500;600;700&display=swap');
  *,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
  html{scroll-behavior:smooth;}
  body{background:#060d1a;color:#a8f0ff;font-family:'Rajdhani',sans-serif;overflow-x:hidden;}
  ::-webkit-scrollbar{width:3px;}
  ::-webkit-scrollbar-track{background:#060d1a;}
  ::-webkit-scrollbar-thumb{background:#000;border-radius:2px;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(32px);}to{opacity:1;transform:translateY(0);}}
  @keyframes blink{0%,100%{opacity:1;}50%{opacity:0.2;}}
  @keyframes glow{0%,100%{text-shadow:0 0 20px rgba(0,207,255,0.4);}50%{text-shadow:0 0 50px rgba(0,207,255,0.8),0 0 90px rgba(0,150,255,0.3);}}
  @keyframes pulseRing{0%,100%{box-shadow:0 0 0 0 rgba(0,207,255,0.5);}50%{box-shadow:0 0 0 16px rgba(0,207,255,0);}}
  @keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
  @keyframes spinR{from{transform:rotate(0deg);}to{transform:rotate(-360deg);}}
  @keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-10px);}}
  @keyframes scanLine{0%{top:0%;opacity:.7;}100%{top:100%;opacity:0;}}
  @keyframes borderPulse{0%,100%{border-color:rgba(0,180,255,0.18);}50%{border-color:rgba(0,207,255,0.45);}}
  @keyframes caretBlink{0%,100%{border-right-color:#00cfff;}50%{border-right-color:transparent;}}
  @keyframes shimmer{0%{opacity:.4;}50%{opacity:1;}100%{opacity:.4;}}
  @keyframes iconPulse{0%,100%{transform:scale(1);}50%{transform:scale(1.1);}}
  @keyframes orbitDot{from{transform:rotate(0deg) translateX(80px) rotate(0deg);}to{transform:rotate(360deg) translateX(80px) rotate(-360deg);}}
  @keyframes navReveal{from{transform:translateY(-100%);}to{transform:translateY(0);}}
  @keyframes rippleOut{0%{transform:scale(1);opacity:.6;}100%{transform:scale(2.5);opacity:0;}}
  @keyframes slideInLeft{from{opacity:0;transform:translateX(-40px);}to{opacity:1;transform:translateX(0);}}
  @keyframes slideInRight{from{opacity:0;transform:translateX(40px);}to{opacity:1;transform:translateX(0);}}
`;

/* ── BG Canvas ───────────────────────────────────────────────── */

/* ── Navbar ──────────────────────────────────────────────────── */
function Navbar({ navigate }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = [
    "Home",
    "About",
    "Instruction Manual",
    "How It Works",
    "Profile",
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
  ];

  // ✅ COMMON CLICK HANDLER (VERY IMPORTANT)
  const handleClick = async (e, l) => {
    e.preventDefault();

    if (l === "Profile") {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const res = await fetch(
          "https://shieldher-backend-1h8b.onrender.com/api/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

       if (res.status === 200) {
  navigate("/dashboard");   // profile exists
} 
else if (res.status === 404) {
  navigate("/details");     // profile not created
} 
else if (res.status === 401) {
  localStorage.removeItem("token");
  navigate("/login");       // token invalid
} 
else {
  navigate("/details");     // fallback
}
      } catch (err) {
  console.error("Profile fetch error:", err);
  navigate("/details");
}
    } else {
      const sectionId = l.toLowerCase().replace(/ /g, "-");
      document
        .getElementById(sectionId)
        ?.scrollIntoView({ behavior: "smooth" });
    }

    setMenuOpen(false); // close menu on click
  };

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          height: "64px",
          padding: "0 clamp(12px,4vw,48px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: scrolled ? "rgba(6,13,26,0.97)" : "rgba(6,13,26,0.72)",
          backdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(0,180,255,0.14)",
        }}
      >
        {/* LOGO */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ color: "#00cfff", fontSize: "12px" }}>SHIELDHER</span>
        </div>

        {/* 🔥 DESKTOP NAV */}
        {!isMobile && (
          <div style={{ display: "flex", gap: "clamp(12px,3vw,34px)" }}>
            {links.map((l) => (
              <a
                key={l}
                href="#"
                onClick={(e) => handleClick(e, l)}
                style={{
                  color: "rgba(168,240,255,0.58)",
                  fontSize: "12px",
                  letterSpacing: "1.5px",
                  textDecoration: "none",
                }}
              >
                {l}
              </a>
            ))}
          </div>
        )}

        {/* 🔥 MOBILE MENU ICON */}
        {isMobile && (
          <div
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              fontSize: "24px",
              color: "#00cfff",
              cursor: "pointer",
            }}
          >
            ☰
          </div>
        )}
      </nav>

      {/* 🔥 MOBILE DROPDOWN */}
      {isMobile && menuOpen && (
        <div
          style={{
            position: "fixed",
            top: "64px",
            left: 0,
            right: 0,
            background: "rgba(6,13,26,0.98)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
            padding: "20px 0",
            zIndex: 2000,
          }}
        >
          {links.map((l) => (
            <a
              key={l}
              href="#"
              onClick={(e) => handleClick(e, l)}
              style={{
                color: "#a8f0ff",
                fontSize: "14px",
                letterSpacing: "2px",
                textDecoration: "none",
              }}
            >
              {l}
            </a>
          ))}
        </div>
      )}
    </>
  );
}

/* ── Hero ────────────────────────────────────────────────────── */
function Hero({ navigate }) {
  const [vis, setVis] = useState(false);
  const [typed, setTyped] = useState("");
  const full = "Protecting Every Woman, Everywhere.";
  useEffect(() => {
    setTimeout(() => setVis(true), 300);
    let i = 0;
    const iv = setInterval(() => {
      if (i <= full.length) {
        setTyped(full.slice(0, i));
        i++;
      } else clearInterval(iv);
    }, 55);
    return () => clearInterval(iv);
  }, []);
  return (
    <section
      id="home"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "clamp(100px,15vh,120px) clamp(12px,4vw,24px) 80px",
        position: "relative",
        /* 🔥 BACKGROUND ONLY HERE */
        background: `linear-gradient(rgba(6, 13, 26, 0.72), rgba(4, 12, 29, 1)), url(${home}) `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          height: "1px",
          background:
            "linear-gradient(90deg,transparent,rgba(0,207,255,0.28),transparent)",
          animation: "scanLine 6s linear infinite",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          opacity: vis ? 1 : 0,
          transform: vis ? "translateY(0)" : "translateY(28px)",
          transition: "all 1s cubic-bezier(0.23,1,0.32,1)",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 18px",
            background: "rgba(0,207,255,0.06)",
            border: "1px solid rgba(0,180,255,0.2)",
            borderRadius: "20px",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              background: "#00cfff",
              boxShadow: "0 0 7px #00cfff",
              animation: "blink 1.5s ease-in-out infinite",
            }}
          />
          <span
            style={{
              fontFamily: "'Orbitron',monospace",
              fontSize: "9px",
              letterSpacing: "3px",
              color: "rgba(0,207,255,0.7)",
            }}
          >
            AI-POWERED WOMEN SAFETY
          </span>
        </div>
        <h1
          style={{
            fontFamily: "'Orbitron',monospace",
            fontSize: "clamp(3rem,7vw,6rem)",
            fontWeight: 900,
            letterSpacing: "4px",
            lineHeight: 1.05,
            marginBottom: "24px",
            background:
              "linear-gradient(135deg,#ffffff 0%,#a8f0ff 40%,#00cfff 70%,#0080cc 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "glow 5s ease-in-out infinite",
          }}
        >
          SHIELD
          <br />
          HER
        </h1>
        <div
          style={{
            fontFamily: "'Courier New',monospace",
            fontSize: "clamp(0.8rem,2vw,1.25rem)",
            color: "rgba(168,240,255,0.78)",
            letterSpacing: "1px",
            marginBottom: "14px",
            minHeight: "2rem",
            display: "inline-block",
            borderRight: "2px solid #00cfff",
            paddingRight: "4px",
            animation: "caretBlink 0.8s step-end infinite",
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          {typed}
        </div>
        <p
          style={{
            fontSize: "14px",
            color: "rgba(0,180,255,0.48)",
            letterSpacing: "3px",
            marginBottom: "48px",
            fontFamily: "'Orbitron',monospace",
            fontWeight: 400,
          }}
        >
          POWERING RESILIENCE
        </p>
        <div
          style={{
            display: "flex",
            gap: "16px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            style={{
              padding: "15px 44px",
              background:
                "linear-gradient(90deg,rgba(0,100,200,0.52),rgba(0,207,255,0.4))",
              border: "1px solid rgba(0,207,255,0.58)",
              borderRadius: "8px",
              color: "#7de8ff",
              fontSize: "12px",
              letterSpacing: "2.5px",
              fontFamily: "'Orbitron',monospace",
              fontWeight: 700,
              cursor: "pointer",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.15)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            onClick={async () => {
              try {
                const token = localStorage.getItem("token");

                if (!token) {
                  navigate("/details"); // not logged in → create profile
                  return;
                }
                const res = await fetch(
                  "https://shieldher-backend-1h8b.onrender.com/api/profile",
                  {
                    method: "GET",
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  },
                );

                if (res.ok) {
                  // ✅ profile exists
                  navigate("/dashboard");
                } else {
                  // ❌ profile not created
                  navigate("/details");
                }
              } catch (err) {
                console.error(err);
                navigate("/details");
              }
            }}
          >
            ACTIVATE SHIELD
          </button>
          <button
            style={{
              padding: "15px 44px",
              background: "transparent",
              border: "1px solid rgba(0,180,255,0.28)",
              borderRadius: "8px",
              color: "rgba(168,240,255,0.58)",
              fontSize: "12px",
              letterSpacing: "2.5px",
              fontFamily: "'Orbitron',monospace",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all .25s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(0,207,255,0.55)";
              e.currentTarget.style.color = "#a8f0ff";
              e.currentTarget.style.background = "rgba(0,207,255,0.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(0,180,255,0.28)";
              e.currentTarget.style.color = "rgba(168,240,255,0.58)";
              e.currentTarget.style.background = "transparent";
            }}
            onClick={() => {
              document
                .getElementById("how-it-works")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            LEARN MORE
          </button>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "32px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "6px",
          animation: "float 2.5s ease-in-out infinite",
        }}
      >
        <span
          style={{
            fontSize: "9px",
            letterSpacing: "3px",
            color: "rgba(0,180,255,0.32)",
            fontFamily: "'Courier New',monospace",
          }}
        >
          SCROLL
        </span>
        <div
          style={{
            width: "1px",
            height: "30px",
            background:
              "linear-gradient(180deg,rgba(0,207,255,0.45),transparent)",
          }}
        />
      </div>
    </section>
  );
}

/* ── About ───────────────────────────────────────────────────── */
function About() {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVis(true);
      },
      { threshold: 0.2 },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <section
      ref={ref}
      id="about"
      style={{
        padding: "clamp(40px,8vw,80px) clamp(12px,4vw,48px)",
        maxWidth: "1100px",
        margin: "0 auto",
        position: "relative",
        zIndex: 1,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "64px",
          alignItems: "center",
        }}
      >
        <div
          style={{
            opacity: vis ? 1 : 0,
            transform: vis ? "translateX(0)" : "translateX(-40px)",
            transition: "all .8s ease",
          }}
        >
          <div
            style={{
              fontSize: "9px",
              letterSpacing: "5px",
              color: "rgba(0,207,255,0.42)",
              marginBottom: "14px",
              fontFamily: "'Courier New',monospace",
            }}
          >
            ◈ ABOUT SHIELDHER
          </div>
          <h2
            style={{
              fontFamily: "'Orbitron',monospace",
              fontSize: "clamp(1.4rem,2.5vw,2rem)",
              fontWeight: 700,
              letterSpacing: "2px",
              color: "#7de8ff",
              lineHeight: 1.3,
              marginBottom: "20px",
              textShadow: "0 0 22px rgba(0,207,255,0.28)",
            }}
          >
            YOUR PERSONAL
            <br />
            SAFETY GUARDIAN
          </h2>
          <div
            style={{
              width: "48px",
              height: "2px",
              background: "linear-gradient(90deg,#00cfff,transparent)",
              marginBottom: "20px",
            }}
          />
          <p
            style={{
              fontSize: "15px",
              color: "rgba(168,240,255,0.52)",
              lineHeight: 1.8,
              marginBottom: "16px",
              letterSpacing: "0.3px",
            }}
          >
            ShieldHer is an AI-powered women safety platform that combines smart
            hardware, voice recognition, and real-time GPS tracking to create an
            invisible shield around every woman.
          </p>
          <p
            style={{
              fontSize: "14px",
              color: "rgba(0,180,255,0.38)",
              lineHeight: 1.8,
              letterSpacing: "0.3px",
            }}
          >
            Whether you're commuting late at night, travelling solo, or just
            need peace of mind — ShieldHer activates in seconds and alerts your
            emergency network instantly.
          </p>
        </div>
        <div
          style={{
            opacity: vis ? 1 : 0,
            transform: vis ? "translateX(0)" : "translateX(40px)",
            transition: "all .8s ease .2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ShieldViz />
        </div>
      </div>
    </section>
  );
}

function ShieldViz() {
  return (
    <div
      style={{
        position: "relative",
        width: "220px",
        height: "220px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          border: "1px solid rgba(0,207,255,0.1)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "10px",
          borderRadius: "50%",
          border: "1.5px solid rgba(0,207,255,0.22)",
          borderTopColor: "#00cfff",
          borderRightColor: "transparent",
          animation: "spin 7s linear infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "22px",
          borderRadius: "50%",
          border: "1px solid rgba(0,207,255,0.12)",
          borderBottomColor: "#7de8ff",
          borderLeftColor: "transparent",
          animation: "spinR 10s linear infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "36px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle,rgba(0,80,180,0.14) 0%,transparent 70%)",
          animation: "pulseRing 3s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 2,
          animation: "float 3s ease-in-out infinite",
        }}
      >
        <svg width="80" height="90" viewBox="0 0 80 90" fill="none">
          <path
            d="M40 4L72 16L72 42C72 62 58 76 40 86C22 76 8 62 8 42L8 16Z"
            fill="rgba(0,100,200,0.15)"
            stroke="#00cfff"
            strokeWidth="2"
          />
          <path
            d="M40 16L62 25L62 42C62 56 52 66 40 74C28 66 18 56 18 42L18 25Z"
            fill="rgba(0,150,255,0.07)"
            stroke="rgba(0,207,255,0.38)"
            strokeWidth="1"
          />
          <circle
            cx="40"
            cy="42"
            r="8"
            fill="rgba(0,207,255,0.28)"
            stroke="#00cfff"
            strokeWidth="1.5"
          />
          <line
            x1="40"
            y1="20"
            x2="40"
            y2="34"
            stroke="#7de8ff"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="40"
            y1="50"
            x2="40"
            y2="62"
            stroke="#7de8ff"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "6px",
          height: "6px",
          marginTop: "-3px",
          marginLeft: "-3px",
          borderRadius: "50%",
          background: "#00cfff",
          boxShadow: "0 0 8px #00cfff",
          animation: "orbitDot 4.5s linear infinite",
        }}
      />
    </div>
  );
}

/* ── Methods ─────────────────────────────────────────────────── */
function Methods() {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVis(true);
      },
      { threshold: 0.12 },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const methods = [
    {
      id: "01",
      tag: "METHOD ONE",
      color: "#00cfff",
      glow: "rgba(0,207,255,0.22)",
      border: "rgba(0,207,255,0.38)",
      title: "Manual App Activation",
      image: method1,

      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <rect
            x="9"
            y="3"
            width="14"
            height="26"
            rx="3"
            stroke="#00cfff"
            strokeWidth="1.5"
          />
          <circle cx="16" cy="23" r="1.8" fill="#00cfff" />
          <circle cx="16" cy="13" r="4.5" stroke="#7de8ff" strokeWidth="1.2" />
          <path
            d="M13 13L15.5 15.5L19 11"
            stroke="#00cfff"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      ),
      steps: [
        "Open ShieldHer app",
        "Tap the SOS shield button",
        "System activates instantly",
      ],
      desc: "Open the ShieldHer app and tap the shield button. Your live GPS is immediately shared with all emergency contacts via call and SMS. Real-time tracking stays active until you deactivate.",
      feat: [
        "One-tap SOS button",
        "Live GPS sharing",
        "Auto call + SMS alert",
        "Full location history",
      ],
    },
    {
      id: "02",
      tag: "METHOD TWO",
      color: "#7de8ff",
      glow: "rgba(125,232,255,0.18)",
      border: "rgba(125,232,255,0.32)",
      title: "Voice Trigger Word",
      image: method2,
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <rect
            x="12"
            y="4"
            width="8"
            height="14"
            rx="4"
            stroke="#7de8ff"
            strokeWidth="1.5"
          />
          <path
            d="M7 16C7 20.4 11 24 16 24C21 24 25 20.4 25 16"
            stroke="#7de8ff"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
          <line
            x1="16"
            y1="24"
            x2="16"
            y2="28"
            stroke="#7de8ff"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="12"
            y1="28"
            x2="20"
            y2="28"
            stroke="#7de8ff"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {[5, 9, 13, 17, 21, 25].map((x, i) => (
            <line
              key={i}
              x1={x}
              y1={i % 2 === 0 ? 17 : 15}
              x2={x}
              y2={i % 2 === 0 ? 19 : 21}
              stroke="rgba(125,232,255,0.5)"
              strokeWidth="1"
              strokeLinecap="round"
            />
          ))}
        </svg>
      ),
      steps: [
        "Say your personalized word",
        "AI detects voice instantly",
        "Hands-free SOS activated",
      ],
      desc: 'Say your personalized trigger word — "Shield", "Help", or any word you set — and ShieldHer\'s AI activates instantly. No need to unlock your phone. Emergency calls and location SMS are sent automatically.',
      feat: [
        "AI voice recognition",
        "Custom trigger word",
        "Works with locked phone",
        "Hands-free emergency SOS",
      ],
    },
    {
      id: "03",
      tag: "METHOD THREE",
      color: "#5bc8ff",
      glow: "rgba(91,200,255,0.18)",
      border: "rgba(91,200,255,0.32)",
      title: "Physical Wearable Button",
      image: method3,

      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="11" stroke="#5bc8ff" strokeWidth="1.5" />
          <circle
            cx="16"
            cy="16"
            r="7"
            stroke="rgba(91,200,255,0.4)"
            strokeWidth="1"
          />
          <circle
            cx="16"
            cy="16"
            r="3.5"
            fill="rgba(91,200,255,0.22)"
            stroke="#5bc8ff"
            strokeWidth="1"
          />
          <circle cx="16" cy="16" r="1.2" fill="#5bc8ff" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
            const rad = (deg * Math.PI) / 180,
              x1 = 16 + Math.cos(rad) * 8,
              y1 = 16 + Math.sin(rad) * 8,
              x2 = 16 + Math.cos(rad) * 10,
              y2 = 16 + Math.sin(rad) * 10;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#5bc8ff"
                strokeWidth="1"
                strokeLinecap="round"
              />
            );
          })}
        </svg>
      ),
      steps: [
        "Tap your wearable brooch",
        "GPS + GSM + Camera on",
        "Police + contacts notified",
      ],
      desc: "Tap the elegantly designed wearable brooch — built-in GPS and GSM module activates immediately. Camera captures proof stored on cloud. Emergency contacts and nearby police station are notified simultaneously within seconds.",
      feat: [
        "Built-in GPS + GSM module",
        "Camera captures evidence",
        "Cloud storage for proof",
        "Police station auto-alert",
      ],
    },
  ];

  return (
    <section
      ref={ref}
      id="how-it-works"
      style={{
        padding: "clamp(50px,10vw,100px) clamp(12px,4vw,48px)",
        position: "relative",
        zIndex: 1,
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div
          style={{
            textAlign: "center",
            marginBottom: "64px",
            opacity: vis ? 1 : 0,
            transform: vis ? "translateY(0)" : "translateY(24px)",
            transition: "all .6s ease",
          }}
        >
          <div
            style={{
              fontSize: "15px",
              letterSpacing: "5px",
              color: "rgba(0,207,255,0.42)",
              marginBottom: "14px",
              fontFamily: "'Courier New',monospace",
            }}
          >
            ◈ THREE LAYERS OF PROTECTION
          </div>
          <h2
            style={{
              fontFamily: "'Orbitron',monospace",
              fontSize: "clamp(1.5rem,3vw,2.3rem)",
              fontWeight: 700,
              letterSpacing: "3px",
              color: "#7de8ff",
              textShadow: "0 0 26px rgba(0,207,255,0.28)",
            }}
          >
            HOW TO ACTIVATE SHIELDHER
          </h2>
          <div
            style={{
              height: "1px",
              width: "200px",
              margin: "18px auto 0",
              background:
                "linear-gradient(90deg,transparent,rgba(0,207,255,0.45),transparent)",
            }}
          />
        </div>

        {/* Three cards in one row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "24px",
            alignItems: "stretch",
          }}
        >
          {methods.map((m, i) => (
            <MethodCard key={i} m={m} i={i} vis={vis} />
          ))}
        </div>
      </div>
    </section>
  );
}

function MethodCard({ m, i, vis }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: "relative",

        background: m.image
          ? `linear-gradient(rgba(6, 22, 55, 0.48), rgba(4,14,40,0.9)), url(${m.image})`
          : hov
            ? "rgba(6,22,55,0.95)"
            : "rgba(4,14,40,0.85)",

        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",

        border: `1px solid ${hov ? m.border : "rgba(0,180,255,0.15)"}`,
        borderRadius: "14px",
        padding: "clamp(20px,5vw,36px) clamp(16px,4vw,28px)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: hov
          ? `0 0 50px ${m.glow}, 0 24px 60px rgba(0,0,0,0.4)`
          : "0 4px 28px rgba(0,0,0,0.28)",
        transform: hov
          ? "translateY(-10px)"
          : vis
            ? "translateY(0)"
            : "translateY(36px)",
        opacity: vis ? 1 : 0,
        transition: `transform .38s cubic-bezier(0.23,1,0.32,1), box-shadow .35s, border-color .3s, background .3s, opacity .55s ${i * 130}ms`,
        cursor: "default",
      }}
    >
      {/* Scan line on hover */}
      {hov && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: "1px",
            background: `linear-gradient(90deg,transparent,${m.color},transparent)`,
            animation: "scanLine 2.5s linear infinite",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Top glow accent */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "18%",
          right: "18%",
          height: "2px",
          background: `linear-gradient(90deg,transparent,${m.color},transparent)`,
          opacity: hov ? 1 : 0.35,
          transition: "opacity .3s",
        }}
      />

      {/* Big background number */}
      <div
        style={{
          position: "absolute",
          top: "12px",
          right: "16px",
          fontFamily: "'Orbitron',monospace",
          fontSize: "3.8rem",
          fontWeight: 900,
          color: m.color,
          opacity: 0.06,
          lineHeight: 1,
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        {m.id}
      </div>

      {/* Tag */}
      <div
        style={{
          fontFamily: "'Courier New',monospace",
          fontSize: "15px",
          letterSpacing: "3px",
          color: m.color,
          opacity: 0.6,
          marginBottom: "20px",
        }}
      >
        {m.tag}
      </div>

      {/* Icon box */}
      <div
        style={{
          width: "64px",
          height: "64px",
          border: `1px solid ${hov ? m.border : "rgba(0,180,255,0.14)"}`,
          borderRadius: "12px",
          background: hov ? `rgba(0,100,200,0.1)` : "rgba(0,40,100,0.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: hov ? `0 0 20px ${m.glow}` : "none",
          transition: "all .3s",
          marginBottom: "20px",
          animation: hov ? "iconPulse 2s ease-in-out infinite" : "none",
        }}
      >
        {m.icon}
      </div>

      {/* Title */}
      <h3
        style={{
          fontFamily: "'Orbitron',monospace",
          fontSize: ".95rem",
          fontWeight: 700,
          color: m.color,
          letterSpacing: "1.5px",
          marginBottom: "18px",
          lineHeight: 1.3,
          textShadow: hov ? `0 0 16px ${m.color}` : "none",
          transition: "text-shadow .3s",
        }}
      >
        {m.title}
      </h3>

      {/* Steps */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "9px",
          marginBottom: "18px",
        }}
      >
        {m.steps.map((s, si) => (
          <div
            key={si}
            style={{ display: "flex", alignItems: "center", gap: "10px" }}
          >
            <div
              style={{
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                border: `1px solid ${m.color}`,
                background: `${m.color}18`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Courier New',monospace",
                fontSize: "8px",
                color: m.color,
                flexShrink: 0,
                fontWeight: 700,
              }}
            >
              {si + 1}
            </div>
            <span
              style={{
                fontSize: "12px",
                color: "rgba(168,240,255,0.58)",
                letterSpacing: "0.4px",
              }}
            >
              {s}
            </span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div
        style={{
          height: "1px",
          background: "rgba(0,180,255,0.1)",
          marginBottom: "16px",
        }}
      />

      {/* Description */}
      <p
        style={{
          fontSize: "13px",
          color: "rgba(168,240,255,0.48)",
          lineHeight: 1.75,
          marginBottom: "22px",
          flexGrow: 1,
        }}
      >
        {m.desc}
      </p>

      {/* Features */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {m.feat.map((f, fi) => (
          <div
            key={fi}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <div
              style={{
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                background: m.color,
                boxShadow: `0 0 6px ${m.color}`,
                flexShrink: 0,
                animation: `shimmer ${1.5 + fi * 0.3}s ease-in-out ${fi * 0.18}s infinite`,
              }}
            />
            <span
              style={{
                fontSize: "12px",
                color: "rgba(168,240,255,0.55)",
                letterSpacing: "0.4px",
              }}
            >
              {f}
            </span>
          </div>
        ))}
      </div>

      {/* Corner HUD marks */}
      {[
        {
          top: 10,
          left: 10,
          borderTop: `1px solid ${m.color}`,
          borderLeft: `1px solid ${m.color}`,
        },
        {
          top: 10,
          right: 10,
          borderTop: `1px solid ${m.color}`,
          borderRight: `1px solid ${m.color}`,
        },
        {
          bottom: 10,
          left: 10,
          borderBottom: `1px solid ${m.color}`,
          borderLeft: `1px solid ${m.color}`,
        },
        {
          bottom: 10,
          right: 10,
          borderBottom: `1px solid ${m.color}`,
          borderRight: `1px solid ${m.color}`,
        },
      ].map((s, j) => (
        <div
          key={j}
          style={{
            position: "absolute",
            width: "12px",
            height: "12px",
            opacity: hov ? 0.75 : 0.2,
            transition: "opacity .3s",
            ...s,
          }}
        />
      ))}
    </div>
  );
}

/* ── Footer ──────────────────────────────────────────────────── */
function Footer() {
  const cols = {
    Product: [
      "Features",
      "How It Works",
      "Wearable Tech",
      "Safety AI",
      "Pricing",
    ],
    Company: ["About Us", "Our Mission", "Press Kit", "Careers", "Blog"],
    Support: [
      "Help Center",
      "Contact Us",
      "Community",
      "Privacy Policy",
      "Terms",
    ],
  };
  return (
    <footer
      style={{
        position: "relative",
        zIndex: 1,
        borderTop: "1px solid rgba(0,180,255,0.1)",
        background: "rgba(3,8,18,0.72)",
        backdropFilter: "blur(20px)",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          padding: "clamp(32px,8vw,64px) clamp(12px,4vw,48px)",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "48px",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                border: "1.5px solid rgba(0,207,255,0.55)",
                borderRadius: "7px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,207,255,0.07)",
                boxShadow: "0 0 12px rgba(0,207,255,0.18)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 2L17 5L17 10C17 14.5 13.5 17.5 10 19C6.5 17.5 3 14.5 3 10L3 5Z"
                  fill="rgba(0,207,255,0.18)"
                  stroke="#00cfff"
                  strokeWidth="1.5"
                />
                <circle cx="10" cy="9" r="2.2" fill="#00cfff" />
              </svg>
            </div>
            <span
              style={{
                fontFamily: "'Orbitron',monospace",
                fontSize: "15px",
                fontWeight: 700,
                color: "#00cfff",
                letterSpacing: "3px",
              }}
            >
              SHIELDHER
            </span>
          </div>
          <p
            style={{
              fontSize: "13px",
              color: "rgba(168,240,255,0.42)",
              lineHeight: 1.8,
              marginBottom: "24px",
              maxWidth: "260px",
              letterSpacing: "0.3px",
            }}
          >
            AI-powered personal safety platform protecting women with real-time
            alerts, GPS tracking, and wearable technology.
          </p>
          <div
            style={{
              fontSize: "9px",
              letterSpacing: "3px",
              color: "rgba(0,207,255,0.38)",
              fontFamily: "'Courier New',monospace",
            }}
          >
            POWERING RESILIENCE
          </div>
        </div>
        {Object.entries(cols).map(([col, items]) => (
          <div key={col}>
            <div
              style={{
                fontFamily: "'Courier New',monospace",
                fontSize: "9px",
                letterSpacing: "2.5px",
                color: "rgba(0,207,255,0.5)",
                marginBottom: "20px",
                textTransform: "uppercase",
              }}
            >
              {col}
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {items.map((item) => (
                <a
                  key={item}
                  href="#"
                  style={{
                    fontSize: "13px",
                    color: "rgba(168,240,255,0.42)",
                    textDecoration: "none",
                    letterSpacing: "0.3px",
                    transition: "color .2s",
                  }}
                  onMouseEnter={(e) => (e.target.style.color = "#7de8ff")}
                  onMouseLeave={(e) =>
                    (e.target.style.color = "rgba(168,240,255,0.42)")
                  }
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          borderTop: "1px solid rgba(0,180,255,0.08)",
          padding: "16px clamp(12px,4vw,48px)",
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div
          style={{
            fontSize: "10px",
            color: "rgba(0,180,255,0.32)",
            letterSpacing: "1px",
            fontFamily: "'Courier New',monospace",
          }}
        >
          © 2025 SHIELDHER · ALL RIGHTS RESERVED · AES-256 ENCRYPTED
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              background: "#00cfff",
              boxShadow: "0 0 7px #00cfff",
              animation: "blink 2s ease-in-out infinite",
            }}
          />
          <span
            style={{
              fontSize: "9px",
              letterSpacing: "2px",
              color: "rgba(0,207,255,0.38)",
              fontFamily: "'Courier New',monospace",
            }}
          >
            ALL SYSTEMS OPERATIONAL
          </span>
        </div>
      </div>
    </footer>
  );
}

/* ── Export ──────────────────────────────────────────────────── */
export default function HomePage() {
  const navigate = useNavigate();
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
        {/* <BG/> */}
        <Navbar navigate={navigate} />
        <main style={{ position: "relative", zIndex: 1, overflowX: "hidden" }}>
          <Hero navigate={navigate} />

          <About />
          <ShieldHerFlipbook />
          <Methods />
        </main>

        <Gpstracker />

        <Footer />
      </div>
    </>
  );
}
