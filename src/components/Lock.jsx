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
    <div aria-hidden="true" style={{
      position: "absolute", left: "50%", top: "50%", pointerEvents: "none",
    }}>
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

/* ── THE LOVE TRANSITION ── */
function LoveTransition({ active, onDone }) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);

  useEffect(() => {
    if (!active) return;

    const doneTimer = setTimeout(onDone, 4000);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = canvas.width  = window.innerWidth;
    const H = canvas.height = window.innerHeight;
    const cx = W / 2, cy = H / 2;

    const sparks = Array.from({ length: 120 }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4;
      const color = ["#F08FA8","#F4C77B","#C3A6F0","#FBD5DE","#fff"][Math.floor(Math.random() * 5)];
      return {
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1.5 + Math.random() * 3,
        color, life: 1,
        decay: 0.008 + Math.random() * 0.012,
      };
    });

    const tick = () => {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, W, H);

      sparks.forEach((s) => {
        s.x  += s.vx;
        s.y  += s.vy;
        s.vy += 0.04;
        s.life = Math.max(0, s.life - s.decay);
        if (s.life <= 0) return;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
        ctx.fillStyle = s.color + Math.floor(s.life * 255).toString(16).padStart(2,"0");
        ctx.fill();

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * s.life * 3, 0, Math.PI * 2);
        ctx.fillStyle = s.color + Math.floor(s.life * 0.15 * 255).toString(16).padStart(2,"0");
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);

    return () => {
      clearTimeout(doneTimer);
      cancelAnimationFrame(animRef.current);
    };
  }, [active, onDone]);

  if (!active) return null;

  const petals = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: 12 + Math.random() * 20,
    dur:  2.0 + Math.random() * 2,
    delay: Math.random() * 2.8,
    drift: (Math.random() - 0.5) * 140,
    rot:   Math.random() * 720 - 360,
    glyph: ["🌸","✿","❀","🌺","♥","✦","🌷"][Math.floor(Math.random() * 7)],
    color: ["#F08FA8","#FBD5DE","#F4C77B","#C3A6F0","#fff"][Math.floor(Math.random() * 5)],
  }));

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 300,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column",
      background: "rgba(11,9,24,0.96)",
      animation: "loveTransFade 4s ease forwards",
      overflow: "hidden",
    }}>
      {/* sparkle canvas */}
      <canvas ref={canvasRef} style={{
        position: "absolute", inset: 0,
        width: "100%", height: "100%",
        pointerEvents: "none",
      }} />

      {/* petals raining */}
      {petals.map((p) => (
        <div key={p.id} aria-hidden="true" style={{
          position: "absolute",
          left: p.left, top: "-60px",
          fontSize: p.size,
          color: p.color,
          filter: `drop-shadow(0 0 8px ${p.color})`,
          animation: `loveTransPetal ${p.dur}s ease-in ${p.delay}s forwards`,
          "--pdrift": `${p.drift}px`,
          "--prot": `${p.rot}deg`,
          opacity: 0,
          pointerEvents: "none",
        }}>{p.glyph}</div>
      ))}

      {/* centre glow */}
      <div style={{
        position: "absolute",
        width: "60vw", height: "60vw",
        maxWidth: 500, maxHeight: 500,
        borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(240,143,168,0.35), transparent 70%)",
        animation: "loveTransGlow 4s ease forwards",
        pointerEvents: "none",
      }} />

      {/* "I love you" */}
      <p style={{
        fontFamily: "Parisienne, cursive",
        fontSize: "clamp(2.8rem, 10vw, 6.5rem)",
        color: "#F08FA8",
        textShadow: "0 0 40px rgba(240,143,168,1), 0 0 80px rgba(240,143,168,0.6), 0 0 120px rgba(240,143,168,0.3)",
        margin: 0, lineHeight: 1.2,
        position: "relative", zIndex: 2,
        animation: "loveTransText 4s ease forwards",
      }}>
        I love you
      </p>

      {/* her name */}
      <p style={{
        fontFamily: "Parisienne, cursive",
        fontSize: "clamp(3.5rem, 13vw, 8rem)",
        color: "#F4C77B",
        textShadow: "0 0 40px rgba(244,199,123,1), 0 0 80px rgba(244,199,123,0.5)",
        margin: 0, lineHeight: 1.1,
        position: "relative", zIndex: 2,
        animation: "loveTransName 4s ease 0.15s forwards",
        opacity: 0,
      }}>
        {HER_NAME}
      </p>

      {/* early sparkle dots */}
      {Array.from({ length: 20 }, (_, i) => (
        <div key={i} aria-hidden="true" style={{
          position: "absolute",
          left: `${20 + Math.random() * 60}%`,
          top:  `${25 + Math.random() * 50}%`,
          fontSize: 8 + Math.random() * 14,
          color: ["#F4C77B","#F08FA8","#C3A6F0","#fff"][i % 4],
          animation: `loveTransSpark ${0.8 + Math.random() * 1.2}s ease-out ${Math.random() * 1.5}s forwards`,
          opacity: 0, pointerEvents: "none",
        }}>✦</div>
      ))}

      {/* late sparkles — fire during fade out */}
      {Array.from({ length: 30 }, (_, i) => (
        <div key={`late-${i}`} aria-hidden="true" style={{
          position: "absolute",
          left: `${Math.random() * 100}%`,
          top:  `${Math.random() * 100}%`,
          fontSize: 10 + Math.random() * 18,
          color: ["#F4C77B","#F08FA8","#C3A6F0","#FBD5DE","#fff"][i % 5],
          animation: `loveTransSpark ${0.6 + Math.random()}s ease-out ${1.8 + Math.random() * 1.5}s forwards`,
          opacity: 0, pointerEvents: "none",
        }}>
          {["✦","✧","★","✿","♥","❀"][i % 6]}
        </div>
      ))}
    </div>
  );
}

