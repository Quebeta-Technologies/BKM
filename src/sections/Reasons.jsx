import React, { useRef, useState } from "react";
import Reveal from "../components/Reveal.jsx";
import { REASONS } from "../data.js";

export default function Reasons({ burst }) {
  const [index, setIndex] = useState(0);
  const [drawn, setDrawn] = useState(1);
  const [flipped, setFlipped] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const touchStart = useRef(null);

  const go = (dir, e) => {
    setFlipped(true);
    setTimeout(() => {
      setIndex((i) => (i + dir + REASONS.length) % REASONS.length);
      setDrawn((d) => d + 1);
      setFlipped(false);
      setAnimKey((k) => k + 1);
    }, 280);
    if (e) burst(e.clientX, e.clientY, 5);
  };

  const handleTouchStart = (e) => { touchStart.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1, null);
    touchStart.current = null;
  };

  return (
    <section className="px-6 py-24 md:py-32 max-w-3xl mx-auto text-center">
      <Reveal>
        <p className="eyebrow mb-6">Chapter four</p>
        <h2 className="display text-4xl md:text-6xl mb-4">Reasons, drawn at random</h2>
        <p className="soft max-w-md mx-auto text-sm md:text-base">
          There are {REASONS.length} in here. There are more than {REASONS.length} in me.
        </p>
        <p className="soft text-xs mt-2 opacity-50">swipe left/right or use the arrows</p>
      </Reveal>

      <Reveal delay={180}>
        <div style={{ perspective: 800, marginTop: 48 }}
          onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <div key={animKey} style={{
            transformStyle: "preserve-3d",
            animation: flipped ? "cardFlipOut 0.28s ease-in forwards" : "cardFlipIn 0.35s ease-out",
          }}>
            <div className="card3d px-8 py-14 md:px-14 md:py-20">
              <p className="gold text-xs tracking-widest mb-6">
                NO.&nbsp;{String(index + 1).padStart(2, "0")}
                <span className="opacity-40 ml-3">/ {REASONS.length}</span>
              </p>
              <p className="display text-2xl md:text-4xl leading-snug">{REASONS[index]}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 mt-10">
          <button className="btn" style={{ padding: "12px 20px", fontSize: "1.1rem" }}
            onClick={(e) => go(-1, e)} aria-label="Previous">←</button>
          <button className="btn" onClick={(e) => go(1, e)}>Draw another</button>
          <button className="btn" style={{ padding: "12px 20px", fontSize: "1.1rem" }}
            onClick={(e) => go(1, e)} aria-label="Next">→</button>
        </div>

        <div className="flex justify-center gap-2 mt-6 flex-wrap" style={{ maxWidth: 300, margin: "24px auto 0" }}>
          {REASONS.map((_, i) => (
            <div key={i} onClick={() => { setIndex(i); setAnimKey((k) => k + 1); }}
              style={{
                width: i === index ? 18 : 6, height: 6, borderRadius: 3,
                background: i === index ? "var(--rose)" : "rgba(255,255,255,0.2)",
                cursor: "pointer", transition: "all 0.3s ease",
              }} />
          ))}
        </div>

        <p className="soft text-xs mt-5 opacity-60 tracking-widest">{drawn} drawn so far</p>
      </Reveal>
    </section>
  );
}