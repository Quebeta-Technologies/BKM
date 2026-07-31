import React, { useEffect, useState } from "react";
import Reveal from "../components/Reveal.jsx";
import useReveal from "../lib/useReveal.js";
import { MILESTONES } from "../data.js";
import { fmtDate, shortDate, daysBetween } from "../lib/utils.js";

function buildPath(points) {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i], b = points[i + 1];
    const cx = (a.x + b.x) / 2;
    d += ` Q ${cx} ${a.y}, ${cx} ${(a.y + b.y) / 2} T ${b.x} ${b.y}`;
  }
  return d;
}

function Sparkles({ x, y, active }) {
  const [parts, setParts] = useState([]);
  useEffect(() => {
    if (!active) return;
    const p = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      angle: (i / 12) * Math.PI * 2,
      dist: 30 + Math.random() * 40,
      size: 2 + Math.random() * 3,
      dur: 0.6 + Math.random() * 0.5,
    }));
    setParts(p);
    const t = setTimeout(() => setParts([]), 1200);
    return () => clearTimeout(t);
  }, [active]);

  return (
    <>
      {parts.map((p) => (
        <circle
          key={p.id}
          cx={x}
          cy={y}
          r={p.size}
          fill="#F4C77B"
          style={{
            animation: `sparkOut ${p.dur}s ease-out forwards`,
            "--tx": `${Math.cos(p.angle) * p.dist}px`,
            "--ty": `${Math.sin(p.angle) * p.dist}px`,
          }}
        />
      ))}
    </>
  );
}

export default function Constellation() {
  const [ref, on] = useReveal(0.2);
  const [selected, setSelected] = useState(MILESTONES[0].id);
  const [sparked, setSparked] = useState(null);

  const index = MILESTONES.findIndex((m) => m.id === selected);
  const active = MILESTONES[index];
  const gap = index > 0 ? daysBetween(MILESTONES[index - 1].date, active.date) : null;
  const last = MILESTONES[MILESTONES.length - 1];

  const select = (id) => {
    setSelected(id);
    setSparked(id);
    setTimeout(() => setSparked(null), 1200);
  };

  return (
    <section className="px-6 py-24 md:py-32 max-w-5xl mx-auto">
      <Reveal className="text-center">
        <p className="eyebrow mb-6">Chapter one</p>
        <h2 className="display text-4xl md:text-6xl mb-4">The constellation of us</h2>
        <p className="soft max-w-md mx-auto text-sm md:text-base leading-relaxed">
          {MILESTONES.length} dates. {MILESTONES.length} stars. Touch one.
        </p>
      </Reveal>

      <div ref={ref} className={`cons ${on ? "on" : ""} mt-12`}>
        <svg viewBox="0 0 800 400" className="w-full" role="group" aria-label="Constellation of our milestone dates">
          <defs>
            <linearGradient id="gg" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#F08FA8" stopOpacity=".35" />
              <stop offset="50%" stopColor="#F4C77B" stopOpacity=".9" />
              <stop offset="100%" stopColor="#C3A6F0" stopOpacity=".5" />
            </linearGradient>
            <filter id="glow" x="-120%" y="-120%" width="340%" height="340%">
              <feGaussianBlur stdDeviation="6" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="glow2" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur stdDeviation="10" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          <path d={buildPath(MILESTONES)} className="cons-line" />
          <path
            d={`M ${last.x} ${last.y} C ${last.x + 30} ${last.y + 28}, ${last.x + 55} ${last.y + 53}, ${last.x + 72} ${last.y + 78}`}
            fill="none" stroke="#C3A6F0" strokeOpacity=".35" strokeWidth="1" strokeDasharray="3 7"
          />
          <circle cx={last.x + 76} cy={last.y + 86} r="3" fill="#C3A6F0" className="pulse" />
          <text x={last.x + 76} y={last.y + 114} textAnchor="middle" className="star-lab" opacity=".6">
            and everything after
          </text>

          {MILESTONES.map((m) => {
            const isSel = m.id === selected;
            const above = m.y < 200;
            return (
              <g
                key={m.id}
                className="star-hit"
                tabIndex={0}
                role="button"
                aria-pressed={isSel}
                aria-label={`${m.label}, ${fmtDate(m.date)}`}
                onClick={() => select(m.id)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), select(m.id))}
              >
                {isSel && (
                  <circle cx={m.x} cy={m.y} r="28"
                    fill="none" stroke="#F08FA8" strokeOpacity=".5" strokeWidth="1"
                    style={{ animation: "starPulseRing 1.6s ease-out infinite" }}
                  />
                )}
                <circle className="star-halo" cx={m.x} cy={m.y}
                  r={isSel ? 20 : 12} fill={isSel ? "#F08FA8" : "#F4C77B"} opacity={isSel ? 0.28 : 0.1} />
                <circle className="star-core" cx={m.x} cy={m.y}
                  r={isSel ? 9 : 5} fill={isSel ? "#FFE9EF" : "#F4C77B"}
                  filter={isSel ? "url(#glow2)" : "url(#glow)"} />
                <Sparkles x={m.x} y={m.y} active={sparked === m.id} />
                <text x={m.x} y={above ? m.y - 38 : m.y + 46} textAnchor="middle"
                  className="star-lab" opacity={isSel ? 1 : 0.6}>{m.label}</text>
                <text x={m.x} y={above ? m.y - 20 : m.y + 30} textAnchor="middle"
                  className="star-date" opacity={isSel ? 1 : 0.5}>{shortDate(m.date)}</text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="memo mt-4 px-6 md:px-10 py-8" key={selected} style={{ animation: "memoFadeIn 0.5s ease" }}>
        <p className="eyebrow mb-3">
          {active.where}
          {gap !== null && <span className="soft"> &nbsp;&middot;&nbsp; {gap} days later</span>}
        </p>
        <h3 className="display text-3xl md:text-4xl mb-1">{active.label}</h3>
        <p className="script rose text-2xl mb-6">{fmtDate(active.date)}</p>
        <p className="soft leading-relaxed max-w-2xl text-sm md:text-base">{active.text}</p>
      </div>
    </section>
  );
}