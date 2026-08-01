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

/* ─────────────────────────────────────────────
   LoveTransition.jsx  — drop-in replacement
   Petals fly in → form "I love you / Rimi"
   Hold 2 s → sparkle blast → fade to home
   Works on any screen size, no distortion
───────────────────────────────────────────── */
function LoveTransition({ active, onDone }) {
  const canvasRef = useRef(null);
  const stateRef  = useRef({ animId: null, doneTimer: null });
  const onDoneRef = useRef(onDone); // ← keep latest onDone without it being a dep

  // keep the ref current without triggering the effect
  useEffect(() => { onDoneRef.current = onDone; }, [onDone]);

  useEffect(() => {
    if (!active) return;

    // cancel any previous run first (guards against Strict Mode double-fire)
    cancelAnimationFrame(stateRef.current.animId);
    clearTimeout(stateRef.current.doneTimer);

    /* ── schedule onDone ── */
    stateRef.current.doneTimer = setTimeout(() => onDoneRef.current?.(), 7800);

    const canvas = canvasRef.current;
    if (!canvas) return;

    /* ── responsive sizing ── */
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const ctx = canvas.getContext("2d");

    const sampleText = (text, fontSize) => {
      const OW = 800, OH = 220;
      const off = document.createElement("canvas");
      off.width = OW; off.height = OH;
      const c = off.getContext("2d");
      c.clearRect(0, 0, OW, OH);
      c.fillStyle = "#fff";
      c.font = `bold ${fontSize}px Georgia, "Times New Roman", serif`;
      c.textAlign    = "center";
      c.textBaseline = "middle";
      c.fillText(text, OW / 2, OH / 2);
      const data = c.getImageData(0, 0, OW, OH).data;
      const pts  = [];
      const step = 7;
      for (let y = 0; y < OH; y += step)
        for (let x = 0; x < OW; x += step)
          if (data[(y * OW + x) * 4 + 3] > 100)
            pts.push({ nx: x / OW, ny: y / OH });
      return pts;
    };

    const rawLine1 = sampleText("I love you", 118);
    const rawLine2 = sampleText("Rimi",        155);

    const buildTargets = () => {
      const W = canvas.width, H = canvas.height;
      const blockW = Math.min(W * 0.88, 680);
      const lineH  = blockW * (220 / 800);
      const gap    = lineH * 0.25;
      const totalH = lineH * 2 + gap;
      const startY = H / 2 - totalH / 2;

      const map = (pts, lineTop) =>
        pts.map(p => ({
          x: W / 2 - blockW / 2 + p.nx * blockW,
          y: lineTop + p.ny * lineH,
        }));

      return [
        ...map(rawLine1, startY),
        ...map(rawLine2, startY + lineH + gap),
      ];
    };

    let targets = buildTargets();

    const PETAL_COLORS = [
      "#F08FA8","#FF85A1","#FBD5DE","#FFB3C6",
      "#F4C77B","#FFD9A0",
      "#C3A6F0","#DDD0FF",
      "#ffffff","#FFF0F5",
    ];

    const W0 = canvas.width, H0 = canvas.height;

    const particles = targets.map((t, i) => {
      const edge = i % 4;
      let sx, sy;
      if      (edge === 0) { sx = Math.random() * W0; sy = -80; }
      else if (edge === 1) { sx = W0 + 80;            sy = Math.random() * H0; }
      else if (edge === 2) { sx = Math.random() * W0; sy = H0 + 80; }
      else                 { sx = -80;                 sy = Math.random() * H0; }

      const angle = Math.atan2(t.y - H0 / 2, t.x - W0 / 2);
      return {
        sx, sy,
        tx: t.x, ty: t.y,
        ex: t.x + Math.cos(angle) * Math.max(W0, H0) * 1.4,
        ey: t.y + Math.sin(angle) * Math.max(W0, H0) * 1.4,
        color : PETAL_COLORS[i % PETAL_COLORS.length],
        type  : i % 3,
        sz    : 5 + Math.random() * 6,
        rot   : Math.random() * Math.PI * 2,
        rotSpd: (Math.random() - 0.5) * 0.05,
        drift : (Math.random() - 0.5) * 2,
        phase : Math.random() * Math.PI * 2,
      };
    });

    const sparks = Array.from({ length: 90 }, (_, i) => {
      const cx = canvas.width / 2, cy = canvas.height / 2;
      const a  = Math.random() * Math.PI * 2;
      const sp = 4 + Math.random() * 8;
      return {
        x: cx, y: cy,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        color: PETAL_COLORS[i % PETAL_COLORS.length],
        sz: 3 + Math.random() * 5,
        life: 1,
        decay: 0.018 + Math.random() * 0.012,
      };
    });

    const drawPetal = (ctx, x, y, sz, rot, color, alpha) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.shadowColor = color;
      ctx.shadowBlur  = sz * 2;
      ctx.fillStyle   = color;
      ctx.beginPath();
      ctx.ellipse(0, -sz * 0.4, sz * 0.28, sz * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawHeart = (ctx, x, y, sz, rot, color, alpha) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.shadowColor = color;
      ctx.shadowBlur  = sz * 2;
      ctx.fillStyle   = color;
      const s = sz * 0.42;
      ctx.beginPath();
      ctx.moveTo(0, s * 0.5);
      ctx.bezierCurveTo( s*1.1, -s*0.5,  s*1.8,  s*0.7, 0,  s*1.8);
      ctx.bezierCurveTo(-s*1.8,  s*0.7, -s*1.1, -s*0.5, 0,  s*0.5);
      ctx.fill();
      ctx.restore();
    };

    const drawStar = (ctx, x, y, sz, rot, color, alpha) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.shadowColor = color;
      ctx.shadowBlur  = sz * 2.5;
      ctx.fillStyle   = color;
      ctx.beginPath();
      for (let k = 0; k < 8; k++) {
        const r = k % 2 === 0 ? sz * 0.52 : sz * 0.22;
        const a = (k * Math.PI) / 4;
        k === 0
          ? ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r)
          : ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const drawParticle = (ctx, x, y, sz, rot, color, alpha, type) => {
      if (type === 1) drawHeart(ctx, x, y, sz, rot, color, alpha);
      else if (type === 2) drawStar(ctx, x, y, sz, rot, color, alpha);
      else drawPetal(ctx, x, y, sz, rot, color, alpha);
    };

    const FPS      = 60;
    const F_GATHER = Math.round(2.5 * FPS);
    const F_HOLD   = Math.round(2.5 * FPS);
    const F_BLAST  = Math.round(0.9 * FPS);
    const F_FADE   = Math.round(1.0 * FPS);
    const F_TOTAL  = F_GATHER + F_HOLD + F_BLAST + F_FADE;

    const easeOut3 = t => 1 - Math.pow(1 - t, 3);
    const easeIn3  = t => t * t * t;

    let frame = 0;
    let sparksActive = false;
    let cancelled = false; // ← guard so cleanup stops the loop cleanly

    const tick = () => {
      if (cancelled) return; // ← stop immediately if cleaned up

      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      frame++;

      if (W !== W0 || H !== H0) {
        const fresh = buildTargets();
        fresh.forEach((t, i) => {
          if (particles[i]) { particles[i].tx = t.x; particles[i].ty = t.y; }
        });
      }

      let ph, lt;
      if      (frame <= F_GATHER)                    { ph = "gather";  lt = frame / F_GATHER; }
      else if (frame <= F_GATHER + F_HOLD)           { ph = "hold";    lt = (frame - F_GATHER) / F_HOLD; }
      else if (frame <= F_GATHER + F_HOLD + F_BLAST) { ph = "blast";   lt = (frame - F_GATHER - F_HOLD) / F_BLAST; }
      else if (frame <= F_TOTAL)                     { ph = "fade";    lt = (frame - F_GATHER - F_HOLD - F_BLAST) / F_FADE; }
      else { cancelAnimationFrame(stateRef.current.animId); return; }

      if (ph === "blast" && !sparksActive) {
        sparksActive = true;
        const cx = W / 2;
        const blockW = Math.min(W * 0.88, 680);
        const lineH  = blockW * (220 / 800);
        const cy     = H / 2;
        sparks.forEach(s => {
          s.x = cx + (Math.random() - 0.5) * blockW * 0.8;
          s.y = cy + (Math.random() - 0.5) * lineH * 2.4;
          const a  = Math.random() * Math.PI * 2;
          const sp = 3 + Math.random() * 10;
          s.vx = Math.cos(a) * sp;
          s.vy = Math.sin(a) * sp;
          s.life = 1;
        });
      }

      particles.forEach((p, i) => {
        p.rot += p.rotSpd;
        let px, py, alpha, sz;

        if (ph === "gather") {
          const e = easeOut3(lt);
          const wobble = Math.sin(lt * Math.PI * 3 + p.phase) * 18 * (1 - lt);
          px    = p.sx + (p.tx - p.sx) * e + wobble * Math.cos(p.rot);
          py    = p.sy + (p.ty - p.sy) * e + wobble * Math.sin(p.rot);
          alpha = lt < 0.08 ? lt / 0.08 : 1;
          sz    = p.sz * (0.4 + e * 0.6);
        } else if (ph === "hold") {
          const breath = Math.sin(frame * 0.07 + p.phase) * 1.6;
          px    = p.tx + breath * 0.6;
          py    = p.ty + Math.cos(frame * 0.055 + p.phase) * 1.1;
          alpha = 0.92 + Math.sin(frame * 0.09 + p.phase) * 0.08;
          sz    = p.sz * (1 + Math.sin(frame * 0.065 + p.phase) * 0.07);
          p.rotSpd = 0.015;
        } else if (ph === "blast") {
          const e = easeIn3(lt);
          px    = p.tx + (p.ex - p.tx) * e;
          py    = p.ty + (p.ey - p.ty) * e;
          alpha = Math.max(0, 1 - e * 1.15);
          sz    = p.sz * (1 + e * 4);
          p.rotSpd *= 1.1;
        } else {
          return;
        }

        drawParticle(ctx, px, py, sz, p.rot, p.color, alpha, p.type);
      });

      if (ph === "blast" || ph === "fade") {
        const globalFade = ph === "fade" ? Math.max(0, 1 - lt) : 1;
        sparks.forEach(s => {
          s.x  += s.vx;
          s.y  += s.vy;
          s.vy += 0.18;
          s.vx *= 0.97;
          s.life = Math.max(0, s.life - s.decay);
          if (s.life <= 0) return;

          ctx.save();
          ctx.globalAlpha = s.life * globalFade;
          ctx.shadowColor = s.color;
          ctx.shadowBlur  = s.sz * 3;
          ctx.fillStyle   = s.color;
          ctx.translate(s.x, s.y);
          ctx.beginPath();
          for (let k = 0; k < 8; k++) {
            const r = k % 2 === 0 ? s.sz : s.sz * 0.35;
            const a = (k * Math.PI) / 4;
            k === 0
              ? ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r)
              : ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
          }
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        });
      }

      stateRef.current.animId = requestAnimationFrame(tick);
    };

    stateRef.current.animId = requestAnimationFrame(tick);

    return () => {
      cancelled = true; // ← stop the loop on cleanup
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(stateRef.current.animId);
      clearTimeout(stateRef.current.doneTimer);
    };
  }, [active]); // ← onDone removed from deps, accessed via ref instead

  if (!active) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position     : "fixed",
        inset        : 0,
        zIndex       : 300,
        background   : "rgba(8, 6, 20, 0.97)",
        animation    : "loveTransFade 7.8s ease forwards",
        overflow     : "hidden",
        pointerEvents: "none",
      }}
    >
      <div style={{
        position    : "absolute",
        left        : "50%",
        top         : "50%",
        transform   : "translate(-50%, -50%)",
        width       : "min(90vw, 700px)",
        height      : "min(60vw, 420px)",
        borderRadius: "50%",
        background  : "radial-gradient(ellipse, rgba(240,143,168,0.20) 0%, transparent 70%)",
        animation   : "loveTransGlow 7.8s ease forwards",
      }} />

      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset   : 0,
          width   : "100%",
          height  : "100%",
          display : "block",
        }}
      />
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