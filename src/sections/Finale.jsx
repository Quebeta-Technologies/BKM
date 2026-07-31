import React, { useEffect, useRef, useState } from "react";
import Reveal from "../components/Reveal.jsx";
import Ornament from "../components/Ornament.jsx";
import { FINALE, YOUR_SIGNOFF, START } from "../data.js";

function Firework({ x, y, onDone }) {
  const particles = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    angle: (i / 22) * Math.PI * 2,
    dist: 55 + Math.random() * 90,
    color: ["#F4C77B","#F08FA8","#C3A6F0","#fff","#FBD5DE"][Math.floor(Math.random() * 5)],
    size: 3 + Math.random() * 4,
    dur: 0.6 + Math.random() * 0.6,
  }));
  useEffect(() => { const t = setTimeout(onDone, 1400); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position: "fixed", left: x, top: y, pointerEvents: "none", zIndex: 100 }}>
      {particles.map((p) => (
        <div key={p.id} style={{
          position: "absolute", width: p.size, height: p.size, borderRadius: "50%",
          background: p.color,
          animation: `fireworkPop ${p.dur}s ease-out forwards`,
          "--fx": `${Math.cos(p.angle) * p.dist}px`,
          "--fy": `${Math.sin(p.angle) * p.dist}px`,
        }} />
      ))}
    </div>
  );
}

export default function Finale({ burst }) {
  const [presses, setPresses] = useState(0);
  const [fireworks, setFireworks] = useState([]);
  const nextFwId = useRef(0);

  const press = (e) => {
    const n = presses + 1;
    setPresses(n);
    burst(e.clientX, e.clientY, 8 + Math.min(n * 2, 22));
    if (n >= 10 && n % 5 === 0) {
      const made = Array.from({ length: 7 }, () => ({
        id: ++nextFwId.current,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight * 0.75,
      }));
      setFireworks((fw) => [...fw, ...made]);
    }
  };

  const removeFw = (id) => setFireworks((fw) => fw.filter((f) => f.id !== id));
  const line = presses === 0 ? "\u00A0" : FINALE.buttonLines[Math.min(presses - 1, FINALE.buttonLines.length - 1)];
  const btnScale = 1 + Math.min(presses * 0.06, 0.65);
  const btnGlow = Math.min(presses * 5, 45);
  const since = new Date(START).toLocaleDateString("en-GB").replace(/\//g, ".");

  return (
    <section style={{ padding: "3rem 1.5rem 5rem", maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
      <Reveal>
        <p className="eyebrow mb-6">The last page</p>
        <h2 className="display leading-tight mb-8" style={{ fontSize: "clamp(1.8rem, 4.5vw, 3.2rem)" }}>
          {FINALE.heading.map((l, i) => (
            <React.Fragment key={i}>{l}{i < FINALE.heading.length - 1 && <br />}</React.Fragment>
          ))}
        </h2>
      </Reveal>

      <Reveal delay={140}>
        <div className="soft leading-relaxed text-sm max-w-lg mx-auto">
          {FINALE.paragraphs.map((p, i) => <p key={i} style={{ marginBottom: "1rem" }}>{p}</p>)}
          <p className="rose">{FINALE.closing}</p>
        </div>
      </Reveal>

      <Reveal delay={280}>
        <Ornament />

        <button className="btn" onClick={press} style={{
          transform: `scale(${btnScale})`,
          boxShadow: presses > 0 ? `0 0 ${btnGlow}px ${btnGlow / 2}px rgba(240,143,168,0.5)` : "none",
          transition: "transform 0.35s cubic-bezier(.2,.8,.3,1), box-shadow 0.35s",
          background: presses >= 7 ? "rgba(240,143,168,0.18)" : "transparent",
          display: "inline-block",
        }}>
          {presses === 0 ? "Press if you love me too" : "Press it again"}
        </button>

        {presses >= 10 && (
          <p className="eyebrow mt-3" style={{ color: "var(--rose)", animation: "lockFadeUp 0.5s ease" }}>
            🎆 she said yes {presses} times 🎆
          </p>
        )}

        <p className="script rose mt-6" style={{ fontSize: "clamp(1.6rem, 4vw, 2.2rem)", minHeight: 44 }}>
          {line}
        </p>

        {presses > 0 && (
          <p className="soft text-xs tracking-widest opacity-55" style={{ marginTop: 8 }}>
            {presses} {presses === 1 ? "heart" : "hearts"} and counting
          </p>
        )}
      </Reveal>

      <Reveal delay={400}>
        <p className="script gold" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", marginTop: 48 }}>
          {YOUR_SIGNOFF}
        </p>
        <p className="eyebrow mt-6 opacity-55">
          built by hand &nbsp;·&nbsp; one message at a time &nbsp;·&nbsp; since {since}
        </p>
      </Reveal>

      {fireworks.map((fw) => (
        <Firework key={fw.id} x={fw.x} y={fw.y} onDone={() => removeFw(fw.id)} />
      ))}
    </section>
  );
}