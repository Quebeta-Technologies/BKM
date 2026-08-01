import React, { useEffect, useRef, useState } from "react";
import { HER_NAME, START, START_LABEL } from "../data.js";

/* ── Typewriter ── */
function Typewriter({ text, onDone }) {
  const [shown, setShown] = useState(0);
  const [blink, setBlink] = useState(true);
  useEffect(() => {
    if (shown < text.length) {
      const t = setTimeout(() => setShown((n) => n + 1), 100);
      return () => clearTimeout(t);
    }
    onDone && onDone();
    const t = setInterval(() => setBlink((b) => !b), 530);
    return () => clearInterval(t);
  }, [shown, text]);
  return (
    <span>
      {text.slice(0, shown)}
      <span style={{ opacity: blink ? 1 : 0, color: "var(--rose)" }}>|</span>
    </span>
  );
}

/* ── Floating mini hearts that drift upward ── */
const FLOAT_HEARTS = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  left: `${5 + i * 6.5}%`,
  size: 10 + Math.random() * 14,
  dur: 6 + Math.random() * 8,
  delay: Math.random() * 8,
  drift: (Math.random() - 0.5) * 60,
  glyph: ["♥","♡","✦","❤","✿"][Math.floor(Math.random() * 5)],
  color: ["#F08FA8","#FBD5DE","#C3A6F0","#F4C77B"][Math.floor(Math.random() * 4)],
}));

/* ── Shooting stars ── */
const SHOOTING_STARS = Array.from({ length: 5 }, (_, i) => ({
  id: i,
  top: `${8 + i * 12}%`,
  delay: i * 3.5 + Math.random() * 2,
  dur: 1.8 + Math.random() * 1.2,
  width: 60 + Math.random() * 80,
}));

/* ── Twinkling star dots ── */
const TWINKLE_DOTS = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  size: 1.5 + Math.random() * 2.5,
  dur: 2 + Math.random() * 3,
  delay: Math.random() * 4,
  color: i % 3 === 0 ? "#F4C77B" : i % 3 === 1 ? "#F08FA8" : "#C3A6F0",
}));

