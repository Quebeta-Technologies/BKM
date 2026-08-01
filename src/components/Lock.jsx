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
    }}>{style.glyph}</div>
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

/* Simple beautiful fade — no petals, no doors, no overlapping layers */
function UnlockOverlay({ active, onDone }) {
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(onDone, 2000);
    return () => clearTimeout(t);
  }, [active, onDone]);

  if (!active) return null;

  return (
    <div aria-hidden="true" style={{
      position: "fixed", inset: 0, zIndex: 195,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", pointerEvents: "none",
      animation: "unlockOverlayFade 2s ease forwards",
    }}>
      {/* radial rose glow from centre */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(240,143,168,0.35), transparent 70%)",
        animation: "unlockGlowExpand 1.8s ease forwards",
      }} />

      {/* her name in huge script */}
      <p style={{
        fontFamily: "Parisienne, cursive",
        fontSize: "clamp(3.5rem, 12vw, 7rem)",
        color: "#F08FA8",
        textShadow: "0 0 60px rgba(240,143,168,1), 0 0 120px rgba(240,143,168,0.6)",
        animation: "unlockNamePop 2s ease forwards",
        margin: 0, lineHeight: 1.2, position: "relative", zIndex: 2,
      }}>
        {HER_NAME}
      </p>

      {/* subtitle */}
      <p style={{
        fontFamily: "Jost, sans-serif",
        fontSize: "0.68rem",
        letterSpacing: "0.45em",
        textTransform: "uppercase",
        color: "var(--gold)",
        animation: "unlockSubFade 2s ease 0.3s forwards",
        opacity: 0, marginTop: 16, position: "relative", zIndex: 2,
      }}>
        this is all for you
      </p>

      {/* floating hearts */}
      {Array.from({ length: 16 }, (_, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${5 + i * 6}%`,
          bottom: "-20px",
          fontSize: 14 + Math.random() * 14,
          color: ["#F08FA8","#F4C77B","#C3A6F0","#FBD5DE"][i % 4],
          animation: `unlockHeart ${1.5 + Math.random()}s ease-out ${Math.random() * 0.8}s forwards`,
          "--udrift": `${(Math.random() - 0.5) * 80}px`,
          opacity: 0,
        }}>
          {["♥","♡","✦","❤","✿"][i % 5]}
        </div>
      ))}
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
  const [value, setValue]   = useState("");
  const [wrong, setWrong]   = useState(0);
  const [shake, setShake]   = useState(false);
  const [stage, setStage]   = useState("idle"); // idle → unlocking → gone
  const [phase, setPhase]   = useState(0);
  const [hint, setHint]     = useState(false);
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
      setStage("unlocking");
      onUnlock(); // tell App immediately — Hero starts loading
    } else {
      setWrong((w) => w + 1);
      setShake(true);
      setValue("");
      setTimeout(() => setShake(false), 500);
    }
  };

  if (stage === "gone") return null;

  const message = wrong === 0
    ? null
    : LOCK.wrongMessages[Math.min(wrong - 1, LOCK.wrongMessages.length - 1)];

  return (
    <>
      <UnlockOverlay
        active={stage === "unlocking"}
        onDone={() => setStage("gone")}
      />

      <div
        className="lock"
        style={{
          background: "var(--night)",
          overflow: "hidden",
          opacity: stage === "unlocking" ? 0 : 1,
          filter: stage === "unlocking" ? "blur(20px)" : "none",
          transform: stage === "unlocking" ? "scale(0.96)" : "none",
          transition: stage === "unlocking"
            ? "opacity 0.8s ease, filter 0.8s ease, transform 0.8s ease"
            : "none",
          pointerEvents: stage === "unlocking" ? "none" : "auto",
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
          width: "100%", maxWidth: 460, padding: "0 28px",
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
              animation: stage === "unlocking"
                ? "lockHeartUnlock 0.6s ease forwards"
                : "lockHeartBeat 1.8s ease-in-out infinite",
              textShadow: "0 0 30px rgba(240,143,168,0.8), 0 0 60px rgba(240,143,168,0.4)",
              lineHeight: 1,
            }}>♥</div>
          </div>

          <p className="eyebrow mb-4" style={{ animation: "lockFadeUp 0.8s ease 0.8s both", textAlign: "center" }}>
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

            <button type="submit" style={{
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