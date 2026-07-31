import React, { useState } from "react";
import Reveal from "../components/Reveal.jsx";
import { LETTERS } from "../data.js";

function Confetti({ active }) {
  if (!active) return null;
  const pieces = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 300,
    y: -(80 + Math.random() * 160),
    rot: Math.random() * 720,
    color: ["#F4C77B","#F08FA8","#C3A6F0","#FBD5DE","#fff"][Math.floor(Math.random() * 5)],
    size: 5 + Math.random() * 7,
    dur: 0.8 + Math.random() * 0.7,
    delay: Math.random() * 0.3,
    shape: Math.random() > 0.5 ? "circle" : "rect",
  }));
  return (
    <div style={{ position: "absolute", left: "50%", top: "50%", pointerEvents: "none", zIndex: 10 }}>
      {pieces.map((p) => (
        <div key={p.id} style={{
          position: "absolute",
          width: p.shape === "circle" ? p.size : p.size * 1.4,
          height: p.size,
          borderRadius: p.shape === "circle" ? "50%" : 2,
          background: p.color,
          animation: `confettiPop ${p.dur}s ease-out ${p.delay}s forwards`,
          "--cx": `${p.x}px`, "--cy": `${p.y}px`, "--cr": `${p.rot}deg`,
          opacity: 0,
        }} />
      ))}
    </div>
  );
}

export default function Letters({ onOpen }) {
  const [dragging, setDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [positions, setPositions] = useState({});
  const [confetti, setConfetti] = useState(null);

  const startDrag = (e, id) => {
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const pos = positions[id] || { x: 0, y: 0 };
    setDragging(id);
    setDragOffset({ x: clientX - pos.x, y: clientY - pos.y });
  };

  const onDragMove = (e) => {
    if (!dragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setPositions((p) => ({ ...p, [dragging]: { x: clientX - dragOffset.x, y: clientY - dragOffset.y } }));
  };

  const endDrag = () => setDragging(null);

  const openLetter = (letter) => {
    setConfetti(letter.id);
    setTimeout(() => setConfetti(null), 1200);
    onOpen(letter);
  };

  return (
    <section className="px-6 py-24 md:py-32 max-w-5xl mx-auto"
      onMouseMove={onDragMove} onMouseUp={endDrag}
      onTouchMove={onDragMove} onTouchEnd={endDrag}>
      <Reveal className="text-center">
        <p className="eyebrow mb-6">Chapter three</p>
        <h2 className="display text-4xl md:text-6xl mb-4">Letters, sealed for you</h2>
        <p className="soft max-w-md mx-auto text-sm md:text-base">Open one now. Save the rest for when you need them.</p>
        <p className="soft text-xs mt-2 opacity-50">drag them around · click to open</p>
      </Reveal>

      <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
        {LETTERS.map((letter, i) => {
          const pos = positions[letter.id] || { x: 0, y: 0 };
          const isDragging = dragging === letter.id;
          return (
            <Reveal key={letter.id} delay={i * 120}>
              <div style={{ position: "relative" }}>
                <div
                  className="env"
                  style={{
                    aspectRatio: "1.5 / 1",
                    transform: `translate(${pos.x}px, ${pos.y}px) rotate(${isDragging ? 4 : 0}deg) ${isDragging ? "scale(1.06)" : ""}`,
                    transition: isDragging ? "none" : "transform 0.4s cubic-bezier(.2,.8,.3,1), box-shadow 0.4s",
                    boxShadow: isDragging ? "0 30px 70px -20px rgba(240,143,168,0.6)" : undefined,
                    cursor: isDragging ? "grabbing" : "grab",
                    zIndex: isDragging ? 20 : 1, position: "relative",
                  }}
                  tabIndex={0} role="button"
                  aria-label={`Open letter: ${letter.seal}`}
                  onMouseDown={(e) => startDrag(e, letter.id)}
                  onTouchStart={(e) => startDrag(e, letter.id)}
                  onClick={() => !isDragging && openLetter(letter)}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), openLetter(letter))}
                >
                  <div className="flap" />
                  <div className="seal">♥</div>
                  <div className="env-cap">{letter.seal}</div>
                </div>
                <Confetti active={confetti === letter.id} />
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}