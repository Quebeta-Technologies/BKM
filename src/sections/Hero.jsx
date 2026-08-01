import React, { useEffect, useRef, useState } from "react";
import { START, START_LABEL } from "../data.js";

const HER_NAME = "Rimi";
const PARTICLE_COUNT = 380;

function easeOut(x)   { return 1 - Math.pow(1 - x, 3); }
function easeIn(x)    { return x * x * x; }
function easeInOut(x) { return x < 0.5 ? 4*x*x*x : 1 - Math.pow(-2*x+2,3)/2; }

function sampleLetters(name) {
  const OW = 500, OH = 140;
  const off = document.createElement("canvas");
  off.width  = OW;
  off.height = OH;
  const c = off.getContext("2d");
  c.clearRect(0, 0, OW, OH);
  c.fillStyle    = "#fff";
  c.font         = `300 90px Georgia, serif`;
  c.textAlign    = "center";
  c.textBaseline = "middle";
  c.fillText(name, OW / 2, OH / 2);
  const data = c.getImageData(0, 0, OW, OH).data;
  const pts  = [];
  for (let y = 0; y < OH; y += 2)
    for (let x = 0; x < OW; x += 2)
      if (data[(y * OW + x) * 4 + 3] > 80)
        pts.push({ x, y, ow: OW, oh: OH });
  return pts;
}

