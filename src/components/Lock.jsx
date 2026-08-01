import React, { useEffect, useRef, useState } from "react";
import { LOCK, HER_NAME } from "../data.js";
import { normalise } from "../lib/utils.js";

function LockHeart({ style }) {
  return (
    <div aria-hidden="true" style={{
      position: "absolute", pointerEvents: "none",
      fontSize: style.size, color: style.color,
      left: style.left, top: style.top, opacity: 0,
      animation: `lockHeartFloat ${style.dur}s ease-in-out ${style.delay}s infinite`,
    }}>
      {style.glyph}
    </div>
  );
}

function OrbitRing({ radius, count, speed, size, color }) {
  return (
    <div aria-hidden="true" style={{
      position: "absolute", left: "50%", top: "50%",
      width: radius * 2, height: radius * 2,
      marginLeft: -radius, marginTop: -radius,
      animation: `lockOrbit ${speed}s linear infinite`,
    }}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} style={{
          position: "absolute", width: size, height: size,
          borderRadius: "50%", background: color,
          left: "50%", top: "50%",
          marginLeft: -size / 2, marginTop: -size / 2,
          transform: `rotate(${(i / count) * 360}deg) translateY(-${radius}px)`,
          boxShadow: `0 0 ${size * 2}px ${color}`,
        }} />
      ))}
    </div>
  );
}

function PulseRings() {
  return (
    <div aria-hidden="true" style={{ position: "absolute", left: "50%", top: "50%", pointerEvents: "none" }}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} style={{
          position: "absolute",
          border: `1px solid rgba(240,143,168,${0.4 - i * 0.08})`,
          borderRadius: "50%",
          width: i * 90, height: i * 90,
          marginLeft: -i * 45, marginTop: -i * 45,
          animation: `lockRingPulse 3.5s ease-out ${i * 0.45}s infinite`,
        }} />
      ))}
    </div>
  );
}

/* ── PETALS falling during transition ── */
function Petals({ active }) {
  if (!active) return null;
  const petals = Array.from({ length: 35 }, (_, i) => ({
    id: i,
    left: `${5 + Math.random() * 90}%`,
    size: 10 + Math.random() * 18,
    dur: 2.5 + Math.random() * 2.5,
    delay: Math.random() * 1.2,
    drift: (Math.random() - 0.5) * 120,
    rot: Math.random() * 720 - 360,
    glyph: ["🌸","✿","❀","🌺","♥","✦"][Math.floor(Math.random() * 6)],
    color: ["#F08FA8","#FBD5DE","#F4C77B","#C3A6F0","#fff"][Math.floor(Math.random() * 5)],
  }));
  return (
    <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 195, pointerEvents: "none", overflow: "hidden" }}>
      {petals.map((p) => (
        <div key={p.id} style={{
          position: "absolute",
          left: p.left, top: "-60px",
          fontSize: p.size,
          color: p.color,
          filter: `drop-shadow(0 0 6px ${p.color})`,
          animation: `petalFall ${p.dur}s cubic-bezier(.3,0,.7,1) ${p.delay}s forwards`,
          "--drift": `${p.drift}px`,
          "--rot": `${p.rot}deg`,
          opacity: 0,
        }}>
          {p.glyph}
        </div>
      ))}
    </div>
  );
}

/* ── GLITTER particles ── */
function Glitter({ active }) {
  if (!active) return null;
  const dots = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: 2 + Math.random() * 5,
    dur: 0.6 + Math.random() * 1.2,
    delay: Math.random() * 1.0,
    color: ["#F4C77B","#F08FA8","#C3A6F0","#fff","#FBD5DE"][Math.floor(Math.random() * 5)],
  }));
  return (
    <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 196, pointerEvents: "none" }}>
      {dots.map((d) => (
        <div key={d.id} style={{
          position: "absolute",
          left: d.left, top: d.top,
          width: d.size, height: d.size,
          borderRadius: "50%",
          background: d.color,
          boxShadow: `0 0 ${d.size * 2}px ${d.color}`,
          animation: `glitterPop ${d.dur}s ease-out ${d.delay}s forwards`,
          opacity: 0,
        }} />
      ))}
    </div>
  );
}