const BG_HEARTS = Array.from({ length: 18 }, () => ({
  size:  `${0.9 + Math.random() * 1.4}rem`,
  color: ["#F08FA8","#F4C77B","#C3A6F0","#FBD5DE"][Math.floor(Math.random() * 4)],
  left:  `${Math.random() * 100}%`,
  top:   `${Math.random() * 100}%`,
  dur:   5 + Math.random() * 7,
  delay: Math.random() * 6,
  glyph: ["♥","♡","✦","❤","✿"][Math.floor(Math.random() * 5)],
}));

export default function Lock({ onUnlock }) {
  const [value, setValue]         = useState("");
  const [wrong, setWrong]         = useState(0);
  const [shake, setShake]         = useState(false);
  const [stage, setStage]         = useState("idle");
  const [showTrans, setShowTrans] = useState(false);
  const [phase, setPhase]         = useState(0);
  const [hint, setHint]           = useState(false);
  const [gone, setGone]           = useState(false);
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
      setStage("leaving");
      setShowTrans(true);
      onUnlock();
    } else {
      setWrong((w) => w + 1);
      setShake(true);
      setValue("");
      setTimeout(() => setShake(false), 500);
    }
  };

  if (gone) return null;

  const message = wrong === 0
    ? null
    : LOCK.wrongMessages[Math.min(wrong - 1, LOCK.wrongMessages.length - 1)];

  return (
    <>
      <LoveTransition active={showTrans} onDone={() => setGone(true)} />

      <div className="lock" style={{
        background: "var(--night)",
        overflow: "hidden",
        opacity: stage === "leaving" ? 0 : 1,
        filter: stage === "leaving" ? "blur(16px)" : "none",
        transform: stage === "leaving" ? "scale(0.95)" : "none",
        transition: stage === "leaving"
          ? "opacity 0.6s ease, filter 0.6s ease, transform 0.6s ease"
          : "none",
        pointerEvents: stage === "leaving" ? "none" : "auto",
      }}>
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
            <OrbitRing radius={48} count={6} speed={8}  size={5} color="#F08FA8" />
            <OrbitRing radius={36} count={4} speed={14} size={3} color="#F4C77B" />
            <div style={{
              position: "absolute", left: "50%", top: "50%",
              transform: "translate(-50%,-50%)",
              fontFamily: "Parisienne, cursive",
              fontSize: "3.2rem", color: "#F08FA8",
              animation: stage === "leaving"
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
            fontSize: "clamp(2.2rem,6vw,3.5rem)",
            animation: "lockFadeUp 0.8s ease 1s both",
          }}>
            Hello,{" "}
            <span className="script rose" style={{ fontSize: "1.2em" }}>{HER_NAME}</span>
          </h1>

          <p className="soft text-sm leading-relaxed text-center mb-8" style={{
            maxWidth: 340, animation: "lockFadeUp 0.8s ease 1.2s both",
          }}>
            I built you an entire world and locked it,
            because it belongs to you and nobody else.
            The answer is already in your heart.
          </p>

          <div style={{
            display: "flex", alignItems: "center", gap: 14,
            marginBottom: 24, width: "100%",
            animation: "lockFadeUp 0.8s ease 1.35s both",
          }}>
            <div style={{ flex:1, height:1, background:"linear-gradient(90deg,transparent,rgba(244,199,123,0.4))" }} />
            <span style={{ color:"var(--gold)", fontSize:"0.7rem" }}>✦</span>
            <div style={{ flex:1, height:1, background:"linear-gradient(90deg,rgba(244,199,123,0.4),transparent)" }} />
          </div>

          <p style={{
            fontFamily: "Cormorant Garamond,serif",
            fontSize: "1.15rem", color: "var(--gold)",
            textAlign: "center", marginBottom: 20, fontStyle: "italic",
            animation: "lockFadeUp 0.8s ease 1.5s both",
          }}>
            {LOCK.question}
          </p>

          <form onSubmit={submit} className={shake ? "shake" : ""} style={{
            width: "100%", animation: "lockFadeUp 0.8s ease 1.65s both",
          }}>
            <div style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(244,199,123,0.3)",
              borderRadius: 8, overflow: "hidden",
            }}>
              <input
                ref={input}
                className="key-in"
                type="text" inputMode="text"
                autoComplete="off" spellCheck="false"
                placeholder={LOCK.hint}
                aria-label={LOCK.question}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                style={{
                  width:"100%", border:"none", borderBottom:"none",
                  borderRadius:8, padding:"16px 20px", background:"transparent",
                }}
              />
            </div>

            <button type="submit" style={{
              marginTop:16, width:"100%", padding:"16px 0",
              background:"linear-gradient(135deg,rgba(240,143,168,0.18),rgba(195,166,240,0.12))",
              border:"1px solid rgba(240,143,168,0.45)",
              borderRadius:8, color:"var(--cream)",
              fontFamily:"Jost,sans-serif", fontSize:"0.72rem",
              letterSpacing:"0.36em", textTransform:"uppercase",
              cursor:"pointer", transition:"all 0.35s", backdropFilter:"blur(8px)",
            }}
              onMouseEnter={(e) => {
                e.target.style.background = "linear-gradient(135deg,rgba(240,143,168,0.35),rgba(195,166,240,0.25))";
                e.target.style.boxShadow  = "0 0 30px rgba(240,143,168,0.3)";
                e.target.style.transform  = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "linear-gradient(135deg,rgba(240,143,168,0.18),rgba(195,166,240,0.12))";
                e.target.style.boxShadow  = "none";
                e.target.style.transform  = "none";
              }}
            >
              Open it for me ♥
            </button>
          </form>

          <p className="script rose mt-6" style={{
            fontSize:"1.25rem", minHeight:32, textAlign:"center",
            opacity: message ? 1 : 0, transition:"opacity 0.4s",
          }}>
            {message || "\u00A0"}
          </p>

          <p style={{
            fontSize:"0.65rem", letterSpacing:"0.28em", textTransform:"uppercase",
            color:"rgba(195,166,240,0.45)", marginTop:28, textAlign:"center",
            opacity: hint ? 1 : 0, transition:"opacity 1.5s ease",
          }}>
            {LOCK.hint} &nbsp;·&nbsp; the day that changed everything
          </p>
        </div>
      </div>
    </>
  );
}