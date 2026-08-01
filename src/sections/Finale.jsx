import React, { useEffect, useRef, useState, useCallback } from "react";
import Reveal from "../components/Reveal.jsx";
import Ornament from "../components/Ornament.jsx";
import { FINALE, YOUR_SIGNOFF, START } from "../data.js";

/* ── firework burst ─────────────────────────── */
function Firework({ x, y, onDone }) {
  const particles = Array.from({ length: 26 }, (_, i) => ({
    id    : i,
    angle : (i / 26) * Math.PI * 2,
    dist  : 50 + Math.random() * 100,
    color : ["#F4C77B","#F08FA8","#C3A6F0","#fff","#FBD5DE","#FFB3C6"][i % 6],
    size  : 3 + Math.random() * 5,
    dur   : 0.55 + Math.random() * 0.65,
  }));

  useEffect(() => {
    const t = setTimeout(onDone, 1400);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div style={{ position:"fixed", left:x, top:y, pointerEvents:"none", zIndex:200 }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position    : "absolute",
          width       : p.size,
          height      : p.size,
          borderRadius: "50%",
          background  : p.color,
          boxShadow   : `0 0 ${p.size * 2}px ${p.color}`,
          animation   : `fireworkPop ${p.dur}s ease-out forwards`,
          "--fx"      : `${Math.cos(p.angle) * p.dist}px`,
          "--fy"      : `${Math.sin(p.angle) * p.dist}px`,
        }}/>
      ))}
    </div>
  );
}

/* ── floating hearts that rise on press ─────── */
function RisingHeart({ x, y, id, onDone }) {
  const glyph = ["♥","♡","✦","✿","❤"][id % 5];
  const color = ["#F08FA8","#F4C77B","#C3A6F0","#FBD5DE","#FFB3C6"][id % 5];
  useEffect(() => { const t = setTimeout(onDone, 1800); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position    : "fixed",
      left        : x + (Math.random() - 0.5) * 80,
      top         : y,
      fontSize    : `${0.8 + Math.random() * 1}rem`,
      color,
      filter      : `drop-shadow(0 0 6px ${color})`,
      pointerEvents:"none",
      zIndex      : 200,
      animation   : "heartRise 1.8s ease-out forwards",
      "--rdrift"  : `${(Math.random() - 0.5) * 60}px`,
    }}>{glyph}</div>
  );
}

/* ── ambient star field ─────────────────────── */
const STARS = Array.from({ length: 35 }, (_, i) => ({
  left  : `${Math.random() * 100}%`,
  top   : `${Math.random() * 100}%`,
  size  : 0.8 + Math.random() * 1.8,
  dur   : 2 + Math.random() * 4,
  delay : Math.random() * 4,
  color : ["#fff","#F08FA8","#F4C77B","#C3A6F0"][i % 4],
}));

/* ── paragraph with word-by-word reveal ─────── */
function WordReveal({ text, delay = 0, color }) {
  const words = text.split(" ");
  return (
    <p style={{
      color      : color || "rgba(210,200,230,0.78)",
      fontSize   : "clamp(0.88rem,1.8vw,1rem)",
      lineHeight : 1.85,
      fontFamily : "Jost, sans-serif",
      fontWeight : 300,
      marginBottom:"1.1rem",
    }}>
      {words.map((w, i) => (
        <span key={i} style={{
          display    : "inline-block",
          opacity    : 0,
          animation  : `wordFade 0.5s ease ${delay + i * 35}ms forwards`,
          marginRight: "0.28em",
        }}>{w}</span>
      ))}
    </p>
  );
}

