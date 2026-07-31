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
    if (e) burst(e.clientX, e.clientY, 6);
  };

  const handleTouchStart = (e) => { touchStart.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1, null);
    touchStart.current = null;
  };

  return (
    <section style={{ padding: "3rem 1.5rem", maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
      <Reveal>
        <p className="eyebrow mb-4">Chapter four</p>
        <h2 className="display mb-3" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
          Reasons, drawn at random
        </h2>
        <p className="soft text-sm max-w-sm mx-auto">
          There are {REASONS.length} in here. There are more than {REASONS.length} in me.
        </p>
        <p className="soft text-xs mt-1 opacity-50">swipe left/right · use arrows</p>
      </Reveal>

      <Reveal delay={160}>
        {/* 3D flip card */}
        <div style={{ perspective: 900, marginTop: 28 }}
          onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <div key={animKey} style={{
            transformStyle: "preserve-3d",
            animation: flipped ? "cardFlipOut 0.28s ease-in forwards" : "cardFlipIn 0.35s ease-out",
          }}>
            <div className="card3d" style={{ padding: "3rem 2.5rem" }}>
              <p className="gold text-xs tracking-widest mb-5">
                NO.&nbsp;{String(index + 1).padStart(2, "0")}
                <span style={{ opacity: 0.35, marginLeft: 10 }}>/ {REASONS.length}</span>
              </p>
              <p className="display leading-snug" style={{ fontSize: "clamp(1.3rem, 3vw, 2rem)" }}>
                {REASONS[index]}
              </p>
            </div>
          </div>
        </div>

        {/* Arrows */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 24 }}>
          <button className="btn" style={{ padding: "11px 18px", fontSize: "1rem" }}
            onClick={(e) => go(-1, e)} aria-label="Previous">←</button>
          <button className="btn" onClick={(e) => go(1, e)}>Draw another</button>
          <button className="btn" style={{ padding: "11px 18px", fontSize: "1rem" }}
            onClick={(e) => go(1, e)} aria-label="Next">→</button>
        </div>

        {/* Progress dots */}
        <div style={{
          display: "flex", justifyContent: "center", gap: 6, flexWrap: "wrap",
          maxWidth: 280, margin: "16px auto 0",
        }}>
          {REASONS.map((_, i) => (
            <div key={i} onClick={() => { setIndex(i); setAnimKey((k) => k + 1); }}
              style={{