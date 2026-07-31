import React, { useEffect, useRef, useState } from "react";
import { HER_NAME, START, START_LABEL } from "../data.js";

function Typewriter({ text, onDone }) {
  const [shown, setShown] = useState(0);
  const [blink, setBlink] = useState(true);
  useEffect(() => {
    if (shown < text.length) {
      const t = setTimeout(() => setShown((n) => n + 1), 90);
      return () => clearTimeout(t);
    }
    onDone && onDone();
    const t = setInterval(() => setBlink((b) => !b), 530);
    return () => clearInterval(t);
  }, [shown, text]);
  return (
    <span>
      {text.slice(0, shown)}
      <span style={{ opacity: blink ? 1 : 0, color: "var(--rose)", fontFamily: "Jost, sans-serif", fontWeight: 300 }}>|</span>
    </span>
  );
}

export default function Hero() {
  const [now, setNow] = useState(() => Date.now());
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [phase, setPhase] = useState(0);
  const [nameDone, setNameDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setPhase(1), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      setMouse({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      });
    };
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const ms = now - new Date(START).getTime();
  const units = [
    [Math.floor(ms / 86400000), "days"],
    [Math.floor(ms / 3600000) % 24, "hours"],
    [Math.floor(ms / 60000) % 60, "minutes"],
    [Math.floor(ms / 1000) % 60, "seconds"],
  ];

  const ORBS = [
    { size: 340, left: "5%",  top: "10%",    color: "#4A2A6B", delay: 0,   depth: 0.035 },
    { size: 260, right: "4%", top: "25%",    color: "#8E3D63", delay: 1.5, depth: 0.06  },
    { size: 200, left: "28%", bottom: "15%", color: "#2E3A7A", delay: 0.8, depth: 0.045 },
    { size: 160, right: "22%",bottom: "28%", color: "#6B2A8E", delay: 2,   depth: 0.08  },
    { size: 120, left: "55%", top: "8%",     color: "#3A1C6B", delay: 3,   depth: 0.05  },
  ];

  return (
    <header
      className="min-h-screen flex flex-col items-center justify-center text-center px-6 relative overflow-hidden"
      style={{ paddingTop: 60, paddingBottom: 60, perspective: 1200 }}
    >
      {ORBS.map((orb, i) => (
        <div key={i} aria-hidden="true" style={{
          position: "absolute",
          width: orb.size, height: orb.size, borderRadius: "50%",
          background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
          left: orb.left, right: orb.right,
          top: orb.top, bottom: orb.bottom,
          filter: "blur(70px)", opacity: 0.65,
          transform: `translate(${mouse.x * orb.depth * 120}px, ${mouse.y * orb.depth * 120}px)`,
          transition: "transform 0.4s cubic-bezier(.2,.6,.3,1)",
          animation: `drift${(i % 2) + 1} ${22 + i * 5}s ease-in-out ${orb.delay}s infinite`,
          pointerEvents: "none",
        }} />
      ))}

      {Array.from({ length: 10 }, (_, i) => (
        <div key={i} aria-hidden="true" style={{
          position: "absolute",
          width: 3, height: 3, borderRadius: "50%",
          background: i % 2 === 0 ? "#F4C77B" : "#F08FA8",
          left: `${10 + i * 8}%`,
          top: `${15 + (i % 3) * 25}%`,
          animation: `heroSparkle ${3 + i * 0.4}s ease-in-out ${i * 0.6}s infinite`,
          boxShadow: `0 0 6px ${i % 2 === 0 ? "#F4C77B" : "#F08FA8"}`,
          pointerEvents: "none",
        }} />
      ))}

      <div style={{
        transform: `rotateX(${mouse.y * -2.5}deg) rotateY(${mouse.x * 2.5}deg)`,
        transformStyle: "preserve-3d",
        transition: "transform 0.3s cubic-bezier(.2,.6,.3,1)",
        width: "100%", maxWidth: 700,
      }}>
        <p className="eyebrow mb-6" style={{
          opacity: phase ? 1 : 0,
          transform: phase ? "none" : "translateY(18px)",
          transition: "all 1s ease 0.15s",
        }}>
          Girlfriend&rsquo;s Day &nbsp;·&nbsp; for one girl in particular
        </p>

        <h1 className="display mb-3" style={{
          fontSize: "clamp(2.2rem, 6.5vw, 5rem)",
          opacity: phase ? 1 : 0,
          transform: phase ? "none" : "translateY(22px)",
          transition: "all 1s ease 0.35s",
        }}>
          Happy Girlfriend&rsquo;s Day,
        </h1>

        <p className="script rose mb-8" style={{
          fontSize: "clamp(2.6rem, 7.5vw, 5.5rem)",
          opacity: phase ? 1 : 0,
          transform: phase ? "none" : "translateY(22px)",
          transition: "all 1s ease 0.6s",
          textShadow: "0 0 40px rgba(240,143,168,0.4)",
        }}>
          {phase ? <Typewriter text={HER_NAME} onDone={() => setNameDone(true)} /> : null}
        </p>

        <p className="soft max-w-md mx-auto leading-relaxed mb-10" style={{
          fontSize: "clamp(0.9rem, 2vw, 1.05rem)",
          opacity: phase ? 1 : 0,
          transform: phase ? "none" : "translateY(18px)",
          transition: "all 1s ease 0.9s",
        }}>
          I couldn&rsquo;t fit it in a message. I couldn&rsquo;t fit it in a card.
          So I built you the whole sky instead.
        </p>

        <div style={{
          opacity: phase ? 1 : 0,
          transform: phase ? "none" : "translateY(18px)",
          transition: "all 1s ease 1.15s",
        }}>
          <p className="eyebrow mb-4">We have been us for</p>
          <div className="tick" style={{ gap: 8 }}>
            {units.map(([value, label]) => (
              <div key={label} style={{
                minWidth: 76, padding: "12px 8px",
                border: "1px solid rgba(244,199,123,0.22)",
                borderRadius: 4,
                background: "rgba(255,255,255,0.03)",
                backdropFilter: "blur(6px)",
              }}>
                <span key={value} style={{
                  display: "block",
                  fontFamily: "Cormorant Garamond, serif",
                  fontSize: "1.9rem", lineHeight: 1,
                  color: "var(--cream)",
                  animation: "tickFlip 0.25s ease",
                }}>
                  {String(value).padStart(2, "0")}
                </span>
                <em style={{
                  display: "block", fontStyle: "normal",
                  fontSize: "0.58rem", letterSpacing: "0.28em",
                  textTransform: "uppercase", color: "var(--gold)",
                  opacity: 0.8, marginTop: 7,
                }}>{label}</em>
              </div>
            ))}
          </div>
          <p className="soft text-xs mt-4 tracking-widest opacity-50">{START_LABEL}</p>
        </div>

        {nameDone && (
          <p className="script" style={{
            fontSize: "1.3rem", color: "var(--lilac)", marginTop: 24,
            animation: "lockFadeUp 1s ease both", opacity: 0.75,
          }}>
            and so, so much more to show you ✦
          </p>
        )}
      </div>

      <button
        onClick={() => window.scrollBy({ top: window.innerHeight * 0.9, behavior: "smooth" })}
        aria-label="Scroll down"
        style={{
          position: "absolute", bottom: 28, left: "50%",
          transform: "translateX(-50%)",
          background: "none", border: "none", cursor: "pointer",
          animation: "bounceArrow 2.2s ease-in-out infinite",
          opacity: scrollY > 60 ? 0 : 0.65,
          transition: "opacity 0.5s",
        }}
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M8 12 L16 20 L24 12" stroke="#F4C77B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </header>
  );
}