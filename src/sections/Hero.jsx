import React, { useEffect, useRef, useState, useCallback } from "react";
import { START, START_LABEL } from "../data.js";

const HER_NAME       = "Rimi";
const PARTICLE_COUNT = 500;

/* ─── tiny helpers ─────────────────────────── */
function easeOut(x)   { return 1 - Math.pow(1 - x, 3); }
function easeIn(x)    { return x * x * x; }
function easeInOut(x) { return x < 0.5 ? 4*x*x*x : 1 - Math.pow(-2*x+2,3)/2; }

function sampleLetters(name) {
  const OW = 500, OH = 140;
  const off = document.createElement("canvas");
  off.width = OW; off.height = OH;
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

/* ─── floating petal layer ──────────────────── */
const PETAL_COUNT = 22;
const PETALS = Array.from({ length: PETAL_COUNT }, (_, i) => ({
  id      : i,
  left    : `${Math.random() * 100}%`,
  size    : 0.55 + Math.random() * 0.7,
  color   : ["#F08FA8","#FBD5DE","#FFB3C6","#F4C77B","#C3A6F0","#DDD0FF"][i % 6],
  dur     : 8 + Math.random() * 12,
  delay   : Math.random() * 14,
  drift   : (Math.random() - 0.5) * 120,
  glyph   : ["✿","❀","✾","❁","♥","✦"][i % 6],
  rotate  : Math.random() * 360,
  rotateDur: 6 + Math.random() * 10,
}));

function FloatingPetals() {
  return (
    <div aria-hidden="true" style={{
      position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none", zIndex:1,
    }}>
      {PETALS.map(p => (
        <div key={p.id} style={{
          position   : "absolute",
          left       : p.left,
          top        : "-5%",
          fontSize   : `${p.size}rem`,
          color      : p.color,
          opacity    : 0,
          animation  : `petalFall ${p.dur}s ease-in ${p.delay}s infinite`,
          "--drift"  : `${p.drift}px`,
          "--rot"    : `${p.rotate}deg`,
          "--rotEnd" : `${p.rotate + (Math.random() > 0.5 ? 360 : -360)}deg`,
          filter     : `drop-shadow(0 0 4px ${p.color}88)`,
        }}>
          {p.glyph}
        </div>
      ))}
    </div>
  );
}

/* ─── cursor sparkle trail ──────────────────── */
function CursorTrail() {
  const ref = useRef([]);
  const frameRef = useRef(null);

  useEffect(() => {
    const sparks = [];
    const colors = ["#F08FA8","#F4C77B","#C3A6F0","#FBD5DE","#fff"];

    const onMove = (e) => {
      const x = e.clientX ?? e.touches?.[0]?.clientX;
      const y = e.clientY ?? e.touches?.[0]?.clientY;
      if (x == null) return;
      if (Math.random() > 0.4) return; // throttle
      const el = document.createElement("div");
      el.style.cssText = `
        position:fixed; pointer-events:none; z-index:9999;
        left:${x}px; top:${y}px;
        width:6px; height:6px; border-radius:50%;
        background:${colors[Math.floor(Math.random()*colors.length)]};
        transform:translate(-50%,-50%) scale(1);
        transition:transform 0.6s ease,opacity 0.6s ease;
        box-shadow:0 0 6px currentColor;
      `;
      document.body.appendChild(el);
      sparks.push(el);
      requestAnimationFrame(() => {
        el.style.transform = `translate(${(Math.random()-0.5)*30}px,${-20-Math.random()*20}px) scale(0)`;
        el.style.opacity   = "0";
      });
      setTimeout(() => { el.remove(); }, 650);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
    };
  }, []);

  return null;
}

/* ─── timer digit card with flip animation ──── */
function TimerCard({ value, label, color, icon }) {
  const [prev, setPrev]       = useState(value);
  const [flipping, setFlip]   = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (value !== prev) {
      setFlip(true);
      const t = setTimeout(() => { setPrev(value); setFlip(false); }, 300);
      return () => clearTimeout(t);
    }
  }, [value, prev]);

  const isSpecial = label === "days";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position   : "relative",
        minWidth   : 78,
        padding    : "14px 10px 12px",
        borderRadius: 14,
        background : hovered
          ? `linear-gradient(145deg,${color}22,${color}11)`
          : "rgba(255,255,255,0.04)",
        border     : `1px solid ${hovered ? color + "66" : color + "28"}`,
        backdropFilter: "blur(12px)",
        transition : "all 0.35s cubic-bezier(.2,.8,.3,1)",
        transform  : hovered ? "translateY(-4px) scale(1.06)" : "none",
        boxShadow  : hovered ? `0 8px 32px ${color}33, 0 0 0 1px ${color}22` : "none",
        cursor     : "default",
      }}
    >
      {/* glow ring on hover */}
      {hovered && (
        <div aria-hidden="true" style={{
          position:"absolute", inset:-1, borderRadius:14,
          background:`radial-gradient(ellipse,${color}18,transparent 70%)`,
          animation:"timerGlow 1.2s ease-in-out infinite alternate",
          pointerEvents:"none",
        }} />
      )}

      {/* icon */}
      <div style={{
        fontSize:"0.85rem", marginBottom:4, lineHeight:1,
        filter:`drop-shadow(0 0 6px ${color})`,
        animation: isSpecial ? "heartBeatIcon 1.8s ease-in-out infinite" : "iconFloat 3s ease-in-out infinite",
        animationDelay: `${Math.random() * 1.5}s`,
      }}>
        {icon}
      </div>

      {/* digit */}
      <div style={{
        fontFamily  : "Cormorant Garamond, serif",
        fontSize    : "2.1rem",
        lineHeight  : 1,
        color       : color,
        fontWeight  : 600,
        letterSpacing: "-0.02em",
        textShadow  : `0 0 20px ${color}66`,
        animation   : flipping ? "digitFlip 0.3s ease" : "none",
        minHeight   : "2.1rem",
        display     : "flex",
        alignItems  : "center",
        justifyContent: "center",
      }}>
        {String(value).padStart(2, "0")}
      </div>

      {/* label */}
      <div style={{
        fontSize     : "0.5rem",
        letterSpacing: "0.32em",
        textTransform: "uppercase",
        color        : color,
        opacity      : 0.7,
        marginTop    : 6,
        fontFamily   : "Jost, sans-serif",
      }}>
        {label}
      </div>

      {/* bottom shine */}
      <div style={{
        position:"absolute", bottom:0, left:"15%", right:"15%", height:1,
        background:`linear-gradient(90deg,transparent,${color}55,transparent)`,
        borderRadius:1,
      }} />
    </div>
  );
}