/* ── DOOR SPLIT panels ── */
function DoorSplit({ active }) {
  if (!active) return null;
  return (
    <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 194, pointerEvents: "none" }}>
      {/* Left panel */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: "50%",
        background: "linear-gradient(135deg, #0b0918 60%, #1a0d2e)",
        animation: "doorLeft 1.8s cubic-bezier(.7,0,.3,1) 0.4s forwards",
        transformOrigin: "left center",
        boxShadow: "inset -20px 0 60px rgba(240,143,168,0.15)",
      }}>
        <div style={{
          position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)",
          width: 1, height: "40%",
          background: "linear-gradient(180deg, transparent, rgba(240,143,168,0.6), transparent)",
        }} />
      </div>
      {/* Right panel */}
      <div style={{
        position: "absolute", right: 0, top: 0, bottom: 0, width: "50%",
        background: "linear-gradient(225deg, #0b0918 60%, #1a0d2e)",
        animation: "doorRight 1.8s cubic-bezier(.7,0,.3,1) 0.4s forwards",
        transformOrigin: "right center",
        boxShadow: "inset 20px 0 60px rgba(240,143,168,0.15)",
      }}>
        <div style={{
          position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
          width: 1, height: "40%",
          background: "linear-gradient(180deg, transparent, rgba(240,143,168,0.6), transparent)",
        }} />
      </div>
      {/* Light burst from centre seam */}
      <div style={{
        position: "absolute", left: "50%", top: 0, bottom: 0,
        width: 2, transform: "translateX(-50%)",
        background: "linear-gradient(180deg, transparent 10%, rgba(240,143,168,0.8) 50%, transparent 90%)",
        animation: "seamGlow 1.8s ease 0.4s forwards",
        boxShadow: "0 0 30px rgba(240,143,168,0.6)",
      }} />
    </div>
  );
}

/* ── GLASS SHATTER pieces ── */
function GlassShatter({ active }) {
  if (!active) return null;
  const shards = Array.from({ length: 16 }, (_, i) => {
    const angle = (i / 16) * 360;
    const dist = 80 + Math.random() * 160;
    return {
      id: i, angle, dist,
      w: 40 + Math.random() * 80,
      h: 30 + Math.random() * 60,
      left: `${20 + Math.random() * 60}%`,
      top: `${20 + Math.random() * 60}%`,
      rot: Math.random() * 360,
      dur: 0.8 + Math.random() * 0.6,
      delay: Math.random() * 0.3,
    };
  });
  return (
    <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 197, pointerEvents: "none" }}>
      {shards.map((s) => (
        <div key={s.id} style={{
          position: "absolute",
          left: s.left, top: s.top,
          width: s.w, height: s.h,
          background: "linear-gradient(135deg, rgba(240,143,168,0.25), rgba(195,166,240,0.15))",
          border: "1px solid rgba(240,143,168,0.4)",
          backdropFilter: "blur(2px)",
          clipPath: "polygon(20% 0%, 80% 5%, 100% 50%, 75% 100%, 15% 95%, 0% 45%)",
          animation: `shardFly ${s.dur}s cubic-bezier(.2,.8,.3,1) ${s.delay}s forwards`,
          "--sx": `${Math.cos((s.angle * Math.PI) / 180) * s.dist}px`,
          "--sy": `${Math.sin((s.angle * Math.PI) / 180) * s.dist}px`,
          "--sr": `${s.rot}deg`,
          opacity: 0,
        }} />
      ))}
    </div>
  );
}

/* ── HER NAME fades in centre during transition ── */
function NameReveal({ active }) {
  if (!active) return null;
  return (
    <div aria-hidden="true" style={{
      position: "fixed", inset: 0, zIndex: 198,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      pointerEvents: "none",
    }}>
      <p style={{
        fontFamily: "Parisienne, cursive",
        fontSize: "clamp(3rem, 10vw, 6rem)",
        color: "#F08FA8",
        textShadow: "0 0 60px rgba(240,143,168,0.9), 0 0 120px rgba(240,143,168,0.4)",
        animation: "nameRevealAnim 2.5s ease forwards",
        margin: 0, lineHeight: 1.2,
      }}>
        {HER_NAME}
      </p>
      <p style={{
        fontFamily: "Jost, sans-serif",
        fontSize: "0.72rem",
        letterSpacing: "0.45em",
        textTransform: "uppercase",
        color: "var(--gold)",
        opacity: 0,
        animation: "nameRevealSub 2.5s ease 0.4s forwards",
        marginTop: 16,
      }}>
        this is all for you
      </p>
    </div>
  );
}