export default function Hero() {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const timerRef  = useRef(null);
  const [phase, setPhase]         = useState("galaxy");
  const [contentIn, setContentIn] = useState(false);
  const [now, setNow]             = useState(() => Date.now());
  const [scrollY, setScrollY]     = useState(0);

  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    if (phase !== "galaxy") return;

    /* 100ms delay — lets canvas mount and paint on ALL devices */
    timerRef.current = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const W = window.innerWidth;
      const H = window.innerHeight;
      canvas.width        = W;
      canvas.height       = H;
      canvas.style.width  = W + "px";
      canvas.style.height = H + "px";

      const cx = W / 2;
      const cy = H / 2;

      const pts    = sampleLetters(HER_NAME);
      const colors = ["#F08FA8","#F4C77B","#C3A6F0","#FBD5DE","#fff","#FFD6E0","#E8C5FF"];
      const maxR   = Math.min(cx, cy) * 0.88;

      const particles = Array.from({ length: PARTICLE_COUNT }, () => {
        const angle  = Math.random() * Math.PI * 2;
        const radius = maxR * (0.2 + Math.random() * 0.8);
        const pt     = pts.length
          ? pts[Math.floor(Math.random() * pts.length)]
          : { x: cx, y: cy, ow: 1, oh: 1 };
        const scale  = Math.min(W / pt.ow, H / pt.oh) * 0.50;
        const offX   = cx - (pt.ow / 2) * scale;
        const offY   = cy - (pt.oh / 2) * scale - H * 0.04;
        const tx     = pt.x * scale + offX;
        const ty     = pt.y * scale + offY;
        const ox     = cx + Math.cos(angle) * radius;
        const oy     = cy + Math.sin(angle) * radius;

        return {
          ox, oy, tx, ty,
          color      : colors[Math.floor(Math.random() * colors.length)],
          size       : 1.2 + Math.random() * 2,
          orbitAngle : angle,
          orbitRadius: radius,
          orbitSpeed : (Math.random() - 0.5) * 0.009,
          twinkle    : Math.random() * Math.PI * 2,
          twinkleSpd : 0.05 + Math.random() * 0.08,
          trail      : [],
          sx         : cx + (Math.random() - 0.5) * W * 1.6,
          sy         : cy + (Math.random() - 0.5) * H * 1.6,
        };
      });

      const SWIRL = 150, FORM = 110, HOLD = 110, SCATTER = 65;
      const TOTAL = SWIRL + FORM + HOLD + SCATTER;
      let t = 0;

      const tick = () => {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, W, H);
        t++;

        let ph, lt;
        if      (t <= SWIRL)           { ph="swirl";   lt=t/SWIRL; }
        else if (t <= SWIRL+FORM)      { ph="form";    lt=(t-SWIRL)/FORM; }
        else if (t <= SWIRL+FORM+HOLD) { ph="hold";    lt=(t-SWIRL-FORM)/HOLD; }
        else if (t <= TOTAL)           { ph="scatter"; lt=(t-SWIRL-FORM-HOLD)/SCATTER; }
        else {
          cancelAnimationFrame(animRef.current);
          setPhase("content");
          setTimeout(() => setContentIn(true), 80);
          return;
        }

        particles.forEach((p) => {
          p.twinkle    += p.twinkleSpd;
          p.orbitAngle += p.orbitSpeed;
          let px, py, alpha, sz;

          if (ph === "swirl") {
            const pull = easeInOut(lt) * 0.5;
            px    = cx + Math.cos(p.orbitAngle) * p.orbitRadius * (1 - pull * 0.4);
            py    = cy + Math.sin(p.orbitAngle) * p.orbitRadius * (1 - pull * 0.4);
            alpha = 0.25 + Math.sin(p.twinkle) * 0.3 + lt * 0.28;
            sz    = p.size * (0.7 + Math.sin(p.twinkle) * 0.3);
            p.trail.push({ x: px, y: py });
            if (p.trail.length > 7) p.trail.shift();

          } else if (ph === "form") {
            const e = easeOut(lt);
            px    = p.ox + (p.tx - p.ox) * e;
            py    = p.oy + (p.ty - p.oy) * e;
            alpha = 0.4 + e * 0.6;
            sz    = p.size * (1 + (1 - e) * 0.8);
            p.trail = [];

          } else if (ph === "hold") {
            /* particles gently breathe in place — NO text overlay */
            px    = p.tx + Math.sin(p.twinkle * 0.7) * 0.8;
            py    = p.ty + Math.cos(p.twinkle * 0.5) * 0.8;
            alpha = 0.8 + Math.sin(p.twinkle) * 0.2;
            sz    = p.size * (1 + Math.sin(p.twinkle * 1.1) * 0.2);
            p.trail = [];

          } else {
            const e = easeIn(lt);
            px    = p.tx + (p.sx - p.tx) * e;
            py    = p.ty + (p.sy - p.ty) * e;
            alpha = Math.max(0, 1 - e * 1.6);
            sz    = p.size * (1 + e * 2.2);
            p.trail = [];
          }

          /* trails */
          if (p.trail.length > 1) {
            for (let i = 1; i < p.trail.length; i++) {
              const a = (i / p.trail.length) * 0.15 * alpha;
              ctx.beginPath();
              ctx.moveTo(p.trail[i-1].x, p.trail[i-1].y);
              ctx.lineTo(p.trail[i].x,   p.trail[i].y);
              ctx.strokeStyle = p.color + Math.floor(a * 255).toString(16).padStart(2,"00");
              ctx.lineWidth   = sz * 0.5;
              ctx.stroke();
            }
          }

          /* particle dot */
          ctx.beginPath();
          ctx.arc(px, py, Math.max(0.3, sz), 0, Math.PI * 2);
          ctx.fillStyle = p.color + Math.floor(Math.min(1, alpha) * 255).toString(16).padStart(2,"00");
          ctx.fill();

          /* soft glow */
          if (alpha > 0.3) {
            ctx.beginPath();
            ctx.arc(px, py, sz * 2.8, 0, Math.PI * 2);
            ctx.fillStyle = p.color + Math.floor(alpha * 0.1 * 255).toString(16).padStart(2,"00");
            ctx.fill();
          }
        });

        /* NO fillText here — particles only form the name */

        animRef.current = requestAnimationFrame(tick);
      };

      animRef.current = requestAnimationFrame(tick);
    }, 100);

    return () => {
      clearTimeout(timerRef.current);
      cancelAnimationFrame(animRef.current);
    };
  }, [phase]);

  const ms = now - new Date(START).getTime();
  const units = [
    [Math.floor(ms / 86400000),     "days"],
    [Math.floor(ms / 3600000) % 24, "hours"],
    [Math.floor(ms / 60000) % 60,   "minutes"],
    [Math.floor(ms / 1000) % 60,    "seconds"],
  ];

  const ORBS = [
    { size:380, pos:{ left:"2%",  top:"5%"    }, color:"#4A2A6B", anim:"drift1 22s ease-in-out infinite" },
    { size:280, pos:{ right:"2%", top:"20%"   }, color:"#8E3D63", anim:"drift2 28s ease-in-out 1.5s infinite" },
    { size:220, pos:{ left:"25%", bottom:"8%" }, color:"#2E3A7A", anim:"drift1 34s ease-in-out 0.8s infinite" },
  ];

  return (
    <header className="min-h-screen relative overflow-hidden flex items-center justify-center">

      <canvas ref={canvasRef} style={{
        position:"absolute", inset:0,
        width:"100%", height:"100%",
        opacity: phase === "galaxy" ? 1 : 0,
        transition:"opacity 1.1s ease",
        pointerEvents:"none",
      }} />

      {phase === "galaxy" && (
        <button onClick={() => {
          clearTimeout(timerRef.current);
          cancelAnimationFrame(animRef.current);
          setPhase("content");
          setTimeout(() => setContentIn(true), 80);
        }} style={{
          position:"absolute", bottom:28, right:22, zIndex:10,
          background:"rgba(255,255,255,0.05)",
          border:"1px solid rgba(244,199,123,0.3)",
          borderRadius:20, color:"rgba(244,199,123,0.7)",
          fontFamily:"Jost,sans-serif", fontSize:"0.6rem",
          letterSpacing:"0.28em", textTransform:"uppercase",
          padding:"8px 18px", cursor:"pointer",
          backdropFilter:"blur(8px)",
          animation:"lockFadeUp 1s ease 2s both",
        }}>skip ›</button>
      )}

      {phase === "content" && (
        <div className="text-center px-6 relative z-10 w-full" style={{ maxWidth:720 }}>
          {ORBS.map((o, i) => (
            <div key={i} aria-hidden="true" style={{
              position:"fixed", zIndex:0,
              width:o.size, height:o.size, borderRadius:"50%",
              background:`radial-gradient(circle,${o.color},transparent 70%)`,
              ...o.pos,
              filter:"blur(80px)", opacity:0.65,
              animation:o.anim, pointerEvents:"none",
            }} />
          ))}

          <div style={{ position:"relative", zIndex:2 }}>
            <p className="eyebrow mb-5" style={{
              opacity:contentIn?1:0,
              transform:contentIn?"none":"translateY(20px)",
              transition:"all 1s ease 0.1s",
            }}>
              Girlfriend&rsquo;s Day &nbsp;·&nbsp; for one girl in particular
            </p>

            <h1 className="display mb-2" style={{
              fontSize:"clamp(2rem,6vw,4.5rem)",
              opacity:contentIn?1:0,
              transform:contentIn?"none":"translateY(20px)",
              transition:"all 1s ease 0.3s",
            }}>
              Happy Girlfriend&rsquo;s Day,
            </h1>

            <div style={{ position:"relative", display:"inline-block", margin:"4px 0 22px" }}>
              <div aria-hidden="true" style={{
                position:"absolute", inset:"-28px -55px",
                background:"radial-gradient(ellipse,rgba(240,143,168,0.3),transparent 70%)",
                borderRadius:"50%",
                animation:"nameHaloBreath 3s ease-in-out infinite",
              }} />
              <p className="script rose" style={{
                fontSize:"clamp(3rem,10vw,7rem)",
                textShadow:"0 0 60px rgba(240,143,168,0.7),0 0 120px rgba(240,143,168,0.3)",
                opacity:contentIn?1:0,
                transform:contentIn?"none":"translateY(20px) scale(0.88)",
                transition:"all 1.2s cubic-bezier(.2,.8,.3,1) 0.5s",
                lineHeight:1.1, position:"relative",
              }}>
                {HER_NAME}
              </p>
            </div>

            <p className="soft max-w-md mx-auto leading-relaxed mb-7" style={{
              fontSize:"clamp(0.88rem,2vw,1rem)",
              opacity:contentIn?1:0,
              transform:contentIn?"none":"translateY(16px)",
              transition:"all 1s ease 0.75s",
            }}>
              I couldn&rsquo;t fit it in a message. I couldn&rsquo;t fit it in a card.
              So I built you the whole sky instead.
            </p>

            <div style={{
              opacity:contentIn?1:0,
              transform:contentIn?"none":"translateY(16px)",
              transition:"all 1s ease 1s",
            }}>
              <p className="eyebrow mb-3">We have been us for</p>
              <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" }}>
                {units.map(([value, label]) => (
                  <div key={label} style={{
                    minWidth:74, padding:"11px 8px",
                    border:"1px solid rgba(244,199,123,0.22)",
                    borderRadius:6,
                    background:"rgba(255,255,255,0.03)",
                    backdropFilter:"blur(8px)",
                  }}>
                    <span key={value} style={{
                      display:"block",
                      fontFamily:"Cormorant Garamond,serif",
                      fontSize:"1.85rem", lineHeight:1,
                      color:label==="days"?"var(--rose)":"var(--cream)",
                      animation:"tickFlip 0.25s ease",
                      textShadow:label==="days"?"0 0 18px rgba(240,143,168,0.45)":"none",
                    }}>
                      {String(value).padStart(2,"0")}
                    </span>
                    <em style={{
                      display:"block", fontStyle:"normal",
                      fontSize:"0.55rem", letterSpacing:"0.28em",
                      textTransform:"uppercase",
                      color:label==="days"?"var(--rose)":"var(--gold)",
                      opacity:0.82, marginTop:7,
                    }}>{label}</em>
                  </div>
                ))}
              </div>
              <p className="soft text-xs mt-3 tracking-widest opacity-40">{START_LABEL}</p>
            </div>

            <p className="script" style={{
              fontSize:"clamp(1.05rem,2.5vw,1.35rem)",
              color:"var(--lilac)", marginTop:16,
              opacity:contentIn?0.8:0,
              transition:"all 1s ease 1.3s",
              textShadow:"0 0 18px rgba(195,166,240,0.4)",
            }}>
              and so, so much more to show you ✦
            </p>
          </div>
        </div>
      )}

      {phase === "content" && (
        <button
          onClick={() => window.scrollBy({ top:window.innerHeight*0.88, behavior:"smooth" })}
          aria-label="Scroll down"
          style={{
            position:"absolute", bottom:22, left:"50%",
            transform:"translateX(-50%)",
            background:"none", border:"none", cursor:"pointer",
            animation:"bounceArrow 2.2s ease-in-out infinite",
            opacity:scrollY>60?0:0.58,
            transition:"opacity 0.5s",
            display:"flex", flexDirection:"column", alignItems:"center", gap:3,
            zIndex:10,
          }}
        >
          <span style={{
            fontSize:"0.5rem", letterSpacing:"0.3em",
            textTransform:"uppercase", color:"var(--gold)", opacity:0.65,
          }}>scroll</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M4 8 L12 16 L20 8" stroke="#F4C77B" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
    </header>
  );
}