/* ─── animated name with heartbeat glow ─────── */
function AnimatedName({ visible }) {
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    setClicked(true);
    setTimeout(() => setClicked(false), 800);
  };

  return (
    <div style={{ position:"relative", display:"inline-block", margin:"4px 0 22px", cursor:"pointer" }}
      onClick={handleClick}>
      {/* halo */}
      <div aria-hidden="true" style={{
        position    : "absolute",
        inset       : "-30px -60px",
        background  : "radial-gradient(ellipse,rgba(240,143,168,0.28),transparent 70%)",
        borderRadius: "50%",
        animation   : "nameHaloBreath 3s ease-in-out infinite",
        pointerEvents:"none",
      }} />

      {/* extra pop halo on click */}
      {clicked && (
        <div aria-hidden="true" style={{
          position:"absolute", inset:"-60px -100px",
          background:"radial-gradient(ellipse,rgba(240,143,168,0.5),transparent 70%)",
          borderRadius:"50%",
          animation:"namePop 0.8s ease forwards",
          pointerEvents:"none",
        }} />
      )}

      <p className="script rose" style={{
        fontSize    : "clamp(3rem,10vw,7rem)",
        textShadow  : clicked
          ? "0 0 80px rgba(240,143,168,1),0 0 160px rgba(240,143,168,0.6)"
          : "0 0 60px rgba(240,143,168,0.7),0 0 120px rgba(240,143,168,0.3)",
        opacity     : visible ? 1 : 0,
        transform   : visible ? "none" : "translateY(20px) scale(0.88)",
        transition  : "all 1.2s cubic-bezier(.2,.8,.3,1) 0.5s, text-shadow 0.3s ease",
        lineHeight  : 1.1,
        position    : "relative",
        animation   : "nameFloat 4s ease-in-out infinite",
        userSelect  : "none",
      }}>
        {HER_NAME}
      </p>

      {/* tiny hearts that pop on click */}
      {clicked && ["♥","♡","✦"].map((g, i) => (
        <div key={i} aria-hidden="true" style={{
          position  : "absolute",
          left      : `${30 + i * 20}%`,
          top       : "10%",
          fontSize  : "1rem",
          color     : ["#F08FA8","#F4C77B","#C3A6F0"][i],
          animation : `heartPop${i} 0.8s ease forwards`,
          pointerEvents:"none",
        }}>{g}</div>
      ))}
    </div>
  );
}