/* ── the big press button ───────────────────── */
function PressButton({ presses, onClick }) {
  const [hov, setHov] = useState(false);
  const [pressed, setPressed] = useState(false);
  const label = presses === 0
    ? "Press if you love me too"
    : "Press it again";

  const handleClick = (e) => {
    setPressed(true);
    setTimeout(() => setPressed(false), 200);
    onClick(e);
  };

  const glow = Math.min(presses * 6, 55);
  const scale = pressed ? 0.94 : hov ? 1.05 : 1 + Math.min(presses * 0.04, 0.4);

  return (
    <button
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={handleClick}
      style={{
        position     : "relative",
        padding      : "18px 42px",
        borderRadius : 40,
        border       : `1.5px solid rgba(240,143,168,${hov ? 0.8 : 0.45})`,
        background   : hov
          ? "linear-gradient(135deg,rgba(240,143,168,0.22),rgba(195,166,240,0.15))"
          : presses > 6
            ? "linear-gradient(135deg,rgba(240,143,168,0.15),rgba(195,166,240,0.1))"
            : "rgba(255,255,255,0.04)",
        color        : "#fff",         /* ← always white, never transparent */
        fontFamily   : "Jost, sans-serif",
        fontSize     : "0.75rem",
        letterSpacing: "0.38em",
        textTransform: "uppercase",
        cursor       : "pointer",
        transform    : `scale(${scale})`,
        boxShadow    : presses > 0
          ? `0 0 ${glow}px ${glow / 2}px rgba(240,143,168,0.35), inset 0 0 20px rgba(240,143,168,0.05)`
          : hov
            ? "0 0 20px rgba(240,143,168,0.2)"
            : "none",
        transition   : "all 0.3s cubic-bezier(.2,.8,.3,1)",
        backdropFilter:"blur(12px)",
        outline      : "none",
        minWidth     : 260,
      }}
    >
      {/* inner shimmer on hover */}
      {hov && (
        <div style={{
          position     : "absolute",
          inset        : 0,
          borderRadius : 40,
          background   : "linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.06) 50%,transparent 100%)",
          backgroundSize:"200% auto",
          animation    : "btnShimmer 1.2s linear infinite",
          pointerEvents: "none",
        }}/>
      )}
      <span style={{ position:"relative", zIndex:1 }}>
        {label}
        {presses > 0 && <span style={{ marginLeft:8, opacity:0.7 }}>♥</span>}
      </span>
    </button>
  );
}

/* ── heart counter display ──────────────────── */
function HeartCounter({ count }) {
  const [prevCount, setPrevCount] = useState(count);
  const [bump, setBump] = useState(false);

  useEffect(() => {
    if (count !== prevCount) {
      setBump(true);
      setPrevCount(count);
      setTimeout(() => setBump(false), 350);
    }
  }, [count]);

  if (count === 0) return null;

  return (
    <div style={{
      display       : "flex",
      alignItems    : "center",
      justifyContent: "center",
      gap           : 10,
      marginTop     : 14,
      animation     : "fadeIn 0.4s ease",
    }}>
      <div style={{
        fontFamily : "Cormorant Garamond, serif",
        fontSize   : "1.5rem",
        color      : "#F08FA8",
        textShadow : "0 0 16px rgba(240,143,168,0.6)",
        transform  : bump ? "scale(1.4)" : "scale(1)",
        transition : "transform 0.2s cubic-bezier(.2,.8,.3,1)",
        lineHeight : 1,
      }}>
        {count}
      </div>
      <div style={{
        fontSize     : "0.58rem",
        letterSpacing: "0.3em",
        textTransform: "uppercase",
        color        : "rgba(240,143,168,0.6)",
        fontFamily   : "Jost, sans-serif",
      }}>
        {count === 1 ? "heart" : "hearts"} and counting
      </div>
    </div>
  );
}

