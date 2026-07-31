import React, { useRef, useState } from "react";
import Reveal from "../components/Reveal.jsx";
import { PHOTOS } from "../data.js";

function DraggablePola({ photo }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [lifted, setLifted] = useState(false);
  const startRef = useRef(null);

  const onStart = (e) => {
    e.preventDefault();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    startRef.current = { mx: cx - pos.x, my: cy - pos.y };
    setDragging(true);
    setLifted(true);
  };

  const onMove = (e) => {
    if (!dragging || !startRef.current) return;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    setPos({ x: cx - startRef.current.mx, y: cy - startRef.current.my });
  };

  const onEnd = () => {
    setDragging(false);
    setTimeout(() => setLifted(false), 300);
  };

  return (
    <figure
      className="pola"
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px) rotate(${dragging ? 0 : photo.tilt}deg) ${lifted ? "scale(1.08)" : ""}`,
        transition: dragging ? "none" : "transform 0.45s cubic-bezier(.2,.8,.3,1), box-shadow 0.4s",
        boxShadow: lifted ? "0 40px 80px -20px rgba(240,143,168,0.5), 0 0 0 1px rgba(244,199,123,0.2)" : undefined,
        zIndex: lifted ? 20 : 1,
        cursor: dragging ? "grabbing" : "grab",
        position: "relative", userSelect: "none",
      }}
      onMouseDown={onStart} onMouseMove={onMove} onMouseUp={onEnd} onMouseLeave={onEnd}
      onTouchStart={onStart} onTouchMove={onMove} onTouchEnd={onEnd}
    >
      <div className="ph">
        {photo.src
          ? <img src={photo.src} alt={photo.caption} loading="lazy" draggable={false} />
          : <span style={{ color: "rgba(251,213,222,.5)", fontSize: 30, pointerEvents: "none" }}>♥</span>}
      </div>
      <figcaption>{photo.caption}</figcaption>
    </figure>
  );
}

export default function Moments() {
  return (
    <section className="px-6 py-24 md:py-32 max-w-6xl mx-auto">
      <Reveal className="text-center">
        <p className="eyebrow mb-6">Chapter five</p>
        <h2 className="display text-4xl md:text-6xl mb-4">Moments I kept</h2>
        <p className="soft max-w-md mx-auto text-sm md:text-base">The camera roll I&rsquo;d save first.</p>
        <p className="soft text-xs mt-2 opacity-50">pick them up · move them around</p>
      </Reveal>
      <div className="mt-14 grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-10" style={{ userSelect: "none" }}>
        {PHOTOS.map((p, i) => (
          <Reveal key={i} delay={i * 90}>
            <DraggablePola photo={p} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}