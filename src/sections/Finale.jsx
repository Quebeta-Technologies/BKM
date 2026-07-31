import React, { useEffect, useRef, useState } from "react";
import Reveal from "../components/Reveal.jsx";
import Ornament from "../components/Ornament.jsx";
import { FINALE, YOUR_SIGNOFF, START } from "../data.js";

function Firework({ x, y, onDone }) {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    angle: (i / 20) * Math.PI * 2,
    dist: 60 + Math.random() * 80,
    color: ["#F4C77B","#F08FA8","#C3A6F0","#fff","#FBD5DE"][Math.floor(Math.random() * 5)],
    size: 3 + Math.random() * 4,
    dur: 0.7 + Math.random() * 0.5,
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
    burst(e.clientX, e.clientY, 8 + Math.min(n * 2, 20));
    if (n >= 10 && n % 5 === 0) {
      const positions = Array.from({ length: 6 }, () => ({
        id: ++nextFwId.current,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight * 0.7,
      }));
      setFireworks((fw) => [...fw, ...positions]);
    }
  };

  const removeFw = (id) => setFireworks((fw) => fw.filter((f) => f.id !== id));
  const line = presses === 0 ? "\u00A0" : FINALE.buttonLines[Math.min(presses - 1, FINALE.buttonLines.length - 1)];
  const btnScale = 1 + Math.min(presses * 0.06, 0.6);
  const btnGlow = Math.min(presses * 4, 40);
  const since = new Date(START).toLocaleDateString("en-GB").replace(/\//g, ".");

  return (
    <section className="px-6 py-24 md:py-36 max-w-3xl mx-auto text-center">
      <Reveal>
        <p className="eyebrow mb-8">The last page</p>
        <h2 className="display text-4xl md:text-6xl leading-tight mb-10">
          {FINALE.heading.map((l, i) => (
            <React.Fragment key={i}>{l}{i < FINALE.heading.length - 1 && <br />}</React.Fragment>
          ))}
        </h2>
      </Reveal>

      <Reveal delay={160}>
        <div className="soft leading-relaxed text-sm md:text-base max-w-xl mx-auto">
          {FINALE.paragraphs.map((p, i) => <p key={i} className="mb-5">{p}</p>)}
          <p className="rose">{FINALE.closing}</p>
        </div>
      </Reveal>

      <Reveal delay={300}>
        <Ornament />
        <button className="btn" onClick={press} style={{
          transform: `scale(${btnScale})`,
          boxShadow: presses > 0 ? `0 0 ${btnGlow}px ${btnGlow / 2}px rgba(240,143,168,0.5)` : "none",
          transition: "transform 0.35s cubic-bezier(.2,.8,.3,1), box-shadow 0.35s",
          background: presses >= 7 ? "rgba(240,143,168,0.15)" : "transparent",
        }}>
          {presses === 0 ? "Press if you love me too" : "Press it again"}
        </button>
        {presses >= 10 && (
          <p className="eyebrow mt-4" style={{ color: "var(--rose)", animation: "fadeIn 0.5s ease" }}>
            🎆 SHE SAID YES 10 TIMES 🎆
          </p>
        )}
        <p className="script rose text-3xl md:text-4xl mt-8" style={{ minHeight: 48 }}>{line}</p>
        {presses > 0 && (
          <p className="soft text-xs tracking-widest opacity-60">
            {presses} {presses === 1 ? "heart" : "hearts"} and counting
          </p>
        )}
      </Reveal>

      <Reveal delay={420}>
        <p className="script text-4xl md:text-5xl mt-20 gold">{YOUR_SIGNOFF}</p>
        <p className="eyebrow mt-8 opacity-60">built by hand &middot; one message at a time &middot; since {since}</p>
      </Reveal>

      {fireworks.map((fw) => <Firework key={fw.id} x={fw.x} y={fw.y} onDone={() => removeFw(fw.id)} />)}
    </section>
  );
}