/* ── sign-off block ─────────────────────────── */
function SignOff({ since }) {
  const [hov, setHov] = useState(false);
  return (
    <div style={{ marginTop:56, position:"relative" }}>
      {/* decorative line */}
      <div style={{
        display       : "flex",
        alignItems    : "center",
        gap           : 16,
        justifyContent: "center",
        marginBottom  : 32,
      }}>
        <div style={{ width:60, height:1, background:"linear-gradient(90deg,transparent,rgba(244,199,123,0.4))" }}/>
        <span style={{ color:"var(--gold)", fontSize:"0.75rem", opacity:0.6 }}>✦</span>
        <div style={{ width:60, height:1, background:"linear-gradient(90deg,rgba(244,199,123,0.4),transparent)" }}/>
      </div>

      {/* signoff name */}
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{ position:"relative", display:"inline-block", cursor:"default" }}
      >
        {hov && (
          <div style={{
            position    : "absolute",
            inset       : "-20px -40px",
            borderRadius: "50%",
            background  : "radial-gradient(ellipse,rgba(244,199,123,0.2),transparent 70%)",
            animation   : "glowPulse 1.5s ease-in-out infinite",
            pointerEvents:"none",
          }}/>
        )}
        <p style={{
          fontFamily : "Parisienne, cursive",
          fontSize   : "clamp(2.2rem,5.5vw,3.2rem)",
          color      : "var(--gold)",
          textShadow : hov
            ? "0 0 40px rgba(244,199,123,0.7), 0 0 80px rgba(244,199,123,0.3)"
            : "0 0 20px rgba(244,199,123,0.3)",
          transition : "text-shadow 0.4s ease",
          lineHeight : 1.2,
        }}>
          {YOUR_SIGNOFF}
        </p>
      </div>

      {/* built-by footer */}
      <p style={{
        marginTop    : 24,
        fontSize     : "0.65rem",
        letterSpacing: "0.28em",
        textTransform: "uppercase",
        color        : "rgba(220,210,240,0.75)",
        fontFamily   : "Jost, sans-serif",
        textShadow   : "0 0 10px rgba(255,255,255,0.1)",
      }}>
        built by hand
        <span style={{ color:"var(--gold)", opacity:0.9, margin:"0 12px" }}>·</span>
        one message at a time
        <span style={{ color:"var(--gold)", opacity:0.9, margin:"0 12px" }}>·</span>
        since {since}
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
export default function Finale({ burst }) {
  const [presses, setPresses]       = useState(0);
  const [fireworks, setFireworks]   = useState([]);
  const [hearts, setHearts]         = useState([]);
  const [lineIndex, setLineIndex]   = useState(-1);
  const [showLine, setShowLine]     = useState(false);
  const [textPhase, setTextPhase]   = useState(0); // 0=hidden 1=visible
  const nextFwId  = useRef(0);
  const nextHtId  = useRef(0);

  const since = new Date(START).toLocaleDateString("en-GB").replace(/\//g, ".");

  const press = useCallback((e) => {
    const n = presses + 1;
    setPresses(n);

    /* button line */
    const li = Math.min(n - 1, FINALE.buttonLines.length - 1);
    setLineIndex(li);
    setShowLine(false);
    setTimeout(() => setShowLine(true), 80);

    /* burst from global burst prop */
    burst(e.clientX, e.clientY, 8 + Math.min(n * 2, 22));

    /* rising hearts from button */
    const newHearts = Array.from({ length: 4 + Math.min(n, 8) }, (_, i) => ({
      id: nextHtId.current++,
      x : e.clientX,
      y : e.clientY,
    }));
    setHearts(prev => [...prev, ...newHearts]);

    /* fireworks every 5 presses after 10 */
    if (n >= 10 && n % 5 === 0) {
      const made = Array.from({ length: 8 }, () => ({
        id: nextFwId.current++,
        x : 80 + Math.random() * (window.innerWidth - 160),
        y : 60 + Math.random() * (window.innerHeight * 0.6),
      }));
      setFireworks(fw => [...fw, ...made]);
    }
  }, [presses, burst]);

  const removeFw = useCallback((id) => setFireworks(fw => fw.filter(f => f.id !== id)), []);
  const removeHt = useCallback((id) => setHearts(h  => h.filter(x => x.id !== id)),   []);

  const currentLine = lineIndex >= 0 ? FINALE.buttonLines[lineIndex] : null;

  return (
    <section style={{
      padding   : "4rem 1.25rem 6rem",
      maxWidth  : 700,
      margin    : "0 auto",
      textAlign : "center",
      position  : "relative",
    }}>

      <style>{`
        @keyframes wordFade {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes heartRise {
          0%   { opacity:1; transform:translateY(0) translateX(0) scale(1); }
          100% { opacity:0; transform:translateY(-120px) translateX(var(--rdrift)) scale(0.4); }
        }
        @keyframes btnShimmer {
          from { background-position:200% center; }
          to   { background-position:-200% center; }
        }
        @keyframes glowPulse {
          0%,100% { opacity:0.7; transform:scale(1); }
          50%     { opacity:1;   transform:scale(1.1); }
        }
        @keyframes lineReveal {
          from { opacity:0; transform:translateY(12px) scale(0.96); }
          to   { opacity:1; transform:translateY(0)    scale(1); }
        }
        @keyframes fadeIn {
          from { opacity:0; }
          to   { opacity:1; }
        }
        @keyframes starBlink {
          0%,100% { opacity:0.1; }
          50%     { opacity:0.7; }
        }
        @keyframes headingGlow {
          0%,100% { text-shadow:none; }
          50%     { text-shadow:0 0 40px rgba(240,143,168,0.2); }
        }
        @keyframes yesFloat {
          0%   { opacity:0; transform:scale(0.7) translateY(10px); }
          15%  { opacity:1; transform:scale(1.1) translateY(0); }
          85%  { opacity:1; transform:scale(1)   translateY(0); }
          100% { opacity:0; transform:scale(0.95) translateY(-6px); }
        }
        @keyframes closingPulse {
          0%,100% { text-shadow:0 0 20px rgba(240,143,168,0.3); }
          50%     { text-shadow:0 0 40px rgba(240,143,168,0.65), 0 0 80px rgba(195,166,240,0.2); }
        }
      `}</style>

      {/* ambient stars */}
      <div aria-hidden="true" style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden" }}>
        {STARS.map((s,i) => (
          <div key={i} style={{
            position    : "absolute",
            left        : s.left, top: s.top,
            width       : s.size, height: s.size,
            borderRadius: "50%",
            background  : s.color,
            animation   : `starBlink ${s.dur}s ease-in-out ${s.delay}s infinite`,
            boxShadow   : `0 0 ${s.size * 2}px ${s.color}`,
          }}/>
        ))}
      </div>

      {/* fireworks + rising hearts */}
      {fireworks.map(fw => (
        <Firework key={fw.id} x={fw.x} y={fw.y} onDone={() => removeFw(fw.id)}/>
      ))}
      {hearts.map(h => (
        <RisingHeart key={h.id} id={h.id} x={h.x} y={h.y} onDone={() => removeHt(h.id)}/>
      ))}

      {/* ── heading ── */}
      <Reveal>
        <p className="eyebrow mb-6" style={{ letterSpacing:"0.38em" }}>The last page</p>
        <h2 style={{
          fontFamily  : "Cormorant Garamond, serif",
          fontSize    : "clamp(1.9rem,4.5vw,3.2rem)",
          fontWeight  : 300,
          color       : "var(--cream)",
          lineHeight  : 1.35,
          marginBottom: 32,
          animation   : "headingGlow 5s ease-in-out infinite",
        }}>
          {FINALE.heading.map((l, i) => (
            <React.Fragment key={i}>
              {l}{i < FINALE.heading.length - 1 && <br/>}
            </React.Fragment>
          ))}
        </h2>
      </Reveal>

      {/* ── paragraphs — word by word ── */}
      <Reveal delay={120}>
        <div style={{ maxWidth:560, margin:"0 auto", textAlign:"left" }}>
          {FINALE.paragraphs.map((p, i) => (
            <WordReveal key={i} text={p} delay={i * 400}/>
          ))}
          <WordReveal
            text={FINALE.closing}
            delay={FINALE.paragraphs.length * 400}
            color="#F08FA8"
          />
        </div>
      </Reveal>

      {/* ── ornament ── */}
      <Reveal delay={260}>
        <div style={{ margin:"32px 0 28px" }}>
          <Ornament/>
        </div>

        {/* ── press button ── */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14 }}>
        <PressButton presses={presses} onClick={press}/>

        {/* ── "she said yes N times" badge ── */}
        {presses >= 10 && (
          <div style={{
            marginTop  : 14,
            display    : "inline-flex",
            alignItems : "center",
            gap        : 8,
            padding    : "8px 20px",
            borderRadius: 20,
            background : "rgba(240,143,168,0.1)",
            border     : "1px solid rgba(240,143,168,0.3)",
            animation  : "yesFloat 0.5s ease",
          }}>
            <span style={{ fontSize:"0.65rem", letterSpacing:"0.28em",
              textTransform:"uppercase", color:"#F08FA8",
              fontFamily:"Jost,sans-serif" }}>
              🎆 she said yes {presses} times 🎆
            </span>
          </div>
        )}
        </div>

        {/* ── button response line ── */}
        <div style={{ minHeight:56, marginTop:4, display:"flex",
          alignItems:"center", justifyContent:"center" }}>
          {showLine && currentLine && (
            <p key={lineIndex} style={{
              fontFamily : "Parisienne, cursive",
              fontSize   : "clamp(1.5rem,3.5vw,2rem)",
              color      : "#F08FA8",
              textShadow : "0 0 24px rgba(240,143,168,0.55)",
              animation  : "lineReveal 0.5s cubic-bezier(.2,.8,.3,1) both",
              lineHeight : 1.3,
            }}>
              {currentLine}
            </p>
          )}
        </div>

        {/* ── heart counter ── */}
        <HeartCounter count={presses}/>
      </Reveal>

      {/* ── sign off ── */}
      <Reveal delay={400}>
        <SignOff since={since}/>
      </Reveal>
    </section>
  );
}