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
    const doneTimer = setTimeout(onDone, 7000);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const W = canvas.width  = window.innerWidth;
    const H = canvas.height = window.innerHeight;
    const cx = W / 2;
    const cy = H / 2;

    /* ── Step 1: Sample text on a FIXED 600x200 canvas ── */
    const sampleLine = (text, fontSize) => {
      const OW = 600, OH = 200;
      const off = document.createElement("canvas");
      off.width = OW; off.height = OH;
      const c = off.getContext("2d");
      c.clearRect(0, 0, OW, OH);
      c.fillStyle = "#fff";
      c.font = `bold ${fontSize}px Georgia, serif`;
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText(text, OW / 2, OH / 2);
      const data = c.getImageData(0, 0, OW, OH).data;
      const pts = [];
      /* step of 6 gives ~200-400 points per line */
      for (let y = 0; y < OH; y += 6)
        for (let x = 0; x < OW; x += 6)
          if (data[(y * OW + x) * 4 + 3] > 128)
            pts.push({ nx: x / OW, ny: y / OH }); /* normalised 0-1 */
      return pts;
    };

    /* normalised points — then map to screen below */
    const raw1 = sampleLine("I love you", 110);
    const raw2 = sampleLine("Rimi", 150);

    /* how wide/tall to render on screen */
    const blockW = Math.min(W * 0.85, 640);
    const blockH = blockW * (200 / 600); /* maintain aspect */
    const gap    = blockH * 0.18;
    const top1   = cy - blockH - gap / 2;
    const top2   = cy + gap / 2;

    const toScreen = (nx, ny, top) => ({
      x: cx - blockW / 2 + nx * blockW,
      y: top + ny * blockH,
    });

    const pts1 = raw1.map(p => toScreen(p.nx, p.ny, top1));
    const pts2 = raw2.map(p => toScreen(p.nx, p.ny, top2));
    const allPts = [...pts1, ...pts2];

    if (allPts.length === 0) return;

    const COLORS = ["#F08FA8","#FF85A1","#FBD5DE","#F4C77B","#C3A6F0","#fff","#FFB3C6"];

    /* draw a single petal/heart/star */
    const drawShape = (ctx, x, y, sz, rot, color, alpha, type) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.shadowColor = color;
      ctx.shadowBlur  = sz * 1.5;
      ctx.fillStyle   = color;

      if (type === 0) {
        /* heart ♥ */
        const s = sz * 0.45;
        ctx.beginPath();
        ctx.moveTo(0, s * 0.4);
        ctx.bezierCurveTo( s*1.1, -s*0.4,  s*1.8,  s*0.6, 0,  s*1.7);
        ctx.bezierCurveTo(-s*1.8,  s*0.6, -s*1.1, -s*0.4, 0,  s*0.4);
        ctx.fill();
      } else if (type === 1) {
        /* 5-petal flower */
        for (let k = 0; k < 5; k++) {
          ctx.save();
          ctx.rotate((k * Math.PI * 2) / 5);
          ctx.beginPath();
          ctx.ellipse(0, -sz * 0.45, sz * 0.22, sz * 0.48, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        ctx.beginPath();
        ctx.arc(0, 0, sz * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
      } else if (type === 2) {
        /* 4-point star */
        ctx.beginPath();
        for (let k = 0; k < 8; k++) {
          const r = k % 2 === 0 ? sz * 0.55 : sz * 0.2;
          const a = (k * Math.PI) / 4;
          k === 0 ? ctx.moveTo(Math.cos(a)*r, Math.sin(a)*r)
                  : ctx.lineTo(Math.cos(a)*r, Math.sin(a)*r);
        }
        ctx.closePath();
        ctx.fill();
      } else {
        /* glowing circle */
        ctx.beginPath();
        ctx.arc(0, 0, sz * 0.42, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    /* each particle starts scattered randomly around screen edge */
    const particles = allPts.map((pt, i) => {
      const edge = Math.floor(Math.random() * 4);
      let sx, sy;
      if      (edge === 0) { sx = Math.random() * W; sy = -60; }
      else if (edge === 1) { sx = W + 60; sy = Math.random() * H; }
      else if (edge === 2) { sx = Math.random() * W; sy = H + 60; }
      else                 { sx = -60; sy = Math.random() * H; }

      const angle = Math.atan2(pt.y - cy, pt.x - cx);
      return {
        sx, sy,
        tx: pt.x, ty: pt.y,
        /* explode back outward from target in same direction it came from */
        ex: pt.x + Math.cos(angle) * Math.max(W, H),
        ey: pt.y + Math.sin(angle) * Math.max(W, H),
        color : COLORS[i % COLORS.length],
        type  : i % 4,
        sz    : 7 + Math.random() * 7,
        rot   : Math.random() * Math.PI * 2,
        rotSpd: (Math.random() - 0.5) * 0.06,
      };
    });

    /* phases in frames at 60fps */
    const F_GATHER  = 150; /* 2.5s — fly in */
    const F_HOLD    = 120; /* 2.0s — hold as text */
    const F_EXPLODE =  80; /* 1.3s — blast out */
    const F_TOTAL   = F_GATHER + F_HOLD + F_EXPLODE;
    let f = 0;

    const easeOut   = t => 1 - Math.pow(1 - t, 3);
    const easeIn    = t => t * t * t;
    const easeInOut = t => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;

    const tick = () => {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, W, H);
      f++;

      let ph, lt;
      if      (f <= F_GATHER)            { ph = "gather";  lt = f / F_GATHER; }
      else if (f <= F_GATHER + F_HOLD)   { ph = "hold";    lt = (f - F_GATHER) / F_HOLD; }
      else if (f <= F_TOTAL)             { ph = "explode"; lt = (f - F_GATHER - F_HOLD) / F_EXPLODE; }
      else { cancelAnimationFrame(animRef.current); return; }

      particles.forEach((p, i) => {
        p.rot += p.rotSpd;
        let px, py, alpha, sz;

        if (ph === "gather") {
          const e = easeOut(lt);
          px    = p.sx + (p.tx - p.sx) * e;
          py    = p.sy + (p.ty - p.sy) * e;
          alpha = e;
          sz    = p.sz * (0.5 + e * 0.5);

        } else if (ph === "hold") {
          /* gentle pulse in place */
          const pulse = Math.sin(f * 0.08 + i * 0.3) * 1.5;
          px    = p.tx + pulse;
          py    = p.ty + Math.cos(f * 0.06 + i * 0.2) * 1.0;
          alpha = 0.9 + Math.sin(f * 0.1 + i * 0.15) * 0.1;
          sz    = p.sz * (1 + Math.sin(f * 0.07 + i * 0.1) * 0.08);
          p.rotSpd = 0.02;

        } else {
          const e = easeIn(lt);
          px    = p.tx + (p.ex - p.tx) * e;
          py    = p.ty + (p.ey - p.ty) * e;
          alpha = Math.max(0, 1 - e * 1.2);
          sz    = p.sz * (1 + e * 3);
          p.rotSpd *= 1.12;
        }

        drawShape(ctx, px, py, sz, p.rot, p.color, alpha, p.type);
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
      animation: "loveTransFade 7s ease forwards",
      overflow: "hidden", pointerEvents: "none",
    }}>
      <div aria-hidden="true" style={{
        position: "absolute", left: "50%", top: "50%",
        transform: "translate(-50%,-50%)",
        width: "80vw", height: "60vw",
        maxWidth: 700, maxHeight: 500,
        borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(240,143,168,0.18), transparent 70%)",
        animation: "loveTransGlow 7s ease forwards",
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