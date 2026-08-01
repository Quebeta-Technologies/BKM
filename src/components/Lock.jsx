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
    const doneTimer = setTimeout(onDone, 5500);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = canvas.width  = window.innerWidth;
    const H = canvas.height = window.innerHeight;
    const cx = W / 2;
    const cy = H / 2;

    /* ── sample text pixels ── */
    const sampleText = (text, fontSize, yOffset) => {
      const off = document.createElement("canvas");
      off.width = W; off.height = 220;
      const c = off.getContext("2d");
      c.clearRect(0, 0, W, 220);
      c.fillStyle = "#fff";
      c.font = `bold ${fontSize}px Georgia, serif`;
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText(text, W / 2, 110);
      const data = c.getImageData(0, 0, W, 220).data;
      const pts = [];
      const step = Math.max(3, Math.floor(W / 120));
      for (let y = 0; y < 220; y += step)
        for (let x = 0; x < W; x += step)
          if (data[(y * W + x) * 4 + 3] > 100)
            pts.push({ x, y: y + yOffset });
      return pts;
    };

    const fs1 = Math.min(W * 0.09, 72);
    const fs2 = Math.min(W * 0.13, 100);
    const line1Y = cy - fs1 * 0.8;
    const line2Y = cy + fs2 * 0.55;

    const pts1 = sampleText("I love you", fs1, line1Y - 110);
    const pts2 = sampleText("Rimi", fs2, line2Y - 110);
    const allPts = [...pts1, ...pts2];

    if (allPts.length === 0) { cancelAnimationFrame(animRef.current); return; }

    const COLORS = [
      "#F08FA8","#F08FA8","#FBD5DE","#F4C77B",
      "#C3A6F0","#fff","#FFB3C6","#FF85A1",
    ];

    /* draw a petal shape */
    const drawPetal = (ctx, x, y, size, rot, color, alpha, shape) => {
      ctx.save();
      ctx.globalAlpha = Math.min(1, Math.max(0, alpha));
      ctx.translate(x, y);
      ctx.rotate(rot);

      if (shape === 0) {
        /* heart */
        const s = size * 0.5;
        ctx.beginPath();
        ctx.moveTo(0, s * 0.3);
        ctx.bezierCurveTo(s, -s * 0.3, s * 1.5, s * 0.8, 0, s * 1.6);
        ctx.bezierCurveTo(-s * 1.5, s * 0.8, -s, -s * 0.3, 0, s * 0.3);
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = size * 1.2;
        ctx.fill();

      } else if (shape === 1) {
        /* 4-petal flower */
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = size;
        for (let i = 0; i < 4; i++) {
          ctx.save();
          ctx.rotate((i * Math.PI) / 2);
          ctx.beginPath();
          ctx.ellipse(0, -size * 0.5, size * 0.3, size * 0.55, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.25, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();

      } else if (shape === 2) {
        /* star/sparkle */
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = size * 1.5;
        const spikes = 6;
        ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
          const r = i % 2 === 0 ? size * 0.55 : size * 0.22;
          const a = (i * Math.PI) / spikes;
          i === 0 ? ctx.moveTo(Math.cos(a)*r, Math.sin(a)*r)
                  : ctx.lineTo(Math.cos(a)*r, Math.sin(a)*r);
        }
        ctx.closePath();
        ctx.fill();

      } else {
        /* simple glowing circle */
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = size * 1.4;
        ctx.fill();
      }

      ctx.restore();
    };

    /* build particles */
    const particles = allPts.map((pt, i) => {
      const angle = Math.random() * Math.PI * 2;
      const dist  = Math.min(W, H) * (0.4 + Math.random() * 0.6);
      const color = COLORS[i % COLORS.length];
      const shape = i % 4; /* cycle through shapes */
      return {
        sx: cx + Math.cos(angle) * dist,
        sy: cy + Math.sin(angle) * dist,
        tx: pt.x, ty: pt.y,
        ex: cx + Math.cos(angle) * dist * 3,
        ey: cy + Math.sin(angle) * dist * 3,
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        color, shape,
        size: 6 + Math.random() * 6,
        rot: Math.random() * Math.PI * 2,
        rotSpd: (Math.random() - 0.5) * 0.08,
        alpha: 0,
        swirl: Math.random() * Math.PI * 2,
      };
    });

    const GATHER = 90, HOLD = 80, EXPLODE = 60;
    const TOTAL = GATHER + HOLD + EXPLODE;
    let t = 0;

    const easeOut   = x => 1 - Math.pow(1 - x, 3);
    const easeIn    = x => x * x * x;
    const easeInOut = x => x < 0.5 ? 4*x*x*x : 1 - Math.pow(-2*x+2,3)/2;

    const tick = () => {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, W, H);
      t++;

      let ph, lt;
      if      (t <= GATHER)              { ph = "gather";  lt = t / GATHER; }
      else if (t <= GATHER + HOLD)       { ph = "hold";    lt = (t - GATHER) / HOLD; }
      else if (t <= TOTAL)               { ph = "explode"; lt = (t - GATHER - HOLD) / EXPLODE; }
      else {
        cancelAnimationFrame(animRef.current);
        return;
      }

      particles.forEach((p, i) => {
        p.rot += p.rotSpd;
        let px, py, alpha, sz;

        if (ph === "gather") {
          const e = easeInOut(lt);
          const swirl = (1 - e) * Math.PI * 0.6;
          px    = p.sx + (p.tx - p.sx) * e + Math.sin(swirl + i * 0.08) * 40 * (1 - e);
          py    = p.sy + (p.ty - p.sy) * e + Math.cos(swirl + i * 0.08) * 30 * (1 - e);
          alpha = 0.15 + e * 0.85;
          sz    = p.size * (0.4 + e * 0.6);

        } else if (ph === "hold") {
          const breath = Math.sin(t * 0.09 + i * 0.25) * 1.8;
          px    = p.tx + breath;
          py    = p.ty + Math.cos(t * 0.07 + i * 0.2) * 1.2;
          alpha = 0.88 + Math.sin(t * 0.1 + i * 0.18) * 0.12;
          sz    = p.size * (1 + Math.sin(t * 0.065 + i * 0.12) * 0.1);
          /* slow rotation during hold */
          p.rotSpd = Math.sin(t * 0.02 + i) * 0.03;

        } else {
          const e = easeIn(lt);
          px    = p.tx + (p.ex - p.tx) * e;
          py    = p.ty + (p.ey - p.ty) * e + e * e * 80;
          alpha = Math.max(0, 1 - e * 1.3);
          sz    = p.size * (1 + e * 2.5);
          p.rotSpd = p.rotSpd * 1.1 + 0.05;
        }

        drawPetal(ctx, px, py, sz, p.rot, p.color, alpha, p.shape);
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

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 300,
      background: "rgba(8,6,20,0.97)",
      animation: "loveTransFade 5.5s ease forwards",
      overflow: "hidden", pointerEvents: "none",
    }}>
      <div aria-hidden="true" style={{
        position: "absolute", left: "50%", top: "50%",
        transform: "translate(-50%,-50%)",
        width: "70vw", height: "50vw",
        maxWidth: 600, maxHeight: 400,
        borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(240,143,168,0.2), transparent 70%)",
        animation: "loveTransGlow 5.5s ease forwards",
      }} />
      <canvas ref={canvasRef} style={{
        position: "absolute", inset: 0,
        width: "100%", height: "100%",
      }} />
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