const BG_HEARTS = Array.from({ length: 18 }, () => ({
  size: `${0.9 + Math.random() * 1.4}rem`,
  color: ["#F08FA8","#F4C77B","#C3A6F0","#FBD5DE"][Math.floor(Math.random() * 4)],
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  dur: 5 + Math.random() * 7,
  delay: Math.random() * 6,
  glyph: ["♥","♡","✦","❤","✿"][Math.floor(Math.random() * 5)],
}));

export default function Lock({ onUnlock }) {
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(0);
  const [shake, setShake] = useState(false);
  const [stage, setStage] = useState("idle"); // idle → unlocking → leaving → gone
  const [phase, setPhase] = useState(0);
  const [hint, setHint] = useState(false);
  const input = useRef(null);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 600);
    const t2 = setTimeout(() => input.current?.focus(), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setHint(true), 8000);
    return () => clearTimeout(t);
  }, []);

  const submit = (e) => {
    e.preventDefault();
    if (!value.trim()) return;
    if (normalise(value) === normalise(LOCK.password)) {
      // Stage 1 — shatter + glitter + petals start
      setStage("unlocking");
      // Stage 2 — door opens, name reveals, lock fades
      setTimeout(() => {
        setStage("leaving");
        onUnlock();
      }, 700);
      // Stage 3 — everything gone, show page
      setTimeout(() => setStage("gone"), 3000);
    } else {
      setWrong((w) => w + 1);
      setShake(true);
      setValue("");
      setTimeout(() => setShake(false), 500);
    }
  };

  if (stage === "gone") return null;

  const unlocking = stage === "unlocking" || stage === "leaving";
  const leaving = stage === "leaving";

  const message = wrong === 0
    ? null
    : LOCK.wrongMessages[Math.min(wrong - 1, LOCK.wrongMessages.length - 1)];

  return (
    <>
      {/* Layer 1: Petals fall */}
      <Petals active={unlocking} />

      {/* Layer 2: Glitter dissolve */}
      <Glitter active={unlocking} />

      {/* Layer 3: Glass shards */}
      <GlassShatter active={stage === "unlocking"} />

      {/* Layer 4: Door splits open */}
      <DoorSplit active={leaving} />

      {/* Layer 5: Her name appears */}
      <NameReveal active={leaving} />

      {/* The lock screen itself */}
      <div
        className="lock"
        style={{
          background: "var(--night)",
          overflow: "hidden",
          opacity: leaving ? 0 : 1,
          filter: leaving ? "blur(18px)" : "none",
          transform: leaving ? "scale(0.94)" : "none",
          transition: leaving
            ? "opacity 1.4s ease 0.5s, filter 1.4s ease 0.5s, transform 1.4s ease 0.5s"
            : "none",
          pointerEvents: leaving ? "none" : "auto",
        }}
      >
        {BG_HEARTS.map((h, i) => <LockHeart key={i} style={h} />)}

        <div aria-hidden="true" style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 60% 55% at 20% 40%, rgba(74,42,107,0.5), transparent)",
          animation: "drift1 18s ease-in-out infinite",
        }} />
        <div aria-hidden="true" style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 50% 50% at 80% 60%, rgba(142,61,99,0.45), transparent)",
          animation: "drift2 22s ease-in-out infinite",
        }} />

        <div style={{
          position: "relative", zIndex: 10,
          width: "100%", maxWidth: 460,
          padding: "0 28px",
          display: "flex", flexDirection: "column", alignItems: "center",
          opacity: phase === 1 ? 1 : 0,
          transform: phase === 1 ? "none" : "translateY(30px)",
          transition: "opacity 1.2s ease, transform 1.2s ease",
        }}>

          <div style={{ position: "relative", marginBottom: 32, width: 110, height: 110 }}>
            <PulseRings />
            <OrbitRing radius={48} count={6} speed={8} size={5} color="#F08FA8" />
            <OrbitRing radius={36} count={4} speed={14} size={3} color="#F4C77B" />
            <div style={{
              position: "absolute", left: "50%", top: "50%",
              transform: "translate(-50%, -50%)",
              fontFamily: "Parisienne, cursive",
              fontSize: "3.2rem", color: "#F08FA8",
              animation: unlocking
                ? "lockHeartUnlock 0.6s ease forwards"
                : "lockHeartBeat 1.8s ease-in-out infinite",
              textShadow: "0 0 30px rgba(240,143,168,0.8), 0 0 60px rgba(240,143,168,0.4)",
              lineHeight: 1,
            }}>♥</div>
          </div>

          <p className="eyebrow mb-4" style={{
            animation: "lockFadeUp 0.8s ease 0.8s both", textAlign: "center",
          }}>
            Something I made just for you
          </p>

          <h1 className="display text-center mb-3" style={{
            fontSize: "clamp(2.2rem, 6vw, 3.5rem)",
            animation: "lockFadeUp 0.8s ease 1s both",
          }}>
            Hello,{" "}
            <span className="script rose" style={{ fontSize: "1.2em" }}>{HER_NAME}</span>
          </h1>

          <p className="soft text-sm leading-relaxed text-center mb-8" style={{
            maxWidth: 340,
            animation: "lockFadeUp 0.8s ease 1.2s both",
          }}>
            I built you an entire world and locked it,
            because it belongs to you and nobody else.
            The answer is already in your heart.
          </p>

          <div style={{
            display: "flex", alignItems: "center", gap: 14, marginBottom: 24, width: "100%",
            animation: "lockFadeUp 0.8s ease 1.35s both",
          }}>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, rgba(244,199,123,0.4))" }} />
            <span style={{ color: "var(--gold)", fontSize: "0.7rem" }}>✦</span>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(244,199,123,0.4), transparent)" }} />
          </div>

          <p style={{
            fontFamily: "Cormorant Garamond, serif",
            fontSize: "1.15rem", color: "var(--gold)",
            textAlign: "center", marginBottom: 20, fontStyle: "italic",
            animation: "lockFadeUp 0.8s ease 1.5s both",
          }}>
            {LOCK.question}
          </p>

          <form onSubmit={submit} className={shake ? "shake" : ""} style={{
            width: "100%",
            animation: "lockFadeUp 0.8s ease 1.65s both",
          }}>
            <div style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(244,199,123,0.3)",
              borderRadius: 8, overflow: "hidden",
            }}>
              <input
                ref={input}
                className="key-in"
                type="text"
                inputMode="text"
                autoComplete="off"
                spellCheck="false"
                placeholder={LOCK.hint}
                aria-label={LOCK.question}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                style={{
                  width: "100%", border: "none", borderBottom: "none",
                  borderRadius: 8, padding: "16px 20px", background: "transparent",
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                marginTop: 16, width: "100%", padding: "16px 0",
                background: "linear-gradient(135deg, rgba(240,143,168,0.18), rgba(195,166,240,0.12))",
                border: "1px solid rgba(240,143,168,0.45)",
                borderRadius: 8, color: "var(--cream)",
                fontFamily: "Jost, sans-serif", fontSize: "0.72rem",
                letterSpacing: "0.36em", textTransform: "uppercase",
                cursor: "pointer", transition: "all 0.35s", backdropFilter: "blur(8px)",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "linear-gradient(135deg, rgba(240,143,168,0.35), rgba(195,166,240,0.25))";
                e.target.style.boxShadow = "0 0 30px rgba(240,143,168,0.3)";
                e.target.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "linear-gradient(135deg, rgba(240,143,168,0.18), rgba(195,166,240,0.12))";
                e.target.style.boxShadow = "none";
                e.target.style.transform = "none";
              }}
            >
              Open it for me ♥
            </button>
          </form>

          <p className="script rose mt-6" style={{
            fontSize: "1.25rem", minHeight: 32, textAlign: "center",
            opacity: message ? 1 : 0, transition: "opacity 0.4s",
          }}>
            {message || "\u00A0"}
          </p>

          <p style={{
            fontSize: "0.65rem", letterSpacing: "0.28em", textTransform: "uppercase",
            color: "rgba(195,166,240,0.45)", marginTop: 28, textAlign: "center",
            opacity: hint ? 1 : 0, transition: "opacity 1.5s ease",
          }}>
            {LOCK.hint} &nbsp;·&nbsp; the day that changed everything
          </p>
        </div>
      </div>
    </>
  );
}