/* ─── main component ─────────────────────────── */
export default function Hero() {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const timerRef  = useRef(null);
  const [phase, setPhase]         = useState("galaxy");
  const [contentIn, setContentIn] = useState(false);
  const [now, setNow]             = useState(() => Date.now());
  const [scrollY, setScrollY]     = useState(0);
  const [titleHovered, setTitleHovered] = useState(false);

  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* ── galaxy animation (unchanged logic, same as before) ── */
  useEffect(() => {
    if (phase !== "galaxy") return;

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
        const scale  = Math.min(W / pt.ow, H / pt.oh) * 0.65;
        const offX   = cx - (pt.ow / 2) * scale;
        const offY   = cy - (pt.oh / 2) * scale - H * 0.04;
        const tx     = pt.x * scale + offX;
        const ty     = pt.y * scale + offY;
        const ox     = cx + Math.cos(angle) * radius;
        const oy     = cy + Math.sin(angle) * radius;

        return {
          ox, oy, tx, ty,
          color      : colors[Math.floor(Math.random() * colors.length)],
          size       : 2.5 + Math.random() * 3.5,
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

          if (p.trail.length > 1) {
            for (let i = 1; i < p.trail.length; i++) {
              const a = (i / p.trail.length) * 0.15 * alpha;
              ctx.beginPath();
              ctx.moveTo(p.trail[i-1].x, p.trail[i-1].y);
              ctx.lineTo(p.trail[i].x,   p.trail[i].y);
              ctx.strokeStyle = p.color + Math.floor(a * 255).toString(16).padStart(2,"0");
              ctx.lineWidth   = sz * 0.5;
              ctx.stroke();
            }
          }

          ctx.beginPath();
          ctx.arc(px, py, Math.max(0.3, sz), 0, Math.PI * 2);
          ctx.fillStyle = p.color + Math.floor(Math.min(1, alpha) * 255).toString(16).padStart(2,"0");
          ctx.fill();

          if (alpha > 0.3) {
            ctx.beginPath();
            ctx.arc(px, py, sz * 2.8, 0, Math.PI * 2);
            ctx.fillStyle = p.color + Math.floor(alpha * 0.1 * 255).toString(16).padStart(2,"0");
            ctx.fill();
          }
        });

        animRef.current = requestAnimationFrame(tick);
      };

      animRef.current = requestAnimationFrame(tick);
    }, 300);

    return () => {
      clearTimeout(timerRef.current);
      cancelAnimationFrame(animRef.current);
    };
  }, [phase]);

  /* ── time calculation ── */
  const ms = now - new Date(START).getTime();
  const units = [
    { value: Math.floor(ms / 86400000),     label: "days",    color: "#F08FA8", icon: "♥" },
    { value: Math.floor(ms / 3600000) % 24, label: "hours",   color: "#F4C77B", icon: "✦" },
    { value: Math.floor(ms / 60000) % 60,   label: "minutes", color: "#C3A6F0", icon: "✿" },
    { value: Math.floor(ms / 1000) % 60,    label: "seconds", color: "#FBD5DE", icon: "❀" },
  ];

  /* ── ambient orbs ── */
  const ORBS = [
    { size:420, pos:{ left:"-4%",  top:"3%"    }, color:"#4A2A6B", anim:"drift1 22s ease-in-out infinite",        blur:90 },
    { size:300, pos:{ right:"-3%", top:"18%"   }, color:"#8E3D63", anim:"drift2 28s ease-in-out 1.5s infinite",   blur:80 },
    { size:240, pos:{ left:"22%",  bottom:"5%" }, color:"#2E3A7A", anim:"drift1 34s ease-in-out 0.8s infinite",   blur:85 },
    { size:180, pos:{ right:"20%", bottom:"20%"}, color:"#6B2A4A", anim:"drift2 19s ease-in-out 3s infinite",     blur:70 },
  ];

  return (
    <header className="min-h-screen relative overflow-hidden flex items-center justify-center">

      <style>{`
        @keyframes petalFall {
          0%   { opacity:0; transform:translateY(0) translateX(0) rotate(0deg); }
          5%   { opacity:0.7; }
          85%  { opacity:0.5; }
          100% { opacity:0; transform:translateY(105vh) translateX(var(--drift)) rotate(var(--rotEnd)); }
        }
        @keyframes nameFloat {
          0%,100% { transform:translateY(0); }
          50%     { transform:translateY(-8px); }
        }
        @keyframes nameHaloBreath {
          0%,100% { opacity:0.6; transform:scale(1); }
          50%     { opacity:1;   transform:scale(1.08); }
        }
        @keyframes namePop {
          0%   { opacity:0.8; transform:scale(1); }
          50%  { opacity:1;   transform:scale(1.15); }
          100% { opacity:0;   transform:scale(1.4); }
        }
        @keyframes heartBeatIcon {
          0%,100% { transform:scale(1); }
          14%     { transform:scale(1.3); }
          28%     { transform:scale(1); }
          42%     { transform:scale(1.2); }
          70%     { transform:scale(1); }
        }
        @keyframes iconFloat {
          0%,100% { transform:translateY(0) rotate(0deg); }
          50%     { transform:translateY(-3px) rotate(8deg); }
        }
        @keyframes digitFlip {
          0%   { opacity:0; transform:translateY(-12px) scale(0.8); }
          100% { opacity:1; transform:translateY(0)    scale(1); }
        }
        @keyframes timerGlow {
          0%   { opacity:0.5; }
          100% { opacity:1; }
        }
        @keyframes heartPop0 {
          0%   { opacity:1; transform:translate(0,0) scale(1); }
          100% { opacity:0; transform:translate(-30px,-50px) scale(0.4); }
        }
        @keyframes heartPop1 {
          0%   { opacity:1; transform:translate(0,0) scale(1); }
          100% { opacity:0; transform:translate(10px,-60px) scale(0.4); }
        }
        @keyframes heartPop2 {
          0%   { opacity:1; transform:translate(0,0) scale(1); }
          100% { opacity:0; transform:translate(35px,-45px) scale(0.4); }
        }
        @keyframes subtitleReveal {
          0%   { opacity:0; letter-spacing:0.5em; }
          100% { opacity:1; letter-spacing:0.1em; }
        }
        @keyframes shimmer {
          0%   { background-position:200% center; }
          100% { background-position:-200% center; }
        }
        @keyframes dividerGrow {
          0%   { width:0; opacity:0; }
          100% { width:100%; opacity:1; }
        }
        @keyframes scrollBounce {
          0%,100% { transform:translateX(-50%) translateY(0); }
          50%     { transform:translateX(-50%) translateY(8px); }
        }
        @keyframes starTwinkle {
          0%,100% { opacity:0.2; transform:scale(0.8); }
          50%     { opacity:1;   transform:scale(1.2); }
        }
      `}</style>

      {/* cursor sparkle trail */}
      <CursorTrail />

      {/* galaxy canvas */}
      <canvas ref={canvasRef} style={{
        position:"absolute", inset:0,
        width:"100%", height:"100%",
        opacity: phase === "galaxy" ? 1 : 0,
        transition:"opacity 1.1s ease",
        pointerEvents:"none",
        zIndex:0,
      }} />

      {/* ambient background stars */}
      {phase === "content" && (
        <div aria-hidden="true" style={{
          position:"absolute", inset:0, pointerEvents:"none", zIndex:0, overflow:"hidden",
        }}>
          {Array.from({length:28},(_, i)=>(
            <div key={i} style={{
              position:"absolute",
              left:`${Math.random()*100}%`,
              top:`${Math.random()*100}%`,
              width: i%5===0 ? 3 : 2,
              height: i%5===0 ? 3 : 2,
              borderRadius:"50%",
              background:["#F08FA8","#F4C77B","#C3A6F0","#fff"][i%4],
              animation:`starTwinkle ${3+Math.random()*4}s ease-in-out ${Math.random()*3}s infinite`,
              boxShadow:`0 0 4px currentColor`,
            }}/>
          ))}
        </div>
      )}

      {/* skip button */}
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

      {/* ── CONTENT PHASE ── */}
      {phase === "content" && (
        <>
          {/* floating petals */}
          <FloatingPetals />

          {/* ambient orbs */}
          {ORBS.map((o, i) => (
            <div key={i} aria-hidden="true" style={{
              position:"fixed", zIndex:0,
              width:o.size, height:o.size, borderRadius:"50%",
              background:`radial-gradient(circle,${o.color},transparent 70%)`,
              ...o.pos,
              filter:`blur(${o.blur}px)`, opacity:0.6,
              animation:o.anim, pointerEvents:"none",
            }} />
          ))}

          <div className="text-center px-6 relative z-10 w-full" style={{ maxWidth:740 }}>

            {/* eyebrow */}
            <p className="eyebrow mb-5" style={{
              opacity    : contentIn ? 1 : 0,
              transform  : contentIn ? "none" : "translateY(20px)",
              transition : "all 1s ease 0.1s",
              animation  : contentIn ? "subtitleReveal 1.2s ease 0.1s both" : "none",
            }}>
              Girlfriend's Day &nbsp;·&nbsp; for one girl in particular
            </p>

            {/* headline */}
            <h1
              className="display mb-2"
              onMouseEnter={() => setTitleHovered(true)}
              onMouseLeave={() => setTitleHovered(false)}
              style={{
                fontSize   : "clamp(2rem,6vw,4.5rem)",
                opacity    : contentIn ? 1 : 0,
                transform  : contentIn ? "none" : "translateY(20px)",
                transition : "all 1s ease 0.3s, text-shadow 0.3s ease",
                textShadow : titleHovered
                  ? "0 0 40px rgba(240,143,168,0.4)"
                  : "none",
                cursor     : "default",
              }}
            >
              Happy Girlfriend's Day,
            </h1>

            {/* name */}
            <AnimatedName visible={contentIn} />

            {/* body */}
            <p className="soft max-w-md mx-auto leading-relaxed mb-3" style={{
              fontSize   : "clamp(0.88rem,2vw,1rem)",
              opacity    : contentIn ? 1 : 0,
              transform  : contentIn ? "none" : "translateY(16px)",
              transition : "all 1s ease 0.75s",
            }}>
              I couldn't fit it in a message. I couldn't fit it in a card.
              So I built you the whole sky instead.
            </p>

            {/* shimmer divider */}
            <div style={{
              height:1, marginBottom:28, marginTop:6,
              background:"linear-gradient(90deg,transparent,rgba(244,199,123,0.5) 30%,rgba(240,143,168,0.5) 70%,transparent)",
              opacity: contentIn ? 1 : 0,
              transition:"opacity 1s ease 0.9s",
              backgroundSize:"200% auto",
              animation: contentIn ? "shimmer 3s linear infinite" : "none",
            }}/>

            {/* timer */}
            <div style={{
              opacity  : contentIn ? 1 : 0,
              transform: contentIn ? "none" : "translateY(16px)",
              transition:"all 1s ease 1s",
            }}>
              <p className="eyebrow mb-4" style={{ fontSize:"0.58rem", letterSpacing:"0.35em" }}>
                ✦ &nbsp; we have been us for &nbsp; ✦
              </p>

              <div style={{
                display:"flex", gap:10, justifyContent:"center",
                flexWrap:"wrap",
              }}>
                {units.map(u => (
                  <TimerCard key={u.label} {...u} />
                ))}
              </div>

              <p className="soft text-xs mt-4 tracking-widest" style={{
                opacity:0.35, fontSize:"0.6rem",
              }}>
                {START_LABEL}
              </p>
            </div>

            {/* closing line */}
            <p className="script" style={{
              fontSize   : "clamp(1.05rem,2.5vw,1.35rem)",
              color      : "var(--lilac)",
              marginTop  : 18,
              opacity    : contentIn ? 0.8 : 0,
              transition : "all 1s ease 1.3s",
              textShadow : "0 0 18px rgba(195,166,240,0.4)",
              animation  : contentIn ? "nameFloat 5s ease-in-out 1.5s infinite" : "none",
            }}>
              and so, so much more to show you ✦
            </p>
          </div>
        </>
      )}

      {/* scroll arrow */}
      {phase === "content" && (
        <button
          onClick={() => window.scrollBy({ top:window.innerHeight*0.88, behavior:"smooth" })}
          aria-label="Scroll down"
          style={{
            position   : "absolute", bottom:22, left:"50%",
            background : "none", border:"none", cursor:"pointer",
            animation  : "scrollBounce 2.2s ease-in-out infinite",
            opacity    : scrollY > 60 ? 0 : 0.58,
            transition : "opacity 0.5s",
            display    : "flex", flexDirection:"column", alignItems:"center", gap:3,
            zIndex     : 10,
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