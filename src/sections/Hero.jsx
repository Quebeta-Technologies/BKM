import React, { useEffect, useRef, useState } from "react";
import { START, START_LABEL } from "../data.js";

const HER_NAME = "Rimi";
const PARTICLE_COUNT = 280;

function easeOut(x) { return 1 - Math.pow(1 - x, 3); }
function easeIn(x)  { return x * x * x; }
function easeInOut(x) { return x < 0.5 ? 4*x*x*x : 1 - Math.pow(-2*x+2,3)/2; }

export default function Hero() {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const [phase, setPhase]       = useState("galaxy");
  const [contentIn, setContentIn] = useState(false);
  const [now, setNow]           = useState(() => Date.now());
  const [scrollY, setScrollY]   = useState(0);

  /* ── Counter ── */
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);
  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* ── Galaxy canvas ── */
  useEffect(() => {
    if (phase !== "galaxy") return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const W = canvas.width  = window.innerWidth;
    const H = canvas.height = window.innerHeight;
    const cx = W / 2;
    const cy = H / 2;

    /* Sample letter pixels AFTER font loads */
    const sampleLetters = () => {
      const off = document.createElement("canvas");
      const OW = 600, OH = 160;
      off.width = OW; off.height = OH;
      const c = off.getContext("2d");
      c.clearRect(0, 0, OW, OH);
      c.fillStyle = "#fff";
      /* use a font we know is loaded */
      const fs = Math.min(OW * 0.28, 130);
      c.font = `300 ${fs}px Cormorant Garamond, Georgia, serif`;
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText(HER_NAME, OW / 2, OH / 2);
      const data = c.getImageData(0, 0, OW, OH).data;
      const pts  = [];
      const step = 3;
      for (let y = 0; y < OH; y += step)
        for (let x = 0; x < OW; x += step)
          if (data[(y * OW + x) * 4 + 3] > 100)
            pts.push({ x, y, ow: OW, oh: OH });
      return pts;
    };

    const buildParticles = (pts) => {
      const colors = ["#F08FA8","#F4C77B","#C3A6F0","#FBD5DE","#fff","#FFD6E0","#E8C5FF"];
      return Array.from({ length: PARTICLE_COUNT }, () => {
        const angle  = Math.random() * Math.PI * 2;
        const radius = 60 + Math.random() * Math.min(W, H) * 0.36;
        const pt     = pts.length ? pts[Math.floor(Math.random() * pts.length)] : { x: cx, y: cy, ow: 1, oh: 1 };

        /* scale letter coords to canvas */
        const scale = Math.min(W / pt.ow, H / pt.oh) * 0.55;
        const offX  = cx - (pt.ow / 2) * scale;
        const offY  = cy - (pt.oh / 2) * scale - H * 0.04;
        const tx    = pt.x * scale + offX;
        const ty    = pt.y * scale + offY;

        const ox = cx + Math.cos(angle) * radius;
        const oy = cy + Math.sin(angle) * radius;
        return {
          ox, oy, tx, ty,
          x: ox, y: oy,
          color: colors[Math.floor(Math.random() * colors.length)],
          size : 0.9 + Math.random() * 2,
          orbitAngle: angle,
          orbitRadius: radius,
          orbitSpeed : (Math.random() - 0.5) * 0.009,
          twinkle    : Math.random() * Math.PI * 2,
          twinkleSpd : 0.05 + Math.random() * 0.08,
          trail      : [],
          sx : cx + (Math.random() - 0.5) * W * 1.6,
          sy : cy + (Math.random() - 0.5) * H * 1.6,
        };
      });
    };

    /* Wait for Cormorant Garamond to load, then start */
    const start = (pts) => {
      const particles = buildParticles(pts);
      const SWIRL = 160, FORM = 110, HOLD = 100, SCATTER = 70;
      const TOTAL = SWIRL + FORM + HOLD + SCATTER;
      let t = 0;

      const tick = () => {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, W, H);
        t++;

        let phase, localT;
        if      (t <= SWIRL)                    { phase = "swirl";   localT = t / SWIRL; }
        else if (t <= SWIRL + FORM)             { phase = "form";    localT = (t - SWIRL) / FORM; }
        else if (t <= SWIRL + FORM + HOLD)      { phase = "hold";    localT = (t - SWIRL - FORM) / HOLD; }
        else if (t <= TOTAL)                    { phase = "scatter"; localT = (t - SWIRL - FORM - HOLD) / SCATTER; }
        else {
          cancelAnimationFrame(animRef.current);
          setPhase("content");
          setTimeout(() => setContentIn(true), 80);
          return;
        }

        particles.forEach((p) => {
          p.twinkle     += p.twinkleSpd;
          p.orbitAngle  += p.orbitSpeed;

          let px, py, alpha, sz;

          if (phase === "swirl") {
            const pull = easeInOut(localT) * 0.55;
            px    = cx + Math.cos(p.orbitAngle) * p.orbitRadius * (1 - pull * 0.35);
            py    = cy + Math.sin(p.orbitAngle) * p.orbitRadius * (1 - pull * 0.35);
            alpha = 0.3 + Math.sin(p.twinkle) * 0.35 + localT * 0.25;
            sz    = p.size * (0.8 + Math.sin(p.twinkle) * 0.3);
            p.trail.push({ x: px, y: py });
            if (p.trail.length > 7) p.trail.shift();
          } else if (phase === "form") {
            const e = easeOut(localT);
            px    = p.ox + (p.tx - p.ox) * e;
            py    = p.oy + (p.ty - p.oy) * e;
            alpha = 0.5 + e * 0.5;
            sz    = p.size * (1 + (1 - e) * 0.6);
            p.trail = [];
          } else if (phase === "hold") {
            px    = p.tx + Math.sin(p.twinkle * 0.7) * 1.2;
            py    = p.ty + Math.cos(p.twinkle * 0.5) * 1.2;
            alpha = 0.85 + Math.sin(p.twinkle) * 0.15;
            sz    = p.size * (1 + Math.sin(p.twinkle * 1.1) * 0.22);
            p.trail = [];
          } else {
            const e = easeIn(localT);
            px    = p.tx + (p.sx - p.tx) * e;
            py    = p.ty + (p.sy - p.ty) * e;
            alpha = Math.max(0, 1 - e * 1.5);
            sz    = p.size * (1 + e * 2.2);
            p.trail = [];
          }

          /* trails */
          if (p.trail.length > 1) {
            for (let i = 1; i < p.trail.length; i++) {
              const a = (i / p.trail.length) * 0.2 * alpha;
              ctx.beginPath();
              ctx.moveTo(p.trail[i-1].x, p.trail[i-1].y);
              ctx.lineTo(p.trail[i].x,   p.trail[i].y);
              ctx.strokeStyle = p.color + Math.floor(a * 255).toString(16).padStart(2,"0");
              ctx.lineWidth   = sz * 0.5;
              ctx.stroke();
            }
          }

          /* particle */
          ctx.beginPath();
          ctx.arc(px, py, Math.max(0.1, sz), 0, Math.PI * 2);
          ctx.fillStyle = p.color + Math.floor(Math.min(1, alpha) * 255).toString(16).padStart(2,"0");
          ctx.fill();

          /* glow */
          if (alpha > 0.4) {
            ctx.beginPath();
            ctx.arc(px, py, sz * 2.8, 0, Math.PI * 2);
            ctx.fillStyle = p.color + Math.floor(alpha * 0.12 * 255).toString(16).padStart(2,"0");
            ctx.fill();
          }
        });

        /* crisp name text fades in during hold */
        if (phase === "hold") {
          const a  = Math.min(1, localT * 2.5);
          const fs = Math.min(W * 0.2, H * 0.22, 180);
          ctx.save();
          ctx.globalAlpha = a * 0.92;
          ctx.font        = `400 ${fs}px Parisienne, cursive`;
          ctx.textAlign   = "center";
          ctx.textBaseline= "middle";
          ctx.shadowColor = "rgba(240,143,168,0.9)";
          ctx.shadowBlur  = 50;
          ctx.fillStyle   = "#F08FA8";
          ctx.fillText(HER_NAME, cx, cy - H * 0.04);
          ctx.shadowBlur  = 100;
          ctx.globalAlpha = a * 0.25;
          ctx.fillText(HER_NAME, cx, cy - H * 0.04);
          ctx.restore();
        }

        animRef.current = requestAnimationFrame(tick);
      };

      animRef.current = requestAnimationFrame(tick);
    };

    /* Font loading — try document.fonts first, fallback to timeout */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        setTimeout(() => start(sampleLetters()), 100);
      });
    } else {
      setTimeout(() => start(sampleLetters()), 800);
    }

    return () => cancelAnimationFrame(animRef.current);
  }, [phase]);

  const ms = now - new Date(START).getTime();
  const units = [
    [Math.floor(ms / 86400000),       "days"],
    [Math.floor(ms / 3600000) % 24,   "hours"],
    [Math.floor(ms / 60000) % 60,     "minutes"],
    [Math.floor(ms / 1000) % 60,      "seconds"],
  ];

  const ORBS = [
    { size:380, left:"2%",  top:"5%",    color:"#4A2A6B", delay:0,   a:`drift1 22s ease-in-out infinite` },
    { size:280, right:"2%", top:"20%",   color:"#8E3D63", delay:1.5, a:`drift2 28s ease-in-out 1.5s infinite` },
    { size:220, left:"25%", bottom:"8%", color:"#2E3A7A", delay:0.8, a:`drift1 34s ease-in-out 0.8s infinite` },
  ];

  return (
    <header className="min-h-screen relative overflow-hidden flex items-center justify-center">

      {/* Canvas */}
      <canvas ref={canvasRef} style={{
        position:"absolute", inset:0,
        width:"100%", height:"100%",
        opacity: phase === "galaxy" ? 1 : 0,
        transition:"opacity 1s ease",
        pointerEvents:"none",
      }} />

      {/* Skip */}
      {phase === "galaxy" && (
        <button onClick={() => {
          cancelAnimationFrame(animRef.current);
          setPhase("content");
          setTimeout(() => setContentIn(true), 80);
        }} style={{
          position:"absolute", bottom:28, right:24, zIndex:10,
          background:"rgba(255,255,255,0.06)",
          border:"1px solid rgba(244,199,123,0.3)",
          borderRadius:20, color:"rgba(244,199,123,0.7)",
          fontFamily:"Jost,sans-serif", fontSize:"0.6rem",
          letterSpacing:"0.28em", textTransform:"uppercase",
          padding:"8px 18px", cursor:"pointer",
          backdropFilter:"blur(8px)",
          animation:"lockFadeUp 1s ease 3s both",
        }}>skip ›</button>
      )}

      {/* Content */}
      {phase === "content" && (
        <div className="text-center px-6 relative z-10 w-full" style={{ maxWidth:720 }}>

          {/* Ambient orbs */}
          {ORBS.map((o,i) => (
            <div key={i} aria-hidden="true" style={{
              position:"fixed",
              width:o.size, height:o.size, borderRadius:"50%",
              background:`radial-gradient(circle,${o.color},transparent 70%)`,
              left:o.left, right:o.right, top:o.top, bottom:o.bottom,
              filter:"blur(80px)", opacity:0.65,
              animation:o.a, pointerEvents:"none", zIndex:0,
            }} />
          ))}

          <div style={{ position:"relative", zIndex:2 }}>

            <p className="eyebrow mb-5" style={{
              opacity: contentIn ? 1 : 0,
              transform: contentIn ? "none" : "translateY(20px)",
              transition:"all 1s ease 0.1s",
            }}>
              Girlfriend&rsquo;s Day &nbsp;·&nbsp; for one girl in particular
            </p>

            <h1 className="display mb-2" style={{
              fontSize:"clamp(2rem,6vw,4.5rem)",
              opacity: contentIn ? 1 : 0,
              transform: contentIn ? "none" : "translateY(20px)",
              transition:"all 1s ease 0.3s",
            }}>
              Happy Girlfriend&rsquo;s Day,
            </h1>

            {/* Name with breathing glow */}
            <div style={{ position:"relative", display:"inline-block", margin:"4px 0 24px" }}>
              <div aria-hidden="true" style={{
                position:"absolute", inset:"-30px -60px",
                background:"radial-gradient(ellipse,rgba(240,143,168,0.3),transparent 70%)",
                borderRadius:"50%",
                animation:"nameHaloBreath 3s ease-in-out infinite",
              }} />
              <p className="script rose" style={{
                fontSize:"clamp(3rem,10vw,7rem)",
                textShadow:"0 0 60px rgba(240,143,168,0.7),0 0 120px rgba(240,143,168,0.3)",
                opacity: contentIn ? 1 : 0,
                transform: contentIn ? "none" : "translateY(20px) scale(0.88)",
                transition:"all 1.2s cubic-bezier(.2,.8,.3,1) 0.5s",
                lineHeight:1.1, position:"relative",
              }}>
                {HER_NAME}
              </p>
            </div>

            <p className="soft max-w-md mx-auto leading-relaxed mb-8" style={{
              fontSize:"clamp(0.88rem,2vw,1rem)",
              opacity: contentIn ? 1 : 0,
              transform: contentIn ? "none" : "translateY(16px)",
              transition:"all 1s ease 0.75s",
            }}>
              I couldn&rsquo;t fit it in a message. I couldn&rsquo;t fit it in a card.
              So I built you the whole sky instead.
            </p>

            {/* Counter */}
            <div style={{
              opacity: contentIn ? 1 : 0,
              transform: contentIn ? "none" : "translateY(16px)",
              transition:"all 1s ease 1s",
            }}>
              <p className="eyebrow mb-3">We have been us for</p>
              <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" }}>
                {units.map(([value, label]) => (
                  <div key={label} style={{
                    minWidth:76, padding:"12px 8px",
                    border:"1px solid rgba(244,199,123,0.22)",
                    borderRadius:6,
                    background:"rgba(255,255,255,0.03)",
                    backdropFilter:"blur(8px)",
                  }}>
                    <span key={value} style={{
                      display:"block",
                      fontFamily:"Cormorant Garamond,serif",
                      fontSize:"1.9rem", lineHeight:1,
                      color: label === "days" ? "var(--rose)" : "var(--cream)",
                      animation:"tickFlip 0.25s ease",
                      textShadow: label === "days" ? "0 0 20px rgba(240,143,168,0.4)" : "none",
                    }}>
                      {String(value).padStart(2,"0")}
                    </span>
                    <em style={{
                      display:"block", fontStyle:"normal",
                      fontSize:"0.56rem", letterSpacing:"0.28em",
                      textTransform:"uppercase",
                      color: label === "days" ? "var(--rose)" : "var(--gold)",
                      opacity:0.85, marginTop:7,
                    }}>{label}</em>
                  </div>
                ))}
              </div>
              <p className="soft text-xs mt-3 tracking-widest opacity-45">{START_LABEL}</p>
            </div>

            <p className="script" style={{
              fontSize:"clamp(1.1rem,2.5vw,1.4rem)",
              color:"var(--lilac)", marginTop:18,
              opacity: contentIn ? 0.8 : 0,
              transition:"all 1s ease 1.3s",
              textShadow:"0 0 20px rgba(195,166,240,0.4)",
            }}>
              and so, so much more to show you ✦
            </p>
          </div>
        </div>
      )}

      {/* Scroll arrow */}
      {phase === "content" && (
        <button
          onClick={() => window.scrollBy({ top: window.innerHeight * 0.88, behavior:"smooth" })}
          aria-label="Scroll down"
          style={{
            position:"absolute", bottom:24, left:"50%",
            transform:"translateX(-50%)",
            background:"none", border:"none", cursor:"pointer",
            animation:"bounceArrow 2.2s ease-in-out infinite",
            opacity: scrollY > 60 ? 0 : 0.6,
            transition:"opacity 0.5s",
            display:"flex", flexDirection:"column", alignItems:"center", gap:4,
            zIndex:10,
          }}
        >
          <span style={{
            fontSize:"0.52rem", letterSpacing:"0.3em",
            textTransform:"uppercase", color:"var(--gold)", opacity:0.7,
          }}>scroll</span>
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <path d="M5 9 L13 17 L21 9" stroke="#F4C77B" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
    </header>
  );
}