export default function Hero() {
  const [now, setNow] = useState(() => Date.now());
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [phase, setPhase] = useState(0);
  const [nameDone, setNameDone] = useState(false);
  const [counterGlow, setCounterGlow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setPhase(1), 120);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const i = setInterval(() => {
      setNow(Date.now());
      setCounterGlow(true);
      setTimeout(() => setCounterGlow(false), 300);
    }, 1000);
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
    { size: 380, left: "2%",   top: "5%",     color: "#4A2A6B", delay: 0,   depth: 0.03  },
    { size: 280, right: "2%",  top: "20%",    color: "#8E3D63", delay: 1.5, depth: 0.055 },
    { size: 220, left: "25%",  bottom: "10%", color: "#2E3A7A", delay: 0.8, depth: 0.04  },
    { size: 180, right: "20%", bottom: "22%", color: "#6B2A8E", delay: 2,   depth: 0.07  },
    { size: 140, left: "50%",  top: "5%",     color: "#3A1C6B", delay: 3,   depth: 0.045 },
    { size: 100, left: "15%",  top: "40%",    color: "#5A1C7A", delay: 1,   depth: 0.06  },
  ];

  return (
    <header
      className="min-h-screen flex flex-col items-center justify-center text-center px-6 relative overflow-hidden"
      style={{ paddingTop: 60, paddingBottom: 80, perspective: 1200 }}
    >
      {/* ── Parallax orbs ── */}
      {ORBS.map((orb, i) => (
        <div key={i} aria-hidden="true" style={{
          position: "absolute",
          width: orb.size, height: orb.size, borderRadius: "50%",
          background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
          left: orb.left, right: orb.right,
          top: orb.top, bottom: orb.bottom,
          filter: "blur(72px)", opacity: 0.7,
          transform: `translate(${mouse.x * orb.depth * 130}px, ${mouse.y * orb.depth * 130}px)`,
          transition: "transform 0.5s cubic-bezier(.2,.6,.3,1)",
          animation: `drift${(i % 2) + 1} ${20 + i * 5}s ease-in-out ${orb.delay}s infinite`,
          pointerEvents: "none",
        }} />
      ))}

      {/* ── Twinkling star dots ── */}
      {TWINKLE_DOTS.map((d) => (
        <div key={d.id} aria-hidden="true" style={{
          position: "absolute",
          left: d.left, top: d.top,
          width: d.size, height: d.size,
          borderRadius: "50%",
          background: d.color,
          boxShadow: `0 0 ${d.size * 3}px ${d.color}`,
          animation: `heroTwinkle ${d.dur}s ease-in-out ${d.delay}s infinite`,
          pointerEvents: "none",
        }} />
      ))}

      {/* ── Shooting stars ── */}
      {SHOOTING_STARS.map((s) => (
        <div key={s.id} aria-hidden="true" style={{
          position: "absolute",
          top: s.top, left: "-10%",
          width: s.width, height: 1.5,
          background: "linear-gradient(90deg, transparent, #F4C77B, #F08FA8, transparent)",
          borderRadius: 2,
          animation: `shootingStar ${s.dur}s ease-in ${s.delay}s infinite`,
          pointerEvents: "none",
          opacity: 0,
        }} />
      ))}

      {/* ── Floating hearts drifting up ── */}
      {FLOAT_HEARTS.map((h) => (
        <div key={h.id} aria-hidden="true" style={{
          position: "absolute",
          left: h.left, bottom: "-40px",
          fontSize: h.size,
          color: h.color,
          filter: `drop-shadow(0 0 6px ${h.color})`,
          animation: `heroHeartFloat ${h.dur}s ease-in-out ${h.delay}s infinite`,
          "--hdrift": `${h.drift}px`,
          pointerEvents: "none",
          opacity: 0,
          userSelect: "none",
        }}>
          {h.glyph}
        </div>
      ))}

      {/* ── Main 3D tilt content ── */}
      <div style={{
        transform: `rotateX(${mouse.y * -2}deg) rotateY(${mouse.x * 2}deg)`,
        transformStyle: "preserve-3d",
        transition: "transform 0.35s cubic-bezier(.2,.6,.3,1)",
        width: "100%", maxWidth: 720,
        position: "relative", zIndex: 2,
      }}>

        {/* Eyebrow */}
        <p className="eyebrow mb-5" style={{
          opacity: phase ? 1 : 0,
          transform: phase ? "none" : "translateY(18px)",
          transition: "all 1s ease 0.1s",
        }}>
          Girlfriend&rsquo;s Day &nbsp;·&nbsp; for one girl in particular
        </p>

        {/* Heading */}
        <h1 className="display mb-2" style={{
          fontSize: "clamp(2.2rem, 6.5vw, 5rem)",
          opacity: phase ? 1 : 0,
          transform: phase ? "none" : "translateY(22px)",
          transition: "all 1s ease 0.3s",
        }}>
          Happy Girlfriend&rsquo;s Day,
        </h1>

        {/* Her name with glow halo */}
        <div style={{ position: "relative", display: "inline-block", marginBottom: 28 }}>
          {/* Glow blob behind name */}
          <div aria-hidden="true" style={{
            position: "absolute",
            inset: "-20px -40px",
            background: "radial-gradient(ellipse, rgba(240,143,168,0.22), transparent 70%)",
            borderRadius: "50%",
            animation: "nameHaloBreath 3s ease-in-out infinite",
            pointerEvents: "none",
          }} />
          <p className="script rose" style={{
            fontSize: "clamp(2.8rem, 8vw, 5.8rem)",
            opacity: phase ? 1 : 0,
            transform: phase ? "none" : "translateY(22px)",
            transition: "all 1s ease 0.55s",
            textShadow: "0 0 50px rgba(240,143,168,0.6), 0 0 100px rgba(240,143,168,0.2)",
            lineHeight: 1.1,
            position: "relative",
          }}>
            {phase ? <Typewriter text={HER_NAME} onDone={() => setNameDone(true)} /> : null}
          </p>
        </div>

        {/* Subtitle */}
        <p className="soft max-w-md mx-auto leading-relaxed mb-8" style={{
          fontSize: "clamp(0.88rem, 2vw, 1.02rem)",
          opacity: phase ? 1 : 0,
          transform: phase ? "none" : "translateY(18px)",
          transition: "all 1s ease 0.85s",
        }}>
          I couldn&rsquo;t fit it in a message. I couldn&rsquo;t fit it in a card.
          So I built you the whole sky instead.
        </p>

        {/* Counter */}
        <div style={{
          opacity: phase ? 1 : 0,
          transform: phase ? "none" : "translateY(18px)",
          transition: "all 1s ease 1.1s",
        }}>
          <p className="eyebrow mb-3">We have been us for</p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {units.map(([value, label], i) => (
              <div key={label} style={{
                minWidth: 78, padding: "13px 10px",
                border: `1px solid rgba(244,199,123,${counterGlow && label === "seconds" ? 0.6 : 0.22})`,
                borderRadius: 6,
                background: counterGlow && label === "seconds"
                  ? "rgba(240,143,168,0.08)"
                  : "rgba(255,255,255,0.03)",
                backdropFilter: "blur(8px)",
                transition: "border-color 0.3s, background 0.3s, box-shadow 0.3s",
                boxShadow: counterGlow && label === "seconds"
                  ? "0 0 16px rgba(240,143,168,0.2)"
                  : "none",
                position: "relative",
                overflow: "hidden",
              }}>
                {/* Shimmer on seconds tick */}
                {counterGlow && label === "seconds" && (
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(90deg, transparent, rgba(240,143,168,0.12), transparent)",
                    animation: "shimmer 0.4s ease",
                  }} />
                )}
                <span key={value} style={{
                  display: "block",
                  fontFamily: "Cormorant Garamond, serif",
                  fontSize: "2rem", lineHeight: 1,
                  color: label === "days" ? "var(--rose)" : "var(--cream)",
                  animation: "tickFlip 0.25s ease",
                  textShadow: label === "days" ? "0 0 20px rgba(240,143,168,0.4)" : "none",
                }}>
                  {String(value).padStart(2, "0")}
                </span>
                <em style={{
                  display: "block", fontStyle: "normal",
                  fontSize: "0.56rem", letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color: label === "days" ? "var(--rose)" : "var(--gold)",
                  opacity: 0.85, marginTop: 7,
                }}>{label}</em>
              </div>
            ))}
          </div>
          <p className="soft text-xs mt-3 tracking-widest opacity-45">{START_LABEL}</p>
        </div>

        {/* After name is typed — cute extra line */}
        {nameDone && (
          <div style={{ marginTop: 20 }}>
            <p className="script" style={{
              fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)",
              color: "var(--lilac)",
              animation: "lockFadeUp 1s ease both",
              opacity: 0.8,
              textShadow: "0 0 20px rgba(195,166,240,0.4)",
            }}>
              and so, so much more to show you ✦
            </p>
            {/* Tiny hearts that appear after name */}
            <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 10 }}>
              {["♥","✦","♥"].map((g, i) => (
                <span key={i} style={{
                  color: i === 1 ? "var(--gold)" : "var(--rose)",
                  fontSize: i === 1 ? "0.6rem" : "0.8rem",
                  animation: `heroHeartPop 0.6s ease ${i * 0.15}s both`,
                  display: "inline-block",
                  opacity: 0,
                }}>{g}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Scroll arrow ── */}
      <button
        onClick={() => window.scrollBy({ top: window.innerHeight * 0.88, behavior: "smooth" })}
        aria-label="Scroll down"
        style={{
          position: "absolute", bottom: 24, left: "50%",
          transform: "translateX(-50%)",
          background: "none", border: "none", cursor: "pointer",
          animation: "bounceArrow 2.2s ease-in-out infinite",
          opacity: scrollY > 60 ? 0 : 0.6,
          transition: "opacity 0.5s",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
        }}
      >
        <span style={{
          fontSize: "0.55rem", letterSpacing: "0.3em",
          textTransform: "uppercase", color: "var(--gold)", opacity: 0.7,
        }}>scroll</span>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M6 10 L14 18 L22 10" stroke="#F4C77B" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </header>
  );
}