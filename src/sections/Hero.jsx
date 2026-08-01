import React, { useEffect, useRef, useState, useMemo } from "react";
import { START, START_LABEL } from "../data.js";

const HER_NAME = "Rimi";
const PARTICLE_COUNT = 320;

/* ── Canvas Galaxy Hero ── */
export default function Hero() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const stateRef = useRef("swirl"); // swirl → form → hold → scatter → content
  const progressRef = useRef(0);
  const particlesRef = useRef([]);
  const timeRef = useRef(0);

  const [phase, setPhase] = useState("galaxy"); // galaxy → content
  const [contentIn, setContentIn] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [scrollY, setScrollY] = useState(0);

  /* ── Build target letter positions from text ── */
  const letterTargets = useMemo(() => {
    const offscreen = document.createElement("canvas");
    offscreen.width = 800;
    offscreen.height = 200;
    const ctx = offscreen.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.font = "bold 160px Cormorant Garamond, Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(HER_NAME, 400, 100);
    const data = ctx.getImageData(0, 0, 800, 200).data;
    const points = [];
    for (let y = 0; y < 200; y += 4) {
      for (let x = 0; x < 800; x += 4) {
        if (data[(y * 800 + x) * 4 + 3] > 128) {
          points.push({ x, y });
        }
      }
    }
    return points;
  }, []);

  /* ── Init particles ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = canvas.width = window.innerWidth;
    const H = canvas.height = window.innerHeight;
    const cx = W / 2;
    const cy = H / 2;

    // Scale letter targets to canvas
    const scaleX = W / 800;
    const scaleY = H / 200;
    const scale = Math.min(scaleX, scaleY) * 0.7;
    const offX = cx - 400 * scale;
    const offY = cy - 100 * scale - 40;

    const targets = letterTargets.map((p) => ({
      x: p.x * scale + offX,
      y: p.y * scale + offY,
    }));

    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const radius = 80 + Math.random() * (Math.min(W, H) * 0.38);
      const target = targets[Math.floor(Math.random() * targets.length)] || { x: cx, y: cy };
      const hue = Math.random();
      const colors = ["#F08FA8","#F4C77B","#C3A6F0","#FBD5DE","#fff","#FFD6E0","#E8C5FF"];
      return {
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
        originX: cx + Math.cos(angle) * radius,
        originY: cy + Math.sin(angle) * radius,
        targetX: target.x,
        targetY: target.y,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 0.8 + Math.random() * 2.2,
        speed: 0.3 + Math.random() * 0.7,
        orbitAngle: angle,
        orbitRadius: radius,
        orbitSpeed: (Math.random() - 0.5) * 0.008,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.05 + Math.random() * 0.08,
        trail: [],
        scatterX: cx + (Math.random() - 0.5) * W * 1.5,
        scatterY: cy + (Math.random() - 0.5) * H * 1.5,
      };
    });

    let t = 0;
    const PHASES = { swirl: 180, form: 120, hold: 90, scatter: 80 };

    const draw = () => {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, W, H);
      t++;
      timeRef.current = t;

      let currentPhase = "swirl";
      let localT = t;
      if (t < PHASES.swirl) {
        currentPhase = "swirl";
        localT = t / PHASES.swirl;
      } else if (t < PHASES.swirl + PHASES.form) {
        currentPhase = "form";
        localT = (t - PHASES.swirl) / PHASES.form;
      } else if (t < PHASES.swirl + PHASES.form + PHASES.hold) {
        currentPhase = "hold";
        localT = (t - PHASES.swirl - PHASES.form) / PHASES.hold;
      } else if (t < PHASES.swirl + PHASES.form + PHASES.hold + PHASES.scatter) {
        currentPhase = "scatter";
        localT = (t - PHASES.swirl - PHASES.form - PHASES.hold) / PHASES.scatter;
      } else {
        cancelAnimationFrame(animRef.current);
        setPhase("content");
        setTimeout(() => setContentIn(true), 100);
        return;
      }

      // Easing
      const easeOut = (x) => 1 - Math.pow(1 - x, 3);
      const easeIn = (x) => x * x * x;
      const easeInOut = (x) => x < 0.5 ? 4*x*x*x : 1 - Math.pow(-2*x+2,3)/2;

      particlesRef.current.forEach((p) => {
        p.twinkle += p.twinkleSpeed;
        p.orbitAngle += p.orbitSpeed;

        let px, py, alpha, size;

        if (currentPhase === "swirl") {
          // Orbit and swirl inward
          const pull = easeInOut(localT) * 0.6;
          const orbX = cx + Math.cos(p.orbitAngle) * p.orbitRadius * (1 - pull * 0.4);
          const orbY = cy + Math.sin(p.orbitAngle) * p.orbitRadius * (1 - pull * 0.4);
          px = orbX;
          py = orbY;
          alpha = 0.3 + Math.sin(p.twinkle) * 0.4 + localT * 0.3;
          size = p.size * (0.8 + Math.sin(p.twinkle) * 0.3);

          // Trails during swirl
          p.trail.push({ x: px, y: py });
          if (p.trail.length > 6) p.trail.shift();

        } else if (currentPhase === "form") {
          // Snap to letter shape
          const ease = easeOut(localT);
          px = p.originX + (p.targetX - p.originX) * ease;
          py = p.originY + (p.targetY - p.originY) * ease;
          alpha = 0.5 + ease * 0.5;
          size = p.size * (1 + (1 - ease) * 0.5);
          p.trail = [];

        } else if (currentPhase === "hold") {
          // Hold in name shape — gentle pulse
          px = p.targetX + Math.sin(p.twinkle * 0.8) * 1.5;
          py = p.targetY + Math.cos(p.twinkle * 0.6) * 1.5;
          alpha = 0.85 + Math.sin(p.twinkle) * 0.15;
          size = p.size * (1 + Math.sin(p.twinkle * 1.2) * 0.25);
          p.trail = [];

        } else {
          // Scatter outward
          const ease = easeIn(localT);
          px = p.targetX + (p.scatterX - p.targetX) * ease;
          py = p.targetY + (p.scatterY - p.targetY) * ease;
          alpha = Math.max(0, 1 - ease * 1.4);
          size = p.size * (1 + ease * 2);
          p.trail = [];
        }

        // Draw trail
        if (p.trail.length > 1) {
          for (let i = 1; i < p.trail.length; i++) {
            const a = (i / p.trail.length) * 0.25 * alpha;
            ctx.beginPath();
            ctx.moveTo(p.trail[i-1].x, p.trail[i-1].y);
            ctx.lineTo(p.trail[i].x, p.trail[i].y);
            ctx.strokeStyle = p.color + Math.floor(a * 255).toString(16).padStart(2,"0");
            ctx.lineWidth = size * 0.6;
            ctx.stroke();
          }
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(px, py, Math.max(0.1, size), 0, Math.PI * 2);
        const alphaHex = Math.floor(Math.min(1, alpha) * 255).toString(16).padStart(2, "0");
        ctx.fillStyle = p.color + alphaHex;
        ctx.fill();

        // Glow
        if (alpha > 0.5) {
          ctx.beginPath();
          ctx.arc(px, py, size * 2.5, 0, Math.PI * 2);
          const glowAlpha = Math.floor(alpha * 0.15 * 255).toString(16).padStart(2, "0");
          ctx.fillStyle = p.color + glowAlpha;
          ctx.fill();
        }
      });

      // During "hold" — draw the name in text too so it's crisp
      if (currentPhase === "hold") {
        const textAlpha = Math.min(1, localT * 3);
        ctx.save();
        ctx.globalAlpha = textAlpha * 0.9;
        ctx.font = `300 ${Math.min(W * 0.18, 160)}px Parisienne, cursive`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#F08FA8";
        ctx.shadowColor = "rgba(240,143,168,0.8)";
        ctx.shadowBlur = 40;
        ctx.fillText(HER_NAME, W / 2, H / 2 - 40);
        ctx.shadowBlur = 80;
        ctx.globalAlpha = textAlpha * 0.3;
        ctx.fillText(HER_NAME, W / 2, H / 2 - 40);
        ctx.restore();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [letterTargets]);

  /* ── Counter ── */
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const ms = now - new Date(START).getTime();
  const units = [
    [Math.floor(ms / 86400000), "days"],
    [Math.floor(ms / 3600000) % 24, "hours"],
    [Math.floor(ms / 60000) % 60, "minutes"],
    [Math.floor(ms / 1000) % 60, "seconds"],
  ];

  return (
    <header className="min-h-screen relative overflow-hidden flex items-center justify-center"
      style={{ background: "var(--night)" }}>

      {/* Galaxy canvas — shown during galaxy phase */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          opacity: phase === "galaxy" ? 1 : 0,
          transition: "opacity 1.2s ease",
          pointerEvents: "none",
        }}
      />

      {/* Skip button during galaxy */}
      {phase === "galaxy" && (
        <button
          onClick={() => {
            cancelAnimationFrame(animRef.current);
            setPhase("content");
            setTimeout(() => setContentIn(true), 100);
          }}
          style={{
            position: "absolute", bottom: 32, right: 28,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(244,199,123,0.3)",
            borderRadius: 20, color: "rgba(244,199,123,0.7)",
            fontFamily: "Jost, sans-serif", fontSize: "0.62rem",
            letterSpacing: "0.28em", textTransform: "uppercase",
            padding: "8px 18px", cursor: "pointer",
            backdropFilter: "blur(8px)",
            animation: "lockFadeUp 1s ease 2s both",
            zIndex: 10,
          }}
        >
          skip ›
        </button>
      )}

      {/* Main content — shown after galaxy */}
      {phase === "content" && (
        <div className="text-center px-6 relative z-10 w-full" style={{ maxWidth: 720 }}>

          {/* Ambient orbs behind content */}
          {[
            { size: 380, left: "2%",  top: "5%",  color: "#4A2A6B", delay: 0   },
            { size: 280, right: "2%", top: "20%", color: "#8E3D63", delay: 1.5 },
            { size: 200, left: "25%", bottom:"8%",color: "#2E3A7A", delay: 0.8 },
          ].map((orb, i) => (
            <div key={i} aria-hidden="true" style={{
              position: "fixed",
              width: orb.size, height: orb.size, borderRadius: "50%",
              background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
              left: orb.left, right: orb.right,
              top: orb.top, bottom: orb.bottom,
              filter: "blur(80px)", opacity: 0.6,
              animation: `drift${(i%2)+1} ${22+i*5}s ease-in-out ${orb.delay}s infinite`,
              pointerEvents: "none", zIndex: 0,
            }} />
          ))}

          <div style={{ position: "relative", zIndex: 2 }}>
            <p className="eyebrow mb-5" style={{
              opacity: contentIn ? 1 : 0,
              transform: contentIn ? "none" : "translateY(20px)",
              transition: "all 1s ease 0.1s",
            }}>
              Girlfriend&rsquo;s Day &nbsp;·&nbsp; for one girl in particular
            </p>

            <h1 className="display mb-2" style={{
              fontSize: "clamp(2rem, 6vw, 4.5rem)",
              opacity: contentIn ? 1 : 0,
              transform: contentIn ? "none" : "translateY(20px)",
              transition: "all 1s ease 0.3s",
            }}>
              Happy Girlfriend&rsquo;s Day,
            </h1>

            {/* Her name — glowing */}
            <div style={{ position: "relative", display: "inline-block", margin: "0 0 24px" }}>
              <div aria-hidden="true" style={{
                position: "absolute", inset: "-30px -60px",
                background: "radial-gradient(ellipse, rgba(240,143,168,0.28), transparent 70%)",
                animation: "nameHaloBreath 3s ease-in-out infinite",
                borderRadius: "50%",
              }} />
              <p className="script rose" style={{
                fontSize: "clamp(3rem, 9vw, 6.5rem)",
                textShadow: "0 0 60px rgba(240,143,168,0.7), 0 0 120px rgba(240,143,168,0.3)",
                opacity: contentIn ? 1 : 0,
                transform: contentIn ? "none" : "translateY(20px) scale(0.9)",
                transition: "all 1.2s cubic-bezier(.2,.8,.3,1) 0.5s",
                lineHeight: 1.1, position: "relative",
              }}>
                {HER_NAME}
              </p>
            </div>

            <p className="soft max-w-md mx-auto leading-relaxed mb-8" style={{
              fontSize: "clamp(0.88rem, 2vw, 1rem)",
              opacity: contentIn ? 1 : 0,
              transform: contentIn ? "none" : "translateY(16px)",
              transition: "all 1s ease 0.75s",
            }}>
              I couldn&rsquo;t fit it in a message. I couldn&rsquo;t fit it in a card.
              So I built you the whole sky instead.
            </p>

            {/* Counter */}
            <div style={{
              opacity: contentIn ? 1 : 0,
              transform: contentIn ? "none" : "translateY(16px)",
              transition: "all 1s ease 1s",
            }}>
              <p className="eyebrow mb-3">We have been us for</p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                {units.map(([value, label]) => (
                  <div key={label} style={{
                    minWidth: 76, padding: "12px 8px",
                    border: "1px solid rgba(244,199,123,0.22)",
                    borderRadius: 6,
                    background: "rgba(255,255,255,0.03)",
                    backdropFilter: "blur(8px)",
                  }}>
                    <span key={value} style={{
                      display: "block",
                      fontFamily: "Cormorant Garamond, serif",
                      fontSize: "1.9rem", lineHeight: 1,
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

            <p className="script" style={{
              fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)",
              color: "var(--lilac)", marginTop: 18,
              opacity: contentIn ? 0.8 : 0,
              transition: "all 1s ease 1.3s",
              textShadow: "0 0 20px rgba(195,166,240,0.4)",
            }}>
              and so, so much more to show you ✦
            </p>
          </div>
        </div>
      )}

      {/* Scroll arrow */}
      {phase === "content" && (
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
            fontSize: "0.52rem", letterSpacing: "0.3em",
            textTransform: "uppercase", color: "var(--gold)", opacity: 0.7,
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