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
    const p = Array.from({ length: 14 }, (_, i) => ({
      id: i,
      angle: (i / 14) * Math.PI * 2,
      dist: 28 + Math.random() * 45,
      size: 2 + Math.random() * 3,
      dur: 0.5 + Math.random() * 0.6,
    }));
    setParts(p);
    const t = setTimeout(() => setParts([]), 1200);
    return () => clearTimeout(t);
  }, [active]);

  return (
    <>
      {parts.map((p) => (
        <circle key={p.id} cx={x} cy={y} r={p.size} fill="#F4C77B"
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
  const [ref, on] = useReveal(0.15);
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
    <section style={{ padding: "3rem 1.5rem", maxWidth: 900, margin: "0 auto" }}>
      <Reveal className="text-center">
        <p className="eyebrow mb-4">Chapter one</p>
        <h2 className="display mb-3" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
          The constellation of us
        </h2>
        <p className="soft max-w-md mx-auto text-sm leading-relaxed mb-1">
          {MILESTONES.length} dates. {MILESTONES.length} stars. Touch one.
        </p>
      </Reveal>

      <div ref={ref} className={`cons ${on ? "on" : ""}`} style={{ marginTop: 32 }}>
        <svg
          viewBox="0 0 800 400"
          className="w-full"
          role="group"
          style={{ overflow: "visible" }}
        >
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
              <feGaussianBlur stdDeviation="12" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          <path d={buildPath(MILESTONES)} className="cons-line" />
          <path
            d={`M ${last.x} ${last.y} C ${last.x+30} ${last.y+28}, ${last.x+55} ${last.y+53}, ${last.x+72} ${last.y+78}`}
            fill="none" stroke="#C3A6F0" strokeOpacity=".35" strokeWidth="1" strokeDasharray="3 7"
          />
          <circle cx={last.x+76} cy={last.y+86} r="3" fill="#C3A6F0" className="pulse" />
          <text x={last.x+76} y={last.y+114} textAnchor="middle" className="star-lab" opacity=".6">
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
                <circle cx={m.x} cy={m.y} r="36" fill="transparent" />

                {isSel && (
                  <circle
                    cx={m.x} cy={m.y} r="22"
                    fill="none" stroke="#F08FA8" strokeOpacity=".5" strokeWidth="1"
                    style={{ animation: "starPulseRing 1.6s ease-out infinite" }}
                  />
                )}

                <circle
                  className="star-halo"
                  cx={m.x} cy={m.y}
                  r={isSel ? 18 : 12}
                  fill={isSel ? "#F08FA8" : "#F4C77B"}
                  opacity={isSel ? 0.28 : 0.1}
                />
                <circle
                  className="star-core"
                  cx={m.x} cy={m.y}
                  r={isSel ? 9 : 5}
                  fill={isSel ? "#FFE9EF" : "#F4C77B"}
                  filter={isSel ? "url(#glow2)" : "url(#glow)"}
                />

                <Sparkles x={m.x} y={m.y} active={sparked === m.id} />

                <text
                  x={m.x} y={above ? m.y - 38 : m.y + 46}
                  textAnchor="middle" className="star-lab"
                  opacity={isSel ? 1 : 0.6}
                >
                  {m.label}
                </text>
                <text
                  x={m.x} y={above ? m.y - 20 : m.y + 30}
                  textAnchor="middle" className="star-date"
                  opacity={isSel ? 1 : 0.5}
                >
                  {shortDate(m.date)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div
        className="memo px-5 md:px-8 py-6"
        key={selected}
        style={{ marginTop: 12, animation: "memoFadeIn 0.5s ease", borderRadius: 4 }}
      >
        <p className="eyebrow mb-2">
          {active.where}
          {gap !== null && <span className="soft"> &nbsp;·&nbsp; {gap} days later</span>}
        </p>
        <h3 className="display mb-1" style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)" }}>
          {active.label}
        </h3>
        <p className="script rose mb-4" style={{ fontSize: "1.5rem" }}>{fmtDate(active.date)}</p>
        <p className="soft leading-relaxed max-w-2xl text-sm">{active.text}</p>
      </div>
    </section>